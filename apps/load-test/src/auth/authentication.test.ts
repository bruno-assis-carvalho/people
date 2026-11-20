import assert from "node:assert/strict";
import { test } from "node:test";
import { getToken } from "./authentication";

test("getToken requires valid Auth0 config and caps token requests", async () => {
  const envNames = [
    "AUTH0_DOMAIN",
    "AUTH0_AUDIENCE",
    "AUTH0_CLIENT_ID",
    "AUTH0_CLIENT_SECRET",
  ] as const;
  const originalEnv = Object.fromEntries(
    envNames.map((name) => [name, process.env[name]]),
  );
  const originalFetch = globalThis.fetch;
  let requestCount = 0;
  let failRequest = false;

  globalThis.fetch = async (input, init) => {
    requestCount += 1;
    assert.equal(String(input), "https://tenant.example/oauth/token");
    assert.equal(init?.method, "POST");
    assert.deepEqual(JSON.parse(String(init?.body)), {
      client_id: "client-id",
      client_secret: "client-secret",
      audience: "people-register",
      grant_type: "client_credentials",
    });

    return failRequest
      ? new Response("{}", { status: 401 })
      : new Response(JSON.stringify({ access_token: "test-access-token" }), {
          status: 200,
        });
  };

  try {
    for (const name of envNames) {
      delete process.env[name];
    }
    await assert.rejects(getToken(), /Missing Auth0 configuration/);
    assert.equal(requestCount, 0);

    process.env.AUTH0_DOMAIN = "https://tenant.example/";
    process.env.AUTH0_AUDIENCE = "people-register";
    process.env.AUTH0_CLIENT_ID = "client-id";
    process.env.AUTH0_CLIENT_SECRET = "client-secret";

    assert.equal(await getToken(), "test-access-token");

    failRequest = true;
    await assert.rejects(getToken(), /status 401/);
    failRequest = false;

    const remainingRequests = Array.from({ length: 18 }, () => getToken());
    assert.deepEqual(await Promise.all(remainingRequests), Array(18).fill("test-access-token"));
    assert.equal(requestCount, 20);
    await assert.rejects(getToken(), /limit reached \(20 per execution\)/);
    assert.equal(requestCount, 20);
  } finally {
    globalThis.fetch = originalFetch;
    for (const name of envNames) {
      const value = originalEnv[name];
      if (value === undefined) {
        delete process.env[name];
      } else {
        process.env[name] = value;
      }
    }
  }
});
