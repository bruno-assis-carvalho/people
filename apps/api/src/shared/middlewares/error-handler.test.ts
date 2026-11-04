import assert from "node:assert/strict";
import test from "node:test";
import { BadRequestError } from "routing-controllers";
import { AppError } from "../errors/app-error";
import { logger } from "../../observability/logger";
import { errorHandler } from "./error-handler";

type ResponseMock = {
  headersSent: boolean;
  statusCode?: number;
  body?: unknown;
  status: (statusCode: number) => ResponseMock;
  json: (body: unknown) => ResponseMock;
};

const createResponse = (headersSent = false): ResponseMock => {
  const response: ResponseMock = {
    headersSent,
    status(statusCode: number) {
      response.statusCode = statusCode;
      return response;
    },
    json(body: unknown) {
      response.body = body;
      return response;
    },
  };

  return response;
};

const request = {
  method: "GET",
  originalUrl: "/people/invalid",
};

const invokeHandler = (
  error: unknown,
  response: ResponseMock,
  next: (error: unknown) => void,
): void => {
  const originalLevel = logger.level;
  logger.level = "silent";

  try {
    errorHandler(error, request as never, response as never, next as never);
  } finally {
    logger.level = originalLevel;
  }
};

test("returns the cataloged AppError status and code", () => {
  const response = createResponse();

  invokeHandler(
    new AppError("PERSON_NOT_FOUND", 404),
    response,
    () => undefined,
  );

  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.body, {
    message: "Person not found",
    code: "PERSON_NOT_FOUND",
  });
});

test("returns safe class-validator details as a bad request", () => {
  const response = createResponse();
  const validationError = Object.assign(new BadRequestError("Invalid body"), {
    errors: [
      {
        property: "email",
        constraints: { isEmail: "email must be an email" },
        value: "private-value",
        target: { email: "private-value" },
      },
    ],
  });

  invokeHandler(validationError, response, () => undefined);

  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.body, {
    message: "Invalid request",
    code: "INVALID_REQUEST",
    details: [
      {
        property: "email",
        constraints: ["email must be an email"],
      },
    ],
  });
});

test("hides internal messages for unknown errors", () => {
  const response = createResponse();

  invokeHandler(
    new Error("database password leaked"),
    response,
    () => undefined,
  );

  assert.equal(response.statusCode, 500);
  assert.deepEqual(response.body, {
    message: "Internal server error",
    code: "INTERNAL_SERVER_ERROR",
  });
});

test("delegates when the response has already started", () => {
  const response = createResponse(true);
  let delegatedError: unknown;

  invokeHandler(new Error("stream failed"), response, (error: unknown) => {
    delegatedError = error;
  });

  assert.equal(delegatedError instanceof Error, true);
  assert.equal(response.statusCode, undefined);
  assert.equal(response.body, undefined);
});
