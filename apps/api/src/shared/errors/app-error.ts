import { ERROR_MESSAGES, ErrorCode } from "./error-messages";

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCode;
  readonly details?: unknown;

  constructor(code: ErrorCode, statusCode: number, details?: unknown) {
    super(ERROR_MESSAGES[code]);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}
