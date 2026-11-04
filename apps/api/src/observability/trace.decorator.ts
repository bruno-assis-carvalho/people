import { SpanStatusCode, trace } from "@opentelemetry/api";
import type { Span } from "@opentelemetry/api";

type TraceableMethod = (...args: never[]) => unknown;

const toError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error;
  }
  if (typeof error === "string") {
    return new Error(error);
  }
  return new Error("A non-Error value was thrown");
};

const recordFailure = (span: Span, error: unknown): void => {
  span.recordException(toError(error));
  span.setStatus({ code: SpanStatusCode.ERROR });
};

const wrapMethod = <T extends TraceableMethod>(
  original: T,
  spanName: string,
): T => {
  const wrapped = function (this: unknown, ...args: Parameters<T>) {
    const tracer = trace.getTracer("express-api");
    return tracer.startActiveSpan(spanName, (span) => {
      let result: ReturnType<T>;
      try {
        result = original.apply(this, args) as ReturnType<T>;
      } catch (error) {
        recordFailure(span, error);
        span.end();
        throw error;
      }

      if (
        result !== null &&
        (typeof result === "object" || typeof result === "function") &&
        "then" in result &&
        typeof result.then === "function"
      ) {
        return Promise.resolve(result).then(
          (value) => {
            span.end();
            return value;
          },
          (error: unknown) => {
            recordFailure(span, error);
            span.end();
            throw error;
          },
        ) as ReturnType<T>;
      }

      span.end();
      return result;
    }) as T;
  };

  return wrapped as T;
};

export function TraceMethod(spanName: string): MethodDecorator {
  return ((targetOrMethod, _propertyKey, descriptor?: PropertyDescriptor) => {
    const method = descriptor?.value ?? targetOrMethod;
    if (typeof method !== "function") {
      return descriptor;
    }

    const wrapped = wrapMethod(method as TraceableMethod, spanName);
    if (descriptor) {
      descriptor.value = wrapped;
      return descriptor;
    }
    return wrapped;
  }) as MethodDecorator;
}
