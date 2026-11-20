import {
  getEnvironmentVariable,
  getParameter,
} from "@gatling.io/core";

export interface LoadTestEnv {
  apiUrl: string;
  webUrl: string;
  targetEnv: string;
  seedOutputManifest: string;
}

const parameter = (name: string, envName: string, fallback: string): string =>
  getParameter(name, getEnvironmentVariable(envName, fallback));

export const loadEnv = (): LoadTestEnv => {
  const targetEnv = parameter("TARGET_ENV", "TARGET_ENV", "local");
  if (targetEnv === "production") {
    throw new Error("Load testing is prohibited when TARGET_ENV=production");
  }

  return {
    apiUrl: parameter("API_URL", "API_URL", "http://localhost:3000"),
    webUrl: parameter("WEB_URL", "WEB_URL", "http://localhost:3000"),
    targetEnv,
    seedOutputManifest: parameter(
      "SEED_OUTPUT_MANIFEST",
      "SEED_OUTPUT_MANIFEST",
      "./data/e2e-manifest.json",
    ),
  };
};
