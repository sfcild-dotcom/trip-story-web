import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
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
    allowedHosts: ['5176-ioryejvencx35oj59rq37-718f2262.sg1.manus.computer'],
  },
})
