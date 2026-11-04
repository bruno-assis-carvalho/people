import assert from "node:assert/strict";
import test from "node:test";
import type { JWTPayload } from "express-oauth2-jwt-bearer";
import type { Action } from "routing-controllers";
import { authorizationChecker, currentUserChecker } from "./authentication";

const createAction = (payload?: JWTPayload): Action =>
  ({
    request: {
      auth: payload ? { payload } : undefined,
    },
  }) as unknown as Action;

test("requires a verified principal with a subject", async () => {
  assert.equal(await authorizationChecker(createAction(), []), false);
  assert.equal(await authorizationChecker(createAction({}), []), false);
  assert.equal(
    await authorizationChecker(createAction({ sub: "auth0|123" }), []),
    true,
  );
});

test("checks roles and permissions from verified claims", async () => {
  const previousClaim = process.env.AUTH0_ROLES_CLAIM;
  process.env.AUTH0_ROLES_CLAIM = "https://example.test/roles";
  const action = createAction({
    sub: "auth0|123",
    "https://example.test/roles": ["admin"],
  });

  try {
    assert.equal(await authorizationChecker(action, ["admin"]), true);
    assert.equal(await authorizationChecker(action, ["editor"]), false);
    assert.equal(await currentUserChecker(action), action.request.user);
  } finally {
    if (previousClaim === undefined) {
      delete process.env.AUTH0_ROLES_CLAIM;
    } else {
      process.env.AUTH0_ROLES_CLAIM = previousClaim;
    }
  }
});

test("accepts a matching verified permission claim", async () => {
  const action = createAction({
    sub: "auth0|123",
    permissions: ["people:write"],
  });

  assert.equal(await authorizationChecker(action, ["people:write"]), true);
});
