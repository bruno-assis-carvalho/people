import { getEnvironmentVariable } from "@gatling.io/core";

export const requireLoadTestToken = (): string => {
  const token = getEnvironmentVariable("LOAD_TEST_TOKEN", "").trim();

  if (!token) {
    throw new Error(
      "No Auth0 token was provided. Start simulations through the load-test workspace scripts.",
    );
  }

  return token;
};
