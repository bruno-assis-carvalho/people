import { shutdownTelemetry } from "./instrumentation";
import mongoose from "mongoose";
import { app } from "./app";
import { logger } from "./observability/logger";

const port = Number(process.env.PORT || 3000);
const mongoUri =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/express_api";
let httpServer: ReturnType<typeof app.listen> | undefined;

const start = async (): Promise<void> => {
  await mongoose.connect(mongoUri);
  httpServer = app.listen(port, () => {
    logger.info({ port }, "API listening");
  });
};

const shutdown = async (signal: string): Promise<void> => {
  logger.info({ signal }, "Shutting down API");

  await new Promise<void>((resolve) => {
    if (!httpServer) {
      resolve();
      return;
    }

    httpServer.close(() => resolve());
  });

  await mongoose.disconnect();
  await shutdownTelemetry();
};

process.once("SIGINT", () => {
  void shutdown("SIGINT").then(() => process.exit(0));
});
process.once("SIGTERM", () => {
  void shutdown("SIGTERM").then(() => process.exit(0));
});

start().catch((error: unknown) => {
  logger.error(
    {
      error_message:
        error instanceof Error ? error.message : "Unknown startup error",
    },
    "Unable to start API",
  );
  void shutdownTelemetry();
  process.exitCode = 1;
});
