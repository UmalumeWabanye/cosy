const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const IGNORE_DIRS = new Set(['node_modules']);
const IGNORE_FILES = [/\.bak$/i, /backend\.pid$/i];

const files = [];

const walk = (dirPath) => {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      walk(fullPath);
      continue;
    }

    if (!entry.name.endsWith('.js')) continue;
    if (IGNORE_FILES.some((pattern) => pattern.test(entry.name))) continue;
    files.push(fullPath);
  }
};

walk(ROOT);

let failed = false;
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'pipe', encoding: 'utf8' });
  if (result.status !== 0) {
    failed = true;
    process.stderr.write(`\nSyntax error in ${path.relative(ROOT, file)}\n`);
    if (result.stderr) process.stderr.write(result.stderr);
  }
}

if (failed) {
  process.exit(1);
}

process.stdout.write(`Checked ${files.length} backend JS files. No syntax errors.\n`);
