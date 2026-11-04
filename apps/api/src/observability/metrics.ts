import { metrics } from "@opentelemetry/api";
import { availableParallelism } from "node:os";
import { monitorEventLoopDelay, performance } from "node:perf_hooks";

const meter = metrics.getMeter("express-api");

export const httpRequestsTotal = meter.createCounter("http.server.requests", {
  description: "Total number of HTTP requests handled by the API",
});

export const httpRequestDuration = meter.createHistogram(
  "http.server.duration",
  {
    description: "Duration of HTTP requests handled by the API",
    unit: "ms",
  },
);

export const httpServerErrors = meter.createCounter("http.server.errors", {
  description: "Total number of HTTP 5xx responses",
});

export const operationExecutions = meter.createCounter("api.operation.executions", {
  description: "Application operation executions",
});

export const operationErrors = meter.createCounter("api.operation.errors", {
  description: "Application operation failures",
});

export const operationDuration = meter.createHistogram("api.operation.duration", {
  description: "Application operation duration",
  unit: "ms",
});

const eventLoopDelay = monitorEventLoopDelay({ resolution: 20 });
eventLoopDelay.enable();

const cpuCount = availableParallelism();
let previousCpuUsage = process.cpuUsage();
let previousCpuSampleTime = performance.now();

meter.createObservableGauge("process.cpu.utilization", {
  description: "Process CPU utilization relative to available logical CPUs",
  unit: "1",
}).addCallback((result) => {
  const currentCpuUsage = process.cpuUsage();
  const currentSampleTime = performance.now();
  const elapsedMicroseconds = (currentSampleTime - previousCpuSampleTime) * 1000;
  const consumedMicroseconds =
    currentCpuUsage.user - previousCpuUsage.user +
    currentCpuUsage.system - previousCpuUsage.system;

  if (elapsedMicroseconds > 0) {
    result.observe(
      Math.min(consumedMicroseconds / (elapsedMicroseconds * cpuCount), 1),
    );
  }

  previousCpuUsage = currentCpuUsage;
  previousCpuSampleTime = currentSampleTime;
});

meter.createObservableGauge("process.memory.rss", {
  description: "Resident memory used by the process",
  unit: "By",
}).addCallback((result) => {
  result.observe(process.memoryUsage().rss);
});

meter.createObservableGauge("process.memory.heap_used", {
  description: "Heap memory used by the process",
  unit: "By",
}).addCallback((result) => {
  result.observe(process.memoryUsage().heapUsed);
});

meter.createObservableGauge("nodejs.eventloop.utilization", {
  description: "Fraction of time the event loop is busy",
  unit: "1",
}).addCallback((result) => {
  result.observe(performance.eventLoopUtilization().utilization);
});

meter.createObservableGauge("nodejs.eventloop.delay.mean", {
  description: "Mean event loop delay",
  unit: "ms",
}).addCallback((result) => {
  const meanDelayMs = eventLoopDelay.mean / 1e6;
  if (Number.isFinite(meanDelayMs)) {
    result.observe(meanDelayMs);
  }
});

meter.createObservableGauge("nodejs.eventloop.delay.p99", {
  description: "99th percentile event loop delay",
  unit: "ms",
}).addCallback((result) => {
  const p99DelayMs = eventLoopDelay.percentile(99) / 1e6;
  if (Number.isFinite(p99DelayMs)) {
    result.observe(p99DelayMs);
  }
});
