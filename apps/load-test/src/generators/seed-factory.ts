import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { faker } from "@faker-js/faker";
import { loadEnv } from "../config/env";

const csvEscape = (value: string): string =>
  /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;

export interface SeedRecord {
  runId: string;
  name: string;
  email: string;
  searchKeyword: string;
}

export const generateSeedRecords = (
  count: number,
  runId: string,
): SeedRecord[] => {
  faker.seed(42);
  return Array.from({ length: count }, (_, index) => {
    const name = `${runId}_${faker.person.fullName()}`;
    const email = `${runId}_${index}_${faker.internet.email({ provider: "e2e.example" })}`.toLowerCase();
    return {
      runId,
      name: name.slice(0, 100),
      email: email.slice(0, 254),
      searchKeyword: runId,
    };
  });
};

const main = async (): Promise<void> => {
  const env = loadEnv();
  const runId = `e2e_seed_${Date.now()}_`;
  const records = generateSeedRecords(env.seedCount, runId);
  const dataDir = resolve(process.cwd(), "data");
  await mkdir(dataDir, { recursive: true });

  const csv = [
    "runId,name,email,searchKeyword",
    ...records.map((record) =>
      [record.runId, record.name, record.email, record.searchKeyword]
        .map(csvEscape)
        .join(","),
    ),
  ].join("\n");
  await writeFile(resolve(dataDir, "users-and-items.csv"), `${csv}\n`, "utf8");

  const manifestPath = resolve(process.cwd(), env.seedOutputManifest);
  await mkdir(dirname(manifestPath), { recursive: true });
  await writeFile(
    manifestPath,
    `${JSON.stringify(
      {
        runId,
        createdIds: [],
        searchKeywords: [runId],
        credentials: {
          email: env.authEmail,
          password: env.authPassword,
        },
        seedCount: records.length,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
};

void main();
