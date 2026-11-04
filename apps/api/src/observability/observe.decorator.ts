import { SpanStatusCode, trace } from "@opentelemetry/api";
import {
  operationDuration,
  operationErrors,
  operationExecutions,
} from "./metrics";
import { logger } from "./logger";

const safeException = (error: unknown): Error => {
  const sanitized = new Error("Operation failed");
  sanitized.name = error instanceof Error ? error.name : "Error";
  return sanitized;
};

const wrapMethod = (
  original: (...args: unknown[]) => Promise<unknown>,
  operationName: string,
) => {
  return async function (this: unknown, ...args: unknown[]): Promise<unknown> {
    const startedAt = performance.now();
    const attributes = { operation: operationName };
    operationExecutions.add(1, attributes);

    return trace
      .getTracer("express-api")
      .startActiveSpan(operationName, async (span) => {
        logger.info(attributes, "Operation started");
        try {
          const result = await original.apply(this, args);
          const durationMs = performance.now() - startedAt;
          operationDuration.record(durationMs, {
            ...attributes,
            outcome: "success",
          });
          logger.info(
            { ...attributes, duration_ms: durationMs },
            "Operation completed",
          );
          return result;
        } catch (error) {
          const durationMs = performance.now() - startedAt;
          operationErrors.add(1, attributes);
          operationDuration.record(durationMs, {
            ...attributes,
            outcome: "error",
          });
          span.recordException(safeException(error));
          span.setStatus({ code: SpanStatusCode.ERROR });
          logger.error(
            {
              ...attributes,
              duration_ms: durationMs,
              error_type: error instanceof Error ? error.name : "Error",
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

export function Observe(operationName: string): MethodDecorator {
  return ((targetOrMethod, _propertyKey, descriptor?: PropertyDescriptor) => {
    const method = descriptor?.value ?? targetOrMethod;
    if (typeof method !== "function") {
      return descriptor;
    }

    const wrapped = wrapMethod(
      method as (...args: unknown[]) => Promise<unknown>,
      operationName,
    );
    if (descriptor) {
      descriptor.value = wrapped;
      return descriptor;
    }
    return wrapped;
  }) as MethodDecorator;
}