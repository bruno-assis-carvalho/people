export interface NodeLoadTestEnv {
  seedOutputManifest: string;
  targetEnv: string;
}

const parameter = (name: string, fallback: string): string =>
  process.env[name] ?? fallback;

export const loadNodeEnv = (): NodeLoadTestEnv => {
  const targetEnv = parameter("TARGET_ENV", "local");
  if (targetEnv === "production") {
    throw new Error("Load testing is prohibited when TARGET_ENV=production");
  }

  return {
    targetEnv,
    seedOutputManifest: parameter(
      "SEED_OUTPUT_MANIFEST",
      "./data/e2e-manifest.json",
    ),
  };
};
