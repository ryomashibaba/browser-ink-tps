import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';

// Only deterministic extractor output is served, and only over same-origin loopback.
const f4LocalTerrainDigests = new Set([
  '1be11fc133cabe79c65cf3ff21fd7b4a94ed6170665d930ecc1986e41c6d22bd',
  '0dc7619966269fd7971684d3e41460bf589e6db084c12d7dc025379500a2cd51',
  'f1abf5d891b6ba00320eef8f0e7bb8f0596450438023f2f9efeb30ace46268da',
  '6cf07d15c26501a37dc2b1482e69ba0675c5c93d3bddee6a7c41a82e126046d5',
  '6ec414cf162fe4a2b5aafeca6c1625e129dadc8bb18b47c55fddf68ff6cb6fa3'
]);

export default defineConfig({
  plugins: [{
    name: 't21-f4-local-original-terrain',
    configureServer(server) {
      // T21_F4_4176_HOME_V1: research-only loopback home, never production.
      // Root redirects to the ONE F4 target supplied by the validated launcher.
      // An unconfigured port 4176 must not silently display the old T20 lab.
      server.middlewares.use(async (req, res, next) => {
        if (req.method !== 'GET' || req.url !== '/' ||
            req.socket.localPort !== 4176) return next();
        const localHost = ['127.0.0.1:4176', 'localhost:4176', '[::1]:4176']
          .includes(req.headers.host ?? '');
        const localSocket = ['127.0.0.1', '::1', '::ffff:127.0.0.1']
          .includes(req.socket.remoteAddress ?? '');
        if (!localHost || !localSocket) {
          res.statusCode = 404;
          res.end();
          return;
        }
        const seedPath = process.env.T21_F4_LOCAL_TERRAIN;
        const home = process.env.T21_F4_HOME_TARGET;
        const requiredHome: Record<string, string> = {
          t21Play: 'preview', t21QaDrive: 'source',
          t21W10B183: 'firstDropPlay', t21W10B192: 'humanCombat',
          t21W10B203: 'fullRound', t21W10B441: 'sourceFrontline',
          t21W10B448: 'realA3Front', t21F4Central: 'research',
          t21F4Terrain: 'original', t21F4Trimesh: 'full'
        };
        const params = home?.startsWith('/?') && home.length <= 600 &&
          !home.includes('#') ? new URLSearchParams(home.slice(2)) : null;
        const permitted = params?.size === Object.keys(requiredHome).length &&
          Object.entries(requiredHome).every(([key, value]) =>
            params.getAll(key).length === 1 && params.get(key) === value);
        let ready = !!seedPath && !!permitted;
        if (ready) {
          try {
            const info = await stat(seedPath!);
            if (!info.isFile() || info.size > 48 * 1024) throw Error('F4 seed size');
            const seed = await readFile(seedPath!);
            ready = f4LocalTerrainDigests.has(
              createHash('sha256').update(seed).digest('hex'));
          } catch {
            ready = false;
          }
        }
        res.setHeader('Cache-Control', 'no-store');
        if (!ready) {
          res.statusCode = 503;
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end('F4 HOLD: verified local terrain/launcher not configured.\nStart PLAY_F4_ORIGINAL_RETURN_WINDOWS.cmd with a pinned local JSON.\nNo source or game state was changed.');
          return;
        }
        res.statusCode = 302;
        res.setHeader('Location', home!);
        res.end();
      });
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
          if (!file.isFile() || file.size > 48 * 1024) throw Error('Invalid local terrain seed');
          const seed = await readFile(seedPath);
          if (!f4LocalTerrainDigests.has(createHash('sha256').update(seed).digest('hex')))
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
