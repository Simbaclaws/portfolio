import { readdir, readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { join, relative } from 'node:path';
async function walk(dir) { for (const entry of await readdir(dir, { withFileTypes: true })) { const path = join(dir, entry.name); if (entry.isDirectory()) await walk(path); else { const bytes = await readFile(path); console.log(`${relative('dist', path)}: ${bytes.length} bytes; gzip ${gzipSync(bytes).length} bytes`); } } }
await walk('dist');
