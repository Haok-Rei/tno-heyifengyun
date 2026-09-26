import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve, join, dirname, relative, sep } from 'node:path';

const root = process.cwd();
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);
let checked = 0;
for (const file of walk('src').filter(p => /\.(ts|tsx)$/.test(p))) {
  const text = readFileSync(file, 'utf8');
  for (const match of text.matchAll(/new URL\(['"]([^'"]+)['"],\s*import\.meta\.url\)/g)) {
    if (/^[a-z]+:/i.test(match[1])) continue;
    const full = resolve(dirname(file), match[1]);
    const parts = relative(root, full).split(sep);
    if (parts[0] === '..') throw new Error(`Asset escapes repository: ${file}: ${match[1]}`);
    let dir = root;
    for (const part of parts) {
      if (!existsSync(dir) || !readdirSync(dir).includes(part)) throw new Error(`Missing or incorrectly cased asset: ${file}: ${match[1]}`);
      dir = join(dir, part);
    }
    checked++;
  }
}
if (!existsSync('music') || !readdirSync('music').some(n => n.endsWith('.mp3'))) throw new Error('Music playlist is empty.');
console.log(`Verified ${checked} local asset references, including Linux filename casing.`);
