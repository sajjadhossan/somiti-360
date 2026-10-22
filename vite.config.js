import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: true
  },
  build: {
    target: ['chrome65', 'es2018'],
    outDir: 'dist',
    chunkSizeWarningLimit: 3000
  }
});
