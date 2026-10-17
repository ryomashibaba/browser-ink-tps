import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { scanSource, cli } from './t21-f4e103-source-intake.mjs';

function fixture(fn) {
  const temp = mkdtempSync(join(tmpdir(), 't21-source-intake-'));
  const local = join(temp, 'local'), baseline = join(temp, 'baseline');
  mkdirSync(join(local, 'src', 'game'), {recursive:true});
  mkdirSync(join(local, 'src', 'private'), {recursive:true});
  mkdirSync(join(local, 'scripts'), {recursive:true});
  mkdirSync(join(local, 'public'), {recursive:true});
  mkdirSync(join(baseline, 'src', 'game'), {recursive:true});
  writeFileSync(join(local, 'src', 'game', 'player.ts'), 'export const speed=2;\n');
  writeFileSync(join(baseline, 'src', 'game', 'player.ts'), 'export const speed=1;\n');
  writeFileSync(join(baseline, 'src', 'game', 'removed.ts'), 'export const removed=true;\n');
  writeFileSync(join(local, 'src', 'game', 'unchanged.ts'), 'export const unchanged=true;\n');
  writeFileSync(join(baseline, 'src', 'game', 'unchanged.ts'), 'export const unchanged=true;\n');
  writeFileSync(join(local, 'src', 'private', 'token.ts'), 'DO_NOT_COPY');
  writeFileSync(join(local, 'src', 'game', 'possible_secret.ts'),
    'const key="ghp_123456789012345678901234567890";\n');
  writeFileSync(join(local, 'src', 'game', 'original_geometry.ts'),
    'const mesh=new Float64Array([1,2,3]);\n');
  writeFileSync(join(local, 'public', 'Vss_Temple01.obj'), 'ORIGINAL_NEVER_INCLUDE');
  writeFileSync(join(local, 'src', 'game', 'binary.ts'), Buffer.from([0,1,2,3]));
  writeFileSync(join(local, 'package.json'), '{"name":"sample"}\n');
  writeFileSync(join(local, 'RUN_F4E103F.cmd'), 'echo hello');
  writeFileSync(join(local, 'RESTORE_F4E103E_FROM_F4E103F.cmd'), 'echo restore');
  try { symlinkSync(join(local, 'public'), join(local, 'src', 'game', 'symlink'), 'dir'); } catch {}
  try { return fn({temp,local,baseline}); }
  finally { rmSync(temp, {recursive:true,force:true}); }
}
test('reports only allowed code paths, relative names and hashes, never code bodies or extracted assets', () =>
  fixture(({temp,local,baseline}) => {
    const report = scanSource(local, baseline);
    assert.equal(report.schema, 't21-f4e103-source-intake/v1');
    assert.equal(report.readyToPublish, false);
    assert.equal(report.uploadPerformed, false);
    assert.equal(report.sourceContentIncluded, false);
    assert.equal(report.windowsLauncherPresent, true);
    assert.equal(report.restoreLauncherPresent, true);
    assert.equal(report.comparedToProvidedBaseline, true);
    const files = new Map(report.files.map(f => [f.path, f]));
    assert.equal(files.get('src/game/player.ts').change, 'CHANGED_OR_UNVERIFIABLE');
    assert.equal(files.get('src/game/unchanged.ts').change, 'UNCHANGED');
    assert.equal(files.get('src/game/removed.ts').change, 'REMOVED_FROM_LOCAL');
    assert.equal(files.get('src/private/token.ts').review, 'BLOCKED_SENSITIVE_PATH');
    assert.equal(files.get('src/game/possible_secret.ts').review, 'BLOCKED_POSSIBLE_SECRET');
    assert.equal(files.get('src/game/possible_secret.ts').sha256, null);
    assert.equal(files.get('src/game/binary.ts').review, 'BLOCKED_BINARY_DATA');
    assert.equal(files.get('src/game/original_geometry.ts').review, 'MANUAL_PROVENANCE_REVIEW');
    assert(!files.has('public/Vss_Temple01.obj'));
    assert(!files.has('src/game/symlink/Vss_Temple01.obj'));
    const text = JSON.stringify(report);
    assert(!text.includes('DO_NOT_COPY'));
    assert(!text.includes('ORIGINAL_NEVER_INCLUDE'));
    assert(!text.includes('ghp_123456789012345678901234567890'));
    assert(!text.includes(local));
    assert(!text.includes(temp));
  })
);
test('refuses to overwrite source or baseline tree and writes a metadata-only file outside both', () =>
  fixture(({temp,local,baseline}) => {
    assert.throws(() => cli(['--source',local,'--out',join(local,'report.json')]), /OUTPUT_MUST_BE_OUTSIDE/);
    assert.throws(() => cli(['--source',local,'--baseline',baseline,'--out',join(baseline,'report.json')]), /OUTPUT_MUST_BE_OUTSIDE/);
    const out = join(temp, 'review.json');
    cli(['--source',local,'--baseline',baseline,'--out',out]);
    const report = JSON.parse(readFileSync(out,'utf8'));
    assert.equal(report.fileCount >= 5, true);
    assert.throws(() => cli(['--source',local,'--out',out]), /EEXIST/);
    assert.throws(() => cli(['--out',out]), /Usage/);
  })
);
