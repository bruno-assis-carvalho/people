import { context, trace } from "@opentelemetry/api";
import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  mixin() {
    const span = trace.getSpan(context.active());
    const spanContext = span?.spanContext();
    return {
      service: process.env.OTEL_SERVICE_NAME || "express-api",
      ...(spanContext?.traceId ? { trace_id: spanContext.traceId } : {}),
      ...(spanContext?.spanId ? { span_id: spanContext.spanId } : {}),
    };
  },
});
