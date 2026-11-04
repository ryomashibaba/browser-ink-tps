import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        sourcePlay: fileURLToPath(new URL('./play-source.html', import.meta.url))
      }
    }
  },
  optimizeDeps: {
    exclude: ['recast-navigation']
  }
});
