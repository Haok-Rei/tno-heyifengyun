import { readdirSync, statSync, existsSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

const root = resolve('dist');
if (!existsSync(join(root, 'index.html'))) throw new Error('dist/index.html is missing; run vite build first.');
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);
const files = walk(root);
// Cloudflare Pages free-plan asset limits, verified 2026-09-26.
if (files.length > 20000) throw new Error(`Too many Pages assets: ${files.length}`);
for (const file of files) if (statSync(file).size > 25 * 1024 * 1024) throw new Error(`Pages asset exceeds 25 MiB: ${file}`);
for (const match of readFileSync(join(root, 'index.html'), 'utf8').matchAll(/(?:src|href)="(\/assets\/[^"\s]+)"/g)) {
  if (!existsSync(join(root, decodeURIComponent(match[1])))) throw new Error(`Missing HTML asset: ${match[1]}`);
}
for (const name of ['_headers', 'credits.txt']) if (!existsSync(join(root, name))) throw new Error(`Missing public asset: ${name}`);
const largest = files.reduce((a, b) => statSync(a).size > statSync(b).size ? a : b);
console.log(`Pages ready: ${files.length} files; largest ${(statSync(largest).size / 1024 ** 2).toFixed(2)} MiB; total ${(files.reduce((n, p) => n + statSync(p).size, 0) / 1024 ** 2).toFixed(1)} MiB.`);
