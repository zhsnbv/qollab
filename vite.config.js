import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import i18n from './src/i18n/vite-plugin-i18n.mjs'

// https://vite.dev/config/
export default defineConfig({
  // Локализация встроена в сборку: плагин заменяет русские литералы вызовом
  // перевода, словарь лежит в src/i18n/kk.js. Подробности — в самом плагине.
  plugins: [i18n(), react()],
  server: {
    // Порт из окружения (preview-харнесс задаёт PORT). Если не задан — дефолтный 5173,
    // и если он занят, Vite сам возьмёт следующий свободный.
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
    host: true,
  },
})
