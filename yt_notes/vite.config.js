import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: '/src/main.jsx',
      output: {
        entryFileNames: 'assets/index.js',
        assetFileNames: 'assets/[name].[ext]'
      }
    },
    outDir: 'dist',
    manifest: false
  }
});
