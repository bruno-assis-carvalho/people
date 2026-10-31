import { getWebInstrumentations, initializeFaro } from "@grafana/faro-web-sdk"
import { TracingInstrumentation } from "@grafana/faro-web-tracing"

const faroUrl = import.meta.env.VITE_FARO_URL?.trim()

if (faroUrl) {
  initializeFaro({
    url: faroUrl,
    app: {
      name: import.meta.env.VITE_FARO_APP_NAME?.trim() || "people",
    },
    instrumentations: [
      ...getWebInstrumentations(),
      new TracingInstrumentation(),
    ],
  })
}
