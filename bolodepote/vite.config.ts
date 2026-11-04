import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    // Encaminha /api para o backend Node, evitando CORS em desenvolvimento
    proxy: {
      '/api': 'http://localhost:3333',
    },
  },
})
