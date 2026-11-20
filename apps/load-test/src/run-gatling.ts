import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { getToken } from "./auth/authentication";
import { loadNodeEnv } from "./config/node-env";

type SimulationName = "seed" | "api-load" | "web-smoke";

const isSimulationName = (value: string | undefined): value is SimulationName =>
  value === "seed" || value === "api-load" || value === "web-smoke";

const runCommand = (
  command: string,
  args: string[],
  env: NodeJS.ProcessEnv,
): Promise<void> =>
  new Promise((resolveCommand, rejectCommand) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env,
      stdio: "inherit",
    });

    child.once("error", rejectCommand);
    child.once("exit", (code, signal) => {
      if (code === 0) {
        resolveCommand();
      } else {
        rejectCommand(
          new Error(
            `${command} exited with ${signal ? `signal ${signal}` : `code ${code}`}.`,
          ),
        );
      }
    });
  });

const runNpm = async (args: string[]): Promise<void> => {
  const npmScript = process.env.npm_execpath;
  const command = npmScript
    ? process.execPath
    : process.platform === "win32"
      ? "npm.cmd"
      : "npm";

  await runCommand(
    command,
    npmScript ? [npmScript, ...args] : args,
    process.env,
  );
};

const main = async (): Promise<void> => {
  const simulation = process.argv[2];
  if (!isSimulationName(simulation)) {
    throw new Error(
      "Choose one simulation: seed, api-load, or web-smoke.",
    );
  }

  loadNodeEnv();
  const token = await getToken();

  if (simulation === "seed") {
    await runNpm(["run", "generate:manifest"]);
  }

  const gatlingCli = resolve(
    process.cwd(),
    "../../node_modules/@gatling.io/cli/target/index.js",
  );
  await runCommand(
    process.execPath,
    [
      gatlingCli,
      "run",
      "--sources-folder",
      "src/simulations",
      "--simulation",
      simulation,
    ],
    { ...process.env, LOAD_TEST_TOKEN: token },
  );
};

void main();
