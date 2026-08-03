/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the order backend. Empty means same-origin. */
  readonly VITE_API_BASE?: string
  /** 'live' routes orders to the server; anything else keeps them on-device. */
  readonly VITE_ORDERING?: string
  /** 'live' means a card is actually charged. */
  readonly VITE_PAYMENTS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
