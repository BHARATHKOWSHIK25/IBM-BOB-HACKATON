import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    target: 'es2020',
    // Raise the chunk warning limit — we split manually below
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Vendor split: React core in its own chunk (cached across deploys)
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('react-router-dom')) {
            return 'vendor-react'
          }
          if (id.includes('lucide-react') || id.includes('date-fns')) {
            return 'vendor-ui'
          }
          if (id.includes('axios')) {
            return 'vendor-http'
          }
        },
      },
    },
  },
})
