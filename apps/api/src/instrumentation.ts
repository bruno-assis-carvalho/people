import "dotenv/config";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { NodeSDK } from "@opentelemetry/sdk-node";

const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT?.replace(/\/$/, "");
const headers = Object.fromEntries(
  (process.env.OTEL_EXPORTER_OTLP_HEADERS ?? "")
    .split(",")
    .map((header) => header.trim())
    .filter(Boolean)
    .map((header) => {
      const separator = header.indexOf("=");
      return separator === -1
        ? [header, ""]
        : [header.slice(0, separator), header.slice(separator + 1)];
    }),
);

const resourceAttributes = Object.fromEntries(
  (process.env.OTEL_RESOURCE_ATTRIBUTES ?? "")
    .split(",")
    .map((attribute) => attribute.trim())
    .filter(Boolean)
    .map((attribute) => {
      const separator = attribute.indexOf("=");
      return separator === -1
        ? [attribute, ""]
        : [attribute.slice(0, separator), attribute.slice(separator + 1)];
    }),
);

const endpointFor = (signal: "traces" | "metrics"): string | undefined => {
  if (!endpoint) {
    return undefined;
  }

  return endpoint.endsWith(`/v1/${signal}`)
    ? endpoint
    : `${endpoint}/v1/${signal}`;
};

const sdk = endpoint
  ? new NodeSDK({
      resource: resourceFromAttributes({
        "service.name": process.env.OTEL_SERVICE_NAME || "express-api",
        ...(process.env.OTEL_SERVICE_VERSION
          ? { "service.version": process.env.OTEL_SERVICE_VERSION }
          : {}),
        ...(process.env.OTEL_DEPLOYMENT_ENVIRONMENT
          ? {
              "deployment.environment.name":
                process.env.OTEL_DEPLOYMENT_ENVIRONMENT,
            }
          : {}),
        ...resourceAttributes,
      }),
      traceExporter: new OTLPTraceExporter({
        url: endpointFor("traces"),
        headers,
      }),
      metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
          url: endpointFor("metrics"),
          headers,
        }),
      }),
      instrumentations: [getNodeAutoInstrumentations()],
    })
  : undefined;

export const telemetryReady = Boolean(sdk);

if (sdk) {
  sdk.start();
}

export const shutdownTelemetry = async (): Promise<void> => {
  if (sdk) {
    await sdk.shutdown();
  }
};
