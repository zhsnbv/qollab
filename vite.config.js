import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Порт из окружения (preview-харнесс задаёт PORT). Если не задан — дефолтный 5173,
    // и если он занят, Vite сам возьмёт следующий свободный.
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
    host: true,
  },
})
