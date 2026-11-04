/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH0_DOMAIN?: string
  readonly VITE_AUTH0_CLIENT_ID?: string
  readonly VITE_FARO_URL?: string
  readonly VITE_FARO_APP_NAME?: string
  readonly VITE_FARO_APP_VERSION?: string
  readonly VITE_FARO_APP_ENVIRONMENT?: string
}
