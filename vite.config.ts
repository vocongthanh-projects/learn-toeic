import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), cloudflare()],
  build: {
    // The isolated question-bank data chunk is intentionally large (it's the whole
    // question bank) — raise the threshold so only a genuine app-code regression warns.
    chunkSizeWarningLimit: 4200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // The question bank JSON rarely changes and is large — keep it in its own
          // chunk so app-code deploys don't force users to re-download it, and so it
          // doesn't get lumped into the main bundle warning.
          if (id.includes('/data/question_bank/')) {
            return 'question-bank';
          }
          if (id.includes('/node_modules/')) {
            return 'vendor';
          }
        },
      },
    },
  },
})