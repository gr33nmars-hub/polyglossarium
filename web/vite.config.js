import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('framer-motion')) {
              return 'framer-motion';
            }
            if (id.includes('d3')) {
              return 'd3-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            return 'vendor';
          }
          if (id.includes('src/data/curriculum')) {
            return 'curriculum';
          }
          if (id.includes('src/data/protocol')) {
            return 'protocol';
          }
        }
      }
    },
    chunkSizeWarningLimit: 600,
    copyPublicDir: true
  },
  server: {
    host: true,
    port: 3000,
    strictPort: false,
  },
  preview: {
    host: true,
    port: 3000,
    strictPort: false,
  }
})
