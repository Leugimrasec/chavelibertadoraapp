// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Otimizações de performance
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar bibliotecas grandes em chunks separados
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          charts: ['recharts'],
          icons: ['lucide-react']
        }
      }
    },
    // Configurações de otimização
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log em produção
        drop_debugger: true
      }
    },
    // Configurar limite de chunk size
    chunkSizeWarningLimit: 1000,
    // Otimizar assets
    assetsInlineLimit: 4096
  },
  // Configurações do servidor de desenvolvimento
  server: {
    port: 5174,
    host: true,
    open: false
  },
  // Configurações de preview
  preview: {
    port: 4173,
    host: true
  }
})

