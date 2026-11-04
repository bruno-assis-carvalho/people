import { getWebInstrumentations, initializeFaro } from "@grafana/faro-react"
import { ReplayInstrumentation } from "@grafana/faro-instrumentation-replay"
import { TracingInstrumentation } from "@grafana/faro-web-tracing"

const faroUrl = import.meta.env.VITE_FARO_URL?.trim()

if (faroUrl) {
  initializeFaro({
    url: faroUrl,
    app: {
      name: import.meta.env.VITE_FARO_APP_NAME?.trim() || "people-local",
      version: import.meta.env.VITE_FARO_APP_VERSION?.trim() || "1.0.0",
      environment:
        import.meta.env.VITE_FARO_APP_ENVIRONMENT?.trim() || import.meta.env.MODE,
    },
    ignoreErrors: [
      // Layout quirks — harmless, not real errors
      /^ResizeObserver loop limit exceeded$/,
      /^ResizeObserver loop completed with undelivered notifications$/,
      // Cross-origin scripts with no useful stack
      /^Script error\.$/,
      // Browser extension interference
      /chrome-extension:\/\//,
      /moz-extension:\/\//,
    ],
    ignoreUrls: [
      // Google Analytics / GTM (optional injection in vite.config.ts)
      /googletagmanager\.com/,
      /analytics\.google\.com/,
      /www\.google-analytics\.com/,
    ],
    instrumentations: [
      ...getWebInstrumentations(),
      new TracingInstrumentation(),
      new ReplayInstrumentation({
        blockSelector:
          ".grafana-block, img, picture, svg, video, audio, canvas, iframe, object, embed, input[type=\"hidden\"]",
        ignoreSelector: ".grafana-ignore",
      }),
    ],
  })
}
