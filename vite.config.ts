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
    port: 5175,
    open: true,
    host: '127.0.0.1',
    middlewareMode: false,
    hmr: {
      host: '5175-ioryejvencx35oj59rq37-718f2262.sg1.manus.computer',
      protocol: 'https',
    },
    cors: {
      origin: true,
      credentials: true,
    },
    allowedHosts: ['5175-ioryejvencx35oj59rq37-718f2262.sg1.manus.computer', '5176-ioryejvencx35oj59rq37-718f2262.sg1.manus.computer', '5177-ioryejvencx35oj59rq37-718f2262.sg1.manus.computer', 'localhost'],
  },
})
