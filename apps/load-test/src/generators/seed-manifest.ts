import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { mockPeople } from "@people/mocks";
import { loadNodeEnv } from "../config/node-env";

const main = async (): Promise<void> => {
  const env = loadNodeEnv();
  const runId = `e2e_seed_${Date.now()}_`;
  const manifestPath = resolve(process.cwd(), env.seedOutputManifest);
  await mkdir(dirname(manifestPath), { recursive: true });
  await writeFile(
    manifestPath,
    `${JSON.stringify(
      {
        runId,
        createdIds: [],
        searchKeywords: mockPeople.slice(0, 5).map((person) => person.name),
        seedCount: mockPeople.length,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
};

void main();
