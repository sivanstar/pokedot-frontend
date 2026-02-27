/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_AD_TASK_REQUIRED: string
  readonly VITE_MIN_WITHDRAWAL: string
  readonly VITE_SIGNUP_BONUS: string
  readonly VITE_FREE_SIGNUP: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
