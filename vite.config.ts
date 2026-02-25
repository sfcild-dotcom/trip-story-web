import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/trip-story-web/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    port: 5173,
    open: true,
    host: '0.0.0.0',
    middlewareMode: false,
    cors: true,
  },
})
