import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const DEFAULT_TARGET = 'http://localhost:4000'

// Backend porti `backend/.env`dagi PORT bilan bir xil bo'lishi uchun shu yerdan
// o'qiladi — aks holda proxy boshqa portga urib, /api so'rovlari 404 qaytaradi.
// Kerak bo'lsa VITE_API_PROXY_TARGET bilan bekor qilinadi.
function backendTarget() {
  if (process.env.VITE_API_PROXY_TARGET) return process.env.VITE_API_PROXY_TARGET

  try {
    const env = readFileSync(new URL('../backend/.env', import.meta.url), 'utf8')
    const port = env.match(/^\s*PORT\s*=\s*"?(\d+)"?/m)?.[1]
    if (port) return `http://localhost:${port}`
  } catch {
    // backend/.env yo'q (masalan alohida deploy) — standart portga qaytamiz
  }

  return DEFAULT_TARGET
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: backendTarget(),
        changeOrigin: true,
      },
    },
  },
})
