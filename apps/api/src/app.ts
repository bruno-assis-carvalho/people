import "reflect-metadata";
import "dotenv/config";
import { createRequire } from "node:module";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { getMetadataArgsStorage, useExpressServer } from "routing-controllers";
import { routingControllersToSpec } from "routing-controllers-openapi";
import { validationMetadatasToSchemas } from "class-validator-jsonschema";
import { PeopleController } from "./features/people/people.controller";
import { logger } from "./observability/logger";
import {
  httpRequestDuration,
  httpServerErrors,
  httpRequestsTotal,
} from "./observability/metrics";
import { errorHandler } from "./shared/middlewares/error-handler";
import {
  authorizationChecker,
  createAuthMiddleware,
  currentUserChecker,
} from "./shared/auth/authentication";

const routingOptions = {
  routePrefix: "/api",
  controllers: [PeopleController],
};
const { defaultMetadataStorage } = createRequire(__filename)(
  "class-transformer/cjs/storage",
);

export const openApiSpec = routingControllersToSpec(
  getMetadataArgsStorage(),
  routingOptions,
  {
    components: {
      schemas: validationMetadatasToSchemas({
        refPointerPrefix: "#/components/schemas/",
        classTransformerMetadataStorage: defaultMetadataStorage,
      }),
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    info: {
      title: "Express API",
      version: "1.0.0",
    },
  },
);

export const app = express();
app.use((request, response, next) => {
  const startedAt = performance.now();

  response.on("finish", () => {
    const durationMs = performance.now() - startedAt;
    const route = request.route?.path || "unmatched";
    const statusClass = `${Math.floor(response.statusCode / 100)}xx`;
    const attributes = {
      method: request.method,
      route,
      status_code: response.statusCode,
      status_class: statusClass,
    };

    httpRequestsTotal.add(1, attributes);
    httpRequestDuration.record(durationMs, attributes);
    if (response.statusCode >= 500) {
      httpServerErrors.add(1, {
        method: request.method,
        route,
        status_class: statusClass,
      });
    }
    logger.info(
      {
        ...attributes,
        duration_ms: Math.round(durationMs * 100) / 100,
      },
      "HTTP request completed",
    );
  });

  next();
});

app.get("/", (_request, response) => {
  response.json({ name: "express-api", status: "ok" });
});

app.get("/docs/openapi.json", (_request, response) => {
  response.json(openApiSpec);
});
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerOptions: { url: "/docs/openapi.json" },
  }),
);

app.use("/api", createAuthMiddleware());

useExpressServer(app, {
  ...routingOptions,
  validation: {
    whitelist: true,
    forbidNonWhitelisted: true,
    forbidUnknownValues: false,
  },
  classTransformer: true,
  defaultErrorHandler: false,
  authorizationChecker,
  currentUserChecker,
});

app.use(errorHandler);
