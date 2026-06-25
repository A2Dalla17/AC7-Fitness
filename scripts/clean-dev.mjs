import fs from 'fs';
import path from 'path';

const root = process.cwd();
const targets = ['.next', path.join('node_modules', '.cache')];

for (const rel of targets) {
  const dir = path.join(root, rel);
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`Removed ${rel}`);
  }
}

console.log('Dev cache cleared. Start with: npm run dev');
