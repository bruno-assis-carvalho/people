---
name: express5-vertical-slice-api
description: "Generate or extend an Express 5 TypeScript API using vertical feature slices, routing-controllers decorators, class-validator/class-transformer validation, routing-controllers-openapi schemas, JWT role authorization, method-level OpenTelemetry tracing with OTLP export, and Pino logging. Use for Express APIs, decorator-based controllers, JWT/RBAC, validation, Swagger/OpenAPI, or Node.js OpenTelemetry."
argument-hint: "Describe the API or feature, JWT roles/claims, and OTLP endpoint if known."
user-invocable: true
---

# Express 5 Vertical Slice API

Generate or extend an Express 5 TypeScript API using decorator-based controllers, feature-oriented code ownership, class validation, JWT authorization, OpenAPI documentation, and OpenTelemetry. Use `routing-controllers`, `class-validator`, `class-transformer`, and `routing-controllers-openapi`; do not use tsoa or generate tsoa routes/specs. Fit changes to existing repository conventions without weakening the security or compatibility checks below.

## When to Use

- Create an Express 5 API in TypeScript.
- Add a vertical feature slice to an existing Express API.
- Create or extend decorator-based controllers with `routing-controllers`.
- Add DTO validation/transformation, OpenAPI schemas, JWT authorization, role checks, or current-user injection.
- Add method-level tracing, HTTP telemetry, OTLP export, or Pino logging to a Node.js API.

## Procedure

1. **Inspect the target.** Determine whether this is a new API or an existing one. Read the package manifest, TypeScript configuration, app/server bootstrap, telemetry initialization, and a nearby feature. Check for tsoa and other competing routing/validation libraries. Preserve existing behavior outside the requested scope; do not leave tsoa as the active controller or OpenAPI generator after converting a feature.
2. **Check runtime compatibility before installing.** Target Node.js 18 or newer and Express 5 when requested. Check the installed `routing-controllers` version's declared Express support and types. Its package may declare only Express 4 integration. Do not claim Express 5 support just because the app compiles: first verify that `useExpressServer(existingExpress5App, options)` works with the installed versions by typechecking and exercising route, middleware, validation, and rejected-promise behavior. Avoid `createExpressServer()` if it resolves a separate Express 4 copy. If Express 5 compatibility cannot be demonstrated, stop before changing the Express major version and ask whether the user prefers an Express 4 adapter or a decorator library that supports Express 5. Never silently downgrade Express.
3. **Install explicit dependencies.** For a new project, use the package commands below as a baseline, then check peer/optional dependencies and the selected versions. In an existing project, install only missing packages. Keep OpenTelemetry packages on compatible versions; do not install a second telemetry SDK or duplicate auto-instrumentation.
4. **Organize by feature.** Keep a feature's controller, DTOs, service, and feature-specific mapping together under `src/features/<feature>/`. Split independently changing operations into subfolders such as `create-user/` when that improves cohesion. Place only cross-cutting authentication, error handling, tracing, and logger setup in shared infrastructure. Avoid global `controllers/`, `services/`, or `models/` layers.
5. **Define validated DTO classes.** Use classes with `class-validator` decorators and `class-transformer` where transformation is needed. Enable `validation: true` in the routing-controllers setup. Add constraints such as `@IsEmail()`, `@IsString()`, `@Length()`, and `@Min()` to request DTOs. Do not present TypeScript interfaces as runtime validation; interfaces are erased at runtime. Test invalid payloads and unknown-property behavior explicitly.
6. **Implement thin decorated controllers.** Use `@JsonController`, HTTP method decorators, parameter decorators, `@HttpCode`, `@Authorized`, `@CurrentUser`, and `@ResponseSchema` as appropriate. Keep HTTP mapping and authorization declarations in the controller; delegate application behavior to the feature service. Do not put database logic or complex business workflows inside controller methods.
7. **Wire authentication and roles.** Configure `authorizationChecker` and `currentUserChecker` in `useExpressServer`. Verify Bearer JWTs with a required secret/public key, an explicit algorithm allowlist, and configured issuer/audience where supplied by the identity provider. Never hard-code a secret, trust an unverified decode, or log a token. Attach only the verified principal to the request and check requested roles against verified claims. Use `@Authorized()` for authentication and `@Authorized(['admin'])` for role requirements.
8. **Generate OpenAPI.** Use `routing-controllers-openapi`'s `routingControllersToSpec` with the routing-controllers metadata and an explicit OpenAPI bearer security scheme. Mount the generated document and Swagger UI if requested. Use `@ResponseSchema` with response DTOs that actually match returned data; do not annotate a response with a request DTO just for convenience. Avoid tsoa configuration, tsoa route generation, and tsoa commands.
9. **Initialize observability.** Load OpenTelemetry before app/controller imports (for example, a Node `--import` bootstrap). Configure HTTP auto-instrumentation once and export traces/metrics over OTLP using the repository's protocol and endpoint configuration. Use HTTP instrumentation for request traffic, request latency, and status/error metrics. Implement a unified `@Observe("Feature.method")` method decorator with `@opentelemetry/api`, the OpenTelemetry metrics API, and the shared Pino logger: create a child span, count operation executions and failures, record operation duration, log start/success/failure, correlate logs with the active trace/span, record exceptions and error status, rethrow failures unchanged, and end the span in `finally`. Apply it to async methods; preserve rejected promises and do not swallow errors. Do not claim the decorator alone implements all four Golden Signals: collect saturation separately at the process/host or dependency level (for example CPU, memory, event-loop utilization, connection-pool or queue utilization), using runtime/host metrics or explicit instruments. Keep metric labels low-cardinality and omit credentials, tokens, sensitive request bodies, and raw user-controlled values from logs, spans, and metric attributes.
10. **Wire middleware and errors.** Mount JSON parsing, request context/telemetry, routing-controllers, docs and health endpoints, then any compatible final error handling in a deliberate order. With `defaultErrorHandler: true`, confirm routing-controllers validation/auth errors return safe status codes and response bodies; customize only if the application needs a consistent error contract. Do not expose stack traces in production. Do not add `express-async-errors`.
11. **Verify behavior.** Run the repository's build and focused tests. Check that the selected routing-controllers integration is using the intended Express major; test public, authenticated, role-protected, valid-body, invalid-body, and thrown-error cases. Confirm OpenAPI includes request/response schemas and bearer security, the method span records exceptions, OTLP exporters initialize, and telemetry is not duplicated. Report any compatibility blocker or missing external configuration instead of claiming success.

## Explicit Installation Commands

For a new npm TypeScript API, install the runtime packages explicitly:

```sh
npm install express@^5 routing-controllers routing-controllers-openapi class-validator class-transformer reflect-metadata jsonwebtoken pino @opentelemetry/api @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node @opentelemetry/exporter-trace-otlp-proto @opentelemetry/exporter-metrics-otlp-proto
npm install --save-dev typescript tsx @types/node @types/express@^5 @types/jsonwebtoken
```

Run the compatibility check in the previous step before relying on `routing-controllers` with Express 5. If the repository uses OTLP/HTTP instead of OTLP/protobuf, use the matching `@opentelemetry/exporter-trace-otlp-http` and `@opentelemetry/exporter-metrics-otlp-http` packages in place of the protobuf exporters. Do not install tsoa.

## Reference Layout

Adapt names and placement to the repository, keeping feature code together:

```text
src/
├── features/
│   └── users/
│       ├── users.controller.ts
│       ├── create-user.dto.ts
│       └── users.service.ts
├── observability/
│   ├── instrumentation.ts
│   ├── observe.decorator.ts
│   └── logger.ts
├── app.ts
└── server.ts
```

## Example: Validated DTO

```ts
// src/features/users/create-user.dto.ts
import { IsEmail, IsString, Length } from "class-validator";

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(1, 100)
  name!: string;
}
```

## Example: Decorated Controller

```ts
// src/features/users/users.controller.ts
import {
  Authorized,
  Body,
  CurrentUser,
  Get,
  HttpCode,
  JsonController,
  Post,
} from "routing-controllers";
import { ResponseSchema } from "routing-controllers-openapi";
import { CreateUserDto } from "./create-user.dto";
import { Observe } from "../../observability/observe.decorator";

interface AuthenticatedUser {
  email: string;
  role: string;
}

@JsonController("/users")
export class UsersController {
  @Get("/public")
  public getPublicInfo() {
    return { message: "This is public data" };
  }

  @Get("/profile")
  @Authorized()
  public getProfile(@CurrentUser() user: AuthenticatedUser) {
    return { message: "Profile fetched successfully", user };
  }

  @Post()
  @HttpCode(201)
  @Authorized(["admin"])
  @ResponseSchema(CreateUserDto, { description: "The created user object" })
  @Observe("UsersController.createUser")
  public async createUser(
    @Body() body: CreateUserDto,
    @CurrentUser() adminUser: AuthenticatedUser,
  ) {
    return {
      message: `User created by admin: ${adminUser.email}`,
      data: body,
    };
  }
}
```

Use a response DTO distinct from `CreateUserDto` when the actual response has a different shape; the example keeps the annotation short, not as a recommendation to misdescribe response schemas.

## Example: Express Bootstrap and JWT Authorization

Create the Express application explicitly and pass it to `useExpressServer` so Express 5 is not accidentally replaced by an Express 4 instance created internally. This integration must pass the compatibility check above. Load `reflect-metadata` before decorated modules. `JWT_SECRET` must come from deployment configuration or a secret manager; fail startup if it is absent.

```ts
// src/server.ts
import "reflect-metadata";
import express from "express";
import jwt from "jsonwebtoken";
import { Action, useExpressServer } from "routing-controllers";
import { UsersController } from "./features/users/users.controller";

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) throw new Error("JWT_SECRET is required");

const app = express();
app.use(express.json());

useExpressServer(app, {
  controllers: [UsersController],
  validation: true,
  defaultErrorHandler: true,
  authorizationChecker: async (action: Action, roles: string[]) => {
    const header = action.request.header("authorization");
    const match = header?.match(/^Bearer ([^\\s]+)$/i);
    if (!match) return false;

    try {
      const principal = jwt.verify(match[1], jwtSecret, {
        algorithms: ["HS256"],
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE,
      });
      if (typeof principal !== "object" || principal === null) return false;

      action.request.user = principal;
      return roles.length === 0 || roles.includes(String(principal.role));
    } catch {
      return false;
    }
  },
  currentUserChecker: async (action: Action) => action.request.user,
});

app.listen(Number(process.env.PORT ?? 3000));
```

The issuer/audience values must match the token issuer; configure them deliberately rather than weakening verification. Add a TypeScript Express `Request` augmentation for `user` instead of using `any` in application code.

## Example: Unified Observe Decorator

Use one annotation for application-operation logs, traces, and metrics. HTTP auto-instrumentation remains responsible for request-level traffic, latency, and status metrics; use process/host or dependency instrumentation for saturation. The fixed operation name is a low-cardinality metric attribute. Do not add request IDs, user IDs, URLs with identifiers, or other unbounded values as metric labels.

```ts
// src/observability/observe.decorator.ts
import { metrics, SpanStatusCode, trace } from "@opentelemetry/api";
import { logger } from "./logger";

const meter = metrics.getMeter("api");
const operationCounter = meter.createCounter("api.operation.executions", {
  description: "Application operation executions",
});
const operationErrorCounter = meter.createCounter("api.operation.errors", {
  description: "Application operation failures",
});
const operationDuration = meter.createHistogram("api.operation.duration", {
  description: "Application operation duration",
  unit: "ms",
});

export function Observe(operationName?: string): MethodDecorator {
  return (target, propertyKey, descriptor: PropertyDescriptor) => {
    const original = descriptor.value as (
      ...args: unknown[]
    ) => Promise<unknown>;
    descriptor.value = function (this: unknown, ...args: unknown[]) {
      const name =
        operationName ?? `${target.constructor.name}.${String(propertyKey)}`;
      const startedAt = performance.now();
      const attributes = { operation: name };
      operationCounter.add(1, attributes);

      return trace.getTracer("api").startActiveSpan(name, async (span) => {
        logger.info(attributes, "Operation started");
        try {
          const result = await original.apply(this, args);
          const durationMs = performance.now() - startedAt;
          operationDuration.record(durationMs, {
            ...attributes,
            outcome: "success",
          });
          logger.info({ ...attributes, durationMs }, "Operation completed");
          return result;
        } catch (error) {
          const durationMs = performance.now() - startedAt;
          operationErrorCounter.add(1, attributes);
          operationDuration.record(durationMs, {
            ...attributes,
            outcome: "error",
          });
          span.recordException(
            error instanceof Error ? error : new Error(String(error)),
          );
          span.setStatus({ code: SpanStatusCode.ERROR });
          logger.error(
            {
              ...attributes,
              durationMs,
              errorType: error instanceof Error ? error.name : "UnknownError",
            },
            "Operation failed",
          );
          throw error;
        } finally {
          span.end();
        }
      });
    };
  };
}
```

Enable `experimentalDecorators` and `emitDecoratorMetadata` in `tsconfig.json`. This example is intended for async methods and preserves their returned values and rejection behavior. Ensure the decorator's public typing matches the methods it decorates, and test successful results, rejected promises, metric recording, log trace correlation, and span closure. Configure the shared Pino logger to add active `traceId` and `spanId` and redact sensitive fields; never log raw tokens, request bodies, or exception messages by default.

### Golden Signals Coverage

- **Latency:** HTTP request-duration histogram from HTTP instrumentation; operation-duration histogram from `@Observe`.
- **Traffic:** HTTP request count from HTTP instrumentation; operation execution counter from `@Observe`.
- **Errors:** HTTP status/error metrics from HTTP instrumentation; operation error counter and exception status from `@Observe`.
- **Saturation:** process/host and dependency utilization metrics, collected independently of method decorators. Select signals relevant to the service, such as CPU, memory, event-loop utilization, worker/thread pool usage, database pool occupancy, or queue depth, and export them through the configured meter provider.

Avoid counting the same scope twice: operation counters describe decorated method executions, while HTTP counters describe incoming requests. Saturation measures resource pressure, not whether an individual method succeeded.

## OpenAPI and OTLP Setup

Build the OpenAPI document from routing-controllers metadata using `routingControllersToSpec` from `routing-controllers-openapi`; pass an OpenAPI v3 bearer scheme (HTTP bearer, JWT format) and mount the resulting document, for example at `/docs/openapi.json`. The library does not create tsoa routes or perform tsoa-style code generation. Decorator metadata and validation are active only when the controllers are registered with `useExpressServer` and `validation: true`.

Initialize the OpenTelemetry Node SDK in a separate bootstrap module imported before application modules. Configure the OTLP trace and metric exporters with `OTEL_EXPORTER_OTLP_ENDPOINT` or signal-specific endpoints, and shut the SDK down gracefully on process termination. Use the existing instrumentation exporter/protocol if the repository already has one.

## Completion Checks

- Express 5 compatibility is demonstrated with the chosen routing-controllers integration; Express was not silently downgraded or duplicated.
- Feature code follows vertical slices, and tsoa is not part of the active routing/OpenAPI path.
- Decorated controllers are registered, DTO constraints run at runtime, and invalid payloads fail safely.
- OpenAPI contains accurate request/response schemas and the JWT bearer security scheme.
- Public, authenticated, role-protected, and current-user routes behave as intended.
- Missing/invalid JWTs are rejected; algorithm, issuer, audience, and role checks match the configured identity provider.
- No hard-coded auth secrets, token logging, or sensitive error leakage was introduced.
- HTTP and method spans export over OTLP; `@Observe` records operation metrics and correlated structured logs, and rethrows errors after recording them; instrumentation is not duplicated.
- Golden Signals coverage includes HTTP traffic/latency/errors and suitable process/host/dependency saturation measurements.
- Pino logs are structured, redact sensitive fields, and correlate with trace context when available.
- Focused build/tests pass, or unavailable checks and compatibility blockers are clearly reported.
