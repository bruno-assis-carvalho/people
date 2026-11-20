const MAX_TOKEN_REQUESTS_PER_EXECUTION = 20;

let tokenRequests = 0;

export const getToken = async (): Promise<string> => {
  if (tokenRequests >= MAX_TOKEN_REQUESTS_PER_EXECUTION) {
    throw new Error(
      `Auth0 token request limit reached (${MAX_TOKEN_REQUESTS_PER_EXECUTION} per execution).`,
    );
  }

  const domain = process.env.AUTH0_DOMAIN?.trim().replace(/\/+$/, "");
  const audience = process.env.AUTH0_AUDIENCE?.trim();
  const clientId = process.env.AUTH0_CLIENT_ID?.trim();
  const clientSecret = process.env.AUTH0_CLIENT_SECRET?.trim();
  const missing = [
    ["AUTH0_DOMAIN", domain],
    ["AUTH0_AUDIENCE", audience],
    ["AUTH0_CLIENT_ID", clientId],
    ["AUTH0_CLIENT_SECRET", clientSecret],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(`Missing Auth0 configuration: ${missing.join(", ")}.`);
  }

  tokenRequests += 1;
  const response = await fetch(`${domain}/oauth/token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      audience,
      grant_type: "client_credentials",
    }),
  });

  if (!response.ok) {
    throw new Error(`Auth0 token request failed with status ${response.status}.`);
  }

  const result: unknown = await response.json();
  if (
    typeof result !== "object" ||
    result === null ||
    !("access_token" in result) ||
    typeof result.access_token !== "string" ||
    result.access_token.trim().length === 0
  ) {
    throw new Error("Auth0 token response did not contain a valid access token.");
  }

  return result.access_token;
};
