import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';

// Digest of the extractor's 20-face JSON. No OBJ or derived asset is bundled.
const f4LocalTerrainDigest = '1be11fc133cabe79c65cf3ff21fd7b4a94ed6170665d930ecc1986e41c6d22bd';

export default defineConfig({
  plugins: [{
    name: 't21-f4-local-original-terrain',
    configureServer(server) {
      const seedPath = process.env.T21_F4_LOCAL_TERRAIN;
      if (!seedPath) return;
      server.middlewares.use('/__t21-f4-original-terrain', async (req, res) => {
        const localSocket = ['127.0.0.1', '::1', '::ffff:127.0.0.1']
          .includes(req.socket.remoteAddress ?? '');
        const localHost = /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/
          .test(req.headers.host ?? '');
        if (!localSocket || !localHost || req.method !== 'GET' ||
            req.headers['sec-fetch-site'] !== 'same-origin') {
          res.statusCode = 404;
          res.end();
          return;
        }
        try {
          const file = await stat(seedPath);
          if (!file.isFile() || file.size > 16384) throw Error('Invalid local terrain seed');
          const seed = await readFile(seedPath);
          if (createHash('sha256').update(seed).digest('hex') !== f4LocalTerrainDigest)
            throw Error('Invalid local terrain seed');
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'no-store');
          res.end(seed);
        } catch {
          res.statusCode = 404;
          res.end();
        }
      });
    }
  }],
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
