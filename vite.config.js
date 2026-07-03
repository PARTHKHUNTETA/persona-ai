import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Honor the PORT env var when provided (used by tooling), else default.
    port: Number(process.env.PORT) || 5173,
  },
})
