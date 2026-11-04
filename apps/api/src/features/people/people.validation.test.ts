import assert from "node:assert/strict";
import test from "node:test";
import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { CreatePersonRequest, PersonResponse } from "@genesis/interfaces";

const validatePayload = (payload: Record<string, unknown>) =>
  validate(plainToInstance(CreatePersonRequest, payload), {
    whitelist: true,
    forbidNonWhitelisted: true,
    forbidUnknownValues: false,
  });

test("rejects malformed email addresses at runtime", async () => {
  const errors = await validatePayload({
    name: "Ada Lovelace",
    email: "not-an-email",
  });

  assert.equal(
    errors.some((error) => "isEmail" in (error.constraints ?? {})),
    true,
  );
});

test("rejects unknown request properties", async () => {
  const errors = await validatePayload({
    name: "Ada Lovelace",
    email: "ada@example.com",
    isAdmin: true,
  });

  assert.equal(
    errors.some((error) => error.property === "isAdmin"),
    true,
  );
});

test("validates a person response with the shared DTO", async () => {
  const errors = await validate(
    plainToInstance(PersonResponse, {
      id: 123,
      name: "",
      email: "not-an-email",
    }),
  );

  const messages = errors.flatMap((error) =>
    Object.values(error.constraints ?? {}),
  );

  assert.equal(messages.includes("ID must be a string"), true);
  assert.equal(messages.includes("Name is required"), true);
  assert.equal(messages.includes("Please enter a valid email address"), true);
});
