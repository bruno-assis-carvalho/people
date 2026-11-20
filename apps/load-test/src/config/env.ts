export interface LoadTestEnv {
  apiUrl: string;
  webUrl: string;
  targetEnv: string;
  seedCount: number;
  seedUsers: number;
  seedOutputManifest: string;
  authEmail: string;
  authPassword: string;
  authToken: string | undefined;
  auth0Domain: string | undefined;
  auth0Audience: string | undefined;
  auth0ClientId: string | undefined;
  auth0ClientSecret: string | undefined;
}

const gatlingParameters = new Map(
  process.argv
    .slice(2)
    .filter((argument) => argument.includes("="))
    .map((argument) => {
      const separator = argument.indexOf("=");
      return [
        argument.slice(0, separator),
        argument.slice(separator + 1),
      ] as const;
    }),
);

const parameter = (name: string, envName: string, fallback: string): string =>
  gatlingParameters.get(name) ??
  process.env[envName] ??
  fallback;

const positiveInteger = (name: string, value: string): number => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return parsed;
};

export const loadEnv = (): LoadTestEnv => {
  const targetEnv = parameter("TARGET_ENV", "TARGET_ENV", "local");
  if (targetEnv === "production") {
    throw new Error("Load testing is prohibited when TARGET_ENV=production");
  }

  return {
    apiUrl: parameter("API_URL", "API_URL", "http://localhost:3000"),
    webUrl: parameter("WEB_URL", "WEB_URL", "http://localhost:3000"),
    targetEnv,
    seedCount: positiveInteger(
      "SEED_COUNT",
      parameter("SEED_COUNT", "SEED_COUNT", "5000"),
    ),
    seedUsers: positiveInteger(
      "SEED_USERS",
      parameter("SEED_USERS", "SEED_USERS", "50"),
    ),
    seedOutputManifest: parameter(
      "SEED_OUTPUT_MANIFEST",
      "SEED_OUTPUT_MANIFEST",
      "./data/e2e-manifest.json",
    ),
    authEmail: parameter(
      "AUTH_EMAIL",
      "AUTH_EMAIL",
      "admin@example.com",
    ),
    authPassword: parameter(
      "AUTH_PASSWORD",
      "AUTH_PASSWORD",
      "changeme",
    ),
    authToken:
      parameter("AUTH_TOKEN", "AUTH_TOKEN", "") || undefined,
    auth0Domain:
      parameter("AUTH0_DOMAIN", "AUTH0_DOMAIN", "") || undefined,
    auth0Audience:
      parameter("AUTH0_AUDIENCE", "AUTH0_AUDIENCE", "") || undefined,
    auth0ClientId:
      parameter("AUTH0_CLIENT_ID", "AUTH0_CLIENT_ID", "") || undefined,
    auth0ClientSecret:
      parameter("AUTH0_CLIENT_SECRET", "AUTH0_CLIENT_SECRET", "") || undefined,
  };
};
