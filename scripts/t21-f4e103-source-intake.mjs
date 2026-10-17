#!/usr/bin/env node
/**
 * F4E103F SOURCE INTAKE: local-only metadata, NOT an upload/publish utility.
 * It never copies source, edits the game or executes candidate files.
 * A clean path/regex check cannot determine copyright ownership.
 */
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const MAX_BYTES = 2 * 1024 * 1024;
const ROOT_FILES = new Set(['package.json','tsconfig.json','vite.config.ts','index.html']);
const CODE_EXTENSION = /^(?:\.ts|\.tsx|\.mts|\.cts|\.js|\.mjs|\.cjs|\.css)$/i;
const SENSITIVE_PATH = /(^|\/)(?:\.env(?:\..*)?|secrets?|private|credentials?|tokens?|api[-_]?keys?|node_modules|dist)(?:\/|$)/i;
const PROVENANCE_PATH = /(?:original|kitrix|temple01|face[-_]?id|source[-_]?pack|geometry|banc|asset|evidence)/i;
const SECRET_TEXT = /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|gh[pousr]_[a-z0-9]{20,}|github_pat_[a-z0-9_]{20,}|AKIA[A-Z0-9]{16}/i;
const ORIGINAL_TEXT = /(?:Vss_Temple01|KiTrix|Face[-_]?ID|source[-_]?pack|original(?:Source|Mesh|Geometry)|(?:Float32|Float64)Array\s*\(|\b(?:vertices|triangles)\s*[:=]\s*\[)/i;

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const under = (parent, child) => child === parent || child.startsWith(parent + sep);
const slash = s => s.split(sep).join('/');
function assertDirectory(path) {
  if (!existsSync(path) || !lstatSync(path).isDirectory()) throw Error('MISSING_DIRECTORY: ' + path);
}
function listFiles(root) {
  const files = [];
  function visit(dir, prefix) {
    for (const e of readdirSync(dir, { withFileTypes: true }).sort((a,b) => a.name.localeCompare(b.name))) {
      if (e.isSymbolicLink()) continue; // never follow links outside input tree
      const name = prefix ? prefix + '/' + e.name : e.name;
      const abs = join(dir, e.name);
      if (e.isDirectory()) visit(abs, name);
      else if (e.isFile() && CODE_EXTENSION.test(extname(e.name))) files.push(name);
    }
  }
  for (const dir of ['src', 'scripts']) {
    const abs = join(root, dir);
    if (existsSync(abs) && lstatSync(abs).isDirectory()) visit(abs, dir);
  }
  for (const name of ROOT_FILES) {
    const abs = join(root, name);
    if (existsSync(abs) && lstatSync(abs).isFile()) files.push(name);
  }
  return [...new Set(files)].sort();
}
function inspect(root, rel) {
  // Files are visited only through a narrow code path allowlist.
  if (!ROOT_FILES.has(rel) &&
      !(rel.startsWith('src/') || rel.startsWith('scripts/'))) return null;
  const normalized = slash(rel);
  if (SENSITIVE_PATH.test(normalized)) return { path: normalized, bytes: null, sha256: null, review: 'BLOCKED_SENSITIVE_PATH' };
  const abs = join(root, ...normalized.split('/'));
  const stat = lstatSync(abs);
  if (!stat.isFile()) return { path: normalized, bytes: null, sha256: null, review: 'BLOCKED_NOT_REGULAR_FILE' };
  if (stat.size > MAX_BYTES) return { path: normalized, bytes: stat.size, sha256: null, review: 'BLOCKED_LARGE_SOURCE_NEEDS_MANUAL_REVIEW' };
  const bytes = readFileSync(abs);
  if (bytes.includes(0)) return { path: normalized, bytes: bytes.length, sha256: null, review: 'BLOCKED_BINARY_DATA' };
  const content = bytes.toString('utf8');
  if (content.includes('\uFFFD')) return { path: normalized, bytes: bytes.length, sha256: null, review: 'BLOCKED_NON_UTF8' };
  const secrets = SECRET_TEXT.test(content);
  const provenance = PROVENANCE_PATH.test(normalized) || ORIGINAL_TEXT.test(content);
  return { path: normalized, bytes: bytes.length,
    sha256: secrets ? null : sha(bytes),
    review: secrets ? 'BLOCKED_POSSIBLE_SECRET' :
      provenance ? 'MANUAL_PROVENANCE_REVIEW' : 'MANUAL_CODE_REVIEW' };
}
export function scanSource(source, baseline = null) {
  const root = resolve(source);
  assertDirectory(root);
  const base = baseline ? resolve(baseline) : null;
  if (base) assertDirectory(base);
  const localNames = listFiles(root);
  const baseNames = base ? listFiles(base) : [];
  const union = [...new Set([...localNames, ...baseNames])].sort();
  const localSet = new Set(localNames);
  const baseSet = new Set(baseNames);
  const files = [];
  for (const path of union) {
    if (!localSet.has(path)) {
      files.push({path, change:'REMOVED_FROM_LOCAL', review:'MANUAL_CODE_REVIEW'});
      continue;
    }
    const file = inspect(root, path);
    if (!file) continue;
    let change = 'BASELINE_NOT_SUPPLIED';
    if (base) {
      if (!baseSet.has(path)) change = 'NEW';
      else {
        const b = inspect(base, path);
        change = b?.sha256 && file.sha256 && b.sha256 === file.sha256 ? 'UNCHANGED' : 'CHANGED_OR_UNVERIFIABLE';
      }
    }
    files.push({...file, change});
  }
  const counts = {};
  for (const file of files) {
    const key = file.change + '/' + file.review;
    counts[key] = (counts[key] || 0) + 1;
  }
  return {
    schema: 't21-f4e103-source-intake/v1',
    localGameVersion: 'UNVERIFIED',
    sourceContentIncluded: false,
    uploadPerformed: false,
    readyToPublish: false,
    windowsLauncherPresent: existsSync(join(root, 'RUN_F4E103F.cmd')),
    restoreLauncherPresent: existsSync(join(root, 'RESTORE_F4E103E_FROM_F4E103F.cmd')),
    comparedToProvidedBaseline: Boolean(base),
    fileCount: files.length,
    counts,
    files
  };
}
function usage() {
  return 'Usage: node scripts/t21-f4e103-source-intake.mjs --source <F4E103F Windows folder> [--baseline <checked-out dev branch>] [--out <JSON path>]. No upload is performed.';
}
function parseArgs(args) {
  const opts = {};
  while (args.length) {
    const a = args.shift();
    if (!['--source','--baseline','--out'].includes(a) || !args.length || args[0].startsWith('--')) throw Error(usage());
    if (opts[a]) throw Error('DUPLICATE_OPTION: ' + a);
    opts[a] = args.shift();
  }
  if (!opts['--source']) throw Error(usage());
  return opts;
}
export function cli(args) {
  const opts = parseArgs([...args]);
  const source = resolve(opts['--source']);
  const baseline = opts['--baseline'] ? resolve(opts['--baseline']) : null;
  if (opts['--out']) {
    const dest = resolve(opts['--out']);
    if (under(source, dest) || (baseline && under(baseline, dest))) {
      throw Error('OUTPUT_MUST_BE_OUTSIDE_INPUT_DIRECTORIES');
    }
    if (!existsSync(dirname(dest))) throw Error('OUTPUT_PARENT_MISSING');
    writeFileSync(dest, JSON.stringify(scanSource(source, baseline), null, 2) + '\n', {flag: 'wx'});
    process.stdout.write('T21_INTAKE_MANIFEST_CREATED (metadata-only; manual provenance review required)\n');
  } else {
    process.stdout.write(JSON.stringify(scanSource(source, baseline), null, 2) + '\n');
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { cli(process.argv.slice(2)); }
  catch (e) { console.error('T21_INTAKE_BLOCKED: ' + String(e.message || e)); process.exitCode = 1; }
}
