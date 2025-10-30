/// <reference types="vite/client" />

declare const __VITE_API_BASE_URL__: string;
declare const __VITE_GOOGLE_CLIENT_ID__: string;
declare const __VITE_ENABLE_GOOGLE_AUTH__: boolean;
declare const __VITE_ENABLE_PAYMENTS__: boolean;

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_ENABLE_GOOGLE_AUTH: string;
  readonly VITE_ENABLE_PAYMENTS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}