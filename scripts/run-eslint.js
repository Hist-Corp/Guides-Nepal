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
let eslintEntry = path.join(workspaceDir, 'node_modules', 'eslint', 'bin', 'eslint.js');
let bin = process.execPath; // current node
let args = [eslintEntry, ...eslintArgs];

if (!fs.existsSync(eslintEntry)) {
  // Fall back to whatever the `.bin` symlink points to.
  const shim = path.join(workspaceDir, 'node_modules', '.bin', 'eslint');
  eslintEntry = fs.existsSync(shim + '.cmd') ? shim + '.cmd' : shim;
  bin = eslintEntry;
  args = eslintArgs;
}

const result = spawnSync(bin, args, {
  cwd: workspaceDir,
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
