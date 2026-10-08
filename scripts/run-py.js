#!/usr/bin/env node
/**
 * Cross-platform Python runner for Guides Nepal npm scripts.
 * Windows has `python` / `py`, macOS/Linux usually have `python3`.
 * This finds a working interpreter and forwards args, so
 * `node scripts/run-py.js -m uvicorn ...` works on every OS.
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const backendDir = path.resolve(__dirname, '..', 'backend');

// Prefer backend/.venv when it exists (created by `npm run setup` or manual venv).
const venvPython =
  process.platform === 'win32'
    ? path.join(backendDir, '.venv', 'Scripts', 'python.exe')
    : path.join(backendDir, '.venv', 'bin', 'python');

const candidates = [];
if (process.env.GUIDES_NEPAL_PYTHON) {
  candidates.push(process.env.GUIDES_NEPAL_PYTHON);
} else {
  if (fs.existsSync(venvPython)) candidates.push(venvPython);
  if (process.platform === 'win32') {
    candidates.push('python', 'py', 'python3');
  } else {
    candidates.push('python3', 'python');
  }
}

function tryCandidate(cmd) {
  const flag = cmd === 'py' ? ['-3', '--version'] : ['--version'];
  const r = spawnSync(cmd, flag, { stdio: 'pipe', shell: process.platform === 'win32' });
  return r.status === 0 ? cmd : null;
}

let python = null;
for (const c of candidates) {
  try {
    if (tryCandidate(c)) { python = c; break; }
  } catch { /* try next */ }
}

if (!python) {
  console.error('❌ No Python interpreter found. Install Python 3.9+ and ensure `python3` (macOS/Linux) or `python` (Windows) is on PATH.');
  process.exit(1);
}

const extra = python === 'py' ? ['-3'] : [];
const args = process.argv.slice(2);
const res = spawnSync(python, [...extra, ...args], {
  stdio: 'inherit',
  shell: false,
  // Backend modules live in backend/, so always run from there regardless of OS/shell.
  cwd: backendDir,
});
process.exit(res.status ?? 1);
