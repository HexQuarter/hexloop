/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_BREEZ_API_KEY: string
    readonly VITE_API_NOSTR_PUB: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}