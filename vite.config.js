import { defineConfig } from 'vite';
import fs from 'fs-extra';

export default defineConfig({
  base: './',
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: false, // Não esvazia a pasta dist
    rollupOptions: {
      output: {
        entryFileNames: 'assets/js/[name]-[hash].js',
        chunkFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name.split('.').pop();
          if (/css/i.test(extType)) {
            return 'assets/css/[name]-[hash][extname]';
          } else if (/(png|jpe?g|svg)/i.test(extType)) {
            return 'assets/image/[name]-[hash][extname]';
          } else if (/mp4/i.test(extType)) {
            return 'assets/video/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  }
});
