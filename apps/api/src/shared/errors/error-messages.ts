export const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: "Internal server error",
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden",
  INVALID_REQUEST: "Invalid request",
  INVALID_PERSON_ID: "Invalid person ID",
  PERSON_NOT_FOUND: "Person not found",
  PERSON_EMAIL_ALREADY_EXISTS: "A person with this email already exists",
} as const;

export type ErrorCode = keyof typeof ERROR_MESSAGES;
