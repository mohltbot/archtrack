import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    outDir: path.join(__dirname, 'dist'),
    emptyOutDir: true,
    lib: {
      entry: path.join(__dirname, 'src/main.ts'),
      formats: ['cjs'],
      fileName: 'main'
    },
    rollupOptions: {
      external: ['electron', 'electron-store', 'active-win', 'fs', 'path', 'os', 'url', 'http', 'https', 'util'],
      output: {
        inlineDynamicImports: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.join(__dirname, 'src'),
    },
  },
});