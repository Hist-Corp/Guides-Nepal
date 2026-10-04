#!/usr/bin/env node
/**
 * Runs the workspace-local ESLint binary with the correct working directory.
 *
 * Usage: node scripts/run-eslint.js <workspace> <eslint-args...>
 *   e.g. node scripts/run-eslint.js frontend --fix src/components/Foo.tsx
 *
 * Why this exists:
 *   - The frontend uses ESLint 9 with a flat config (eslint.config.js) that is
 *     only discoverable when ESLint runs from inside the `frontend/` directory.
 *   - The dashboard uses ESLint 8 with a legacy .eslintrc.json.
 *   - Running `eslint` from the repo root resolves to a hoisted ESLint 8, which
 *     cannot find the frontend's flat config.
 *   - lint-staged's execa shell handling on Windows also mangles `cd <dir> && npx eslint`
 *     commands, so we avoid shell `cd` entirely by spawning with an explicit cwd.
 *
 * Resolution order:
 *   npm workspaces do not install every dependency into each workspace. A
 *   package is only present under `<workspace>/node_modules` when that
 *   workspace declares a conflicting version; otherwise it is hoisted to the
 *   repo root. In this repo `frontend` pins ESLint 9 (installed locally) while
 *   `dashboard` uses ESLint 8, which npm hoisted to the root. So a
 *   workspace-only lookup finds nothing for the dashboard and used to spawn a
 *   non-existent path, failing every commit that touched a dashboard file.
 *   We therefore look in the workspace first, then fall back to the root.
 */
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const workspace = process.argv[2];
const eslintArgs = process.argv.slice(3);

if (!workspace) {
  console.error('Usage: node scripts/run-eslint.js <workspace> <eslint-args...>');
  process.exit(1);
}

const workspaceDir = path.resolve(workspace);

// Resolve the workspace-local ESLint entry point. We invoke the package's
// `eslint.js` bin directly with Node to avoid depending on the `.cmd`/shell
// wrappers that npm creates (which misbehave under spawnSync on Windows).
// The workspace copy wins; anything npm hoisted to the repo root is the
// fallback. Both are run with the workspace as cwd so ESLint still discovers
// the correct config for that workspace.
const repoRoot = path.resolve(__dirname, '..');
const bin = process.execPath; // current node

const entryCandidates = [
  path.join(workspaceDir, 'node_modules', 'eslint', 'bin', 'eslint.js'),
  path.join(repoRoot, 'node_modules', 'eslint', 'bin', 'eslint.js'),
];
const entry = entryCandidates.find((candidate) => fs.existsSync(candidate));

let binPath = bin;
let args;
if (entry) {
  args = [entry, ...eslintArgs];
} else {
  // No `eslint.js` anywhere (unusual install): fall back to the `.bin` shim,
  // preferring the Windows `.cmd` wrapper when present.
  const shimCandidates = [
    path.join(workspaceDir, 'node_modules', '.bin', 'eslint'),
    path.join(repoRoot, 'node_modules', '.bin', 'eslint'),
  ];
  const cmdShim = shimCandidates.find((c) => fs.existsSync(`${c}.cmd`));
  const shim = cmdShim || shimCandidates.find((c) => fs.existsSync(c));
  if (!shim) {
    console.error(
      `Could not find ESLint for workspace "${workspace}". Looked in:\n` +
        entryCandidates.map((c) => `  ${c}`).join('\n')
    );
    process.exit(1);
  }
  binPath = cmdShim ? `${shim}.cmd` : shim;
  args = eslintArgs;
}

const result = spawnSync(binPath, args, {
  cwd: workspaceDir,
  stdio: 'inherit',
});

if (result.error) {
  // e.g. cwd does not exist — surface the reason instead of a bare exit code.
  console.error(`Failed to run ESLint for "${workspace}": ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
