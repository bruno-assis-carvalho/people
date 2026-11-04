import type { ErrorRequestHandler } from "express";
import { context, SpanStatusCode, trace } from "@opentelemetry/api";
import type { ValidationError } from "class-validator";
import mongoose from "mongoose";
import { AppError } from "../errors/app-error";
import { ERROR_MESSAGES, ErrorCode } from "../errors/error-messages";
import { BadRequestError } from "routing-controllers";
import { logger } from "../../observability/logger";

const isDuplicateKeyError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false;
  }

  return "code" in error && error.code === 11000;
};

const getValidationDetails = (error: BadRequestError) => {
  const validationErrors = (
    error as BadRequestError & { errors?: ValidationError[] }
  ).errors;
  if (!validationErrors) {
    return undefined;
  }

  return validationErrors.map(({ property, constraints }) => ({
    property,
    constraints: Object.values(constraints ?? {}),
  }));
};

type ErrorResponseData = {
  statusCode: number;
  code: ErrorCode;
  message: string;
  details?: unknown;
};

const getAppErrorResponse = (error: unknown): ErrorResponseData | undefined => {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
      ...(error.details === undefined ? {} : { details: error.details }),
    };
  }
};

const getDuplicateKeyResponse = (
  error: unknown,
): ErrorResponseData | undefined => {
  if (isDuplicateKeyError(error)) {
    return {
      statusCode: 409,
      code: "PERSON_EMAIL_ALREADY_EXISTS",
      message: ERROR_MESSAGES.PERSON_EMAIL_ALREADY_EXISTS,
    };
  }
};

const getMongooseErrorResponse = (
  error: unknown,
): ErrorResponseData | undefined => {
  if (
    error instanceof mongoose.Error.ValidationError ||
    error instanceof mongoose.Error.CastError
  ) {
    return {
      statusCode: 400,
      code: "INVALID_REQUEST",
      message: ERROR_MESSAGES.INVALID_REQUEST,
    };
  }
};

const getValidationErrorResponse = (
  error: unknown,
): ErrorResponseData | undefined => {
  if (error instanceof BadRequestError) {
    const details = getValidationDetails(error);
    return {
      statusCode: 400,
      code: "INVALID_REQUEST",
      message: ERROR_MESSAGES.INVALID_REQUEST,
      ...(details ? { details } : {}),
    };
  }
};

const getAuthorizationErrorResponse = (
  error: unknown,
): ErrorResponseData | undefined => {
  const status = getHttpStatus(error);
  if (status === 401) {
    return {
      statusCode: 401,
      code: "UNAUTHORIZED",
      message: ERROR_MESSAGES.UNAUTHORIZED,
    };
  }
  if (status === 403) {
    return {
      statusCode: 403,
      code: "FORBIDDEN",
      message: ERROR_MESSAGES.FORBIDDEN,
    };
  }
};

const getHttpStatus = (error: unknown): number | undefined => {
  if (!error || typeof error !== "object") {
    return undefined;
  }
  if ("status" in error && typeof error.status === "number") {
    return error.status;
  }
  if ("statusCode" in error && typeof error.statusCode === "number") {
    return error.statusCode;
  }
};

const toError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error;
  }
  if (typeof error === "string") {
    return new Error(error);
  }
  return new Error("A non-Error value was thrown");
};

const getErrorResponse = (error: unknown): ErrorResponseData =>
  getAppErrorResponse(error) ??
  getDuplicateKeyResponse(error) ??
  getMongooseErrorResponse(error) ??
  getValidationErrorResponse(error) ??
  getAuthorizationErrorResponse(error) ?? {
    statusCode: 500,
    code: "INTERNAL_SERVER_ERROR",
    message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
  };

export const errorHandler: ErrorRequestHandler = (
  error,
  request,
  response,
  next,
) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  const errorResponse = getErrorResponse(error);
  const span = trace.getSpan(context.active());
  span?.setStatus({
    code: SpanStatusCode.ERROR,
    message: errorResponse.message,
  });
  span?.setAttribute("error.code", errorResponse.code);
  span?.setAttribute("http.status_code", errorResponse.statusCode);
  span?.recordException(toError(error));

  logger.error(
    {
      method: request.method,
      route: request.route?.path || "unmatched",
      status_code: errorResponse.statusCode,
      error_code: errorResponse.code,
    },
    "Request failed",
  );

  response.status(errorResponse.statusCode).json({
    message: errorResponse.message,
    code: errorResponse.code,
    ...(errorResponse.details === undefined
      ? {}
      : { details: errorResponse.details }),
  });
};
