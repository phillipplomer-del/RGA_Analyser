/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLAUDE_API_KEY?: string
  readonly VITE_GEMINI_API_KEY?: string
  readonly VITE_API_PROXY_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
