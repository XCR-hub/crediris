import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV === 'development',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-toast', '@radix-ui/react-slot', '@radix-ui/react-label', '@radix-ui/react-radio-group', '@radix-ui/react-accordion'],
          forms: ['react-hook-form', '@hookform/resolvers/zod', 'zod'],
          motion: ['framer-motion'],
          pdf: ['jspdf'],
          analytics: ['schema-dts']
        }
      }
    },
    minify: 'esbuild',
    target: 'esnext'
  },
  server: {
    port: 3000,
    host: true,
    cors: true
  },
  preview: {
    port: 3000,
    host: true
  }
});