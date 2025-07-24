import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';

export default defineConfig({
  plugins: [
    react(),
    // Generate version info before build
    {
      name: 'generate-version',
      buildStart() {
        execSync('node scripts/generate-version.js', { stdio: 'inherit' });
      }
    }
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: './index.html'
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true
      }
    }
  }
});