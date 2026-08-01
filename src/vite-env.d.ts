/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the order backend. Empty = local-only build (no server). */
  readonly VITE_API_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
