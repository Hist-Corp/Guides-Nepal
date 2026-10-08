/**
 * lint-staged configuration
 *
 * ESLint must run from inside each workspace so that the correct ESLint
 * version and its configuration file are resolved:
 *   - frontend: ESLint 9 with flat config (eslint.config.js)
 *   - dashboard: ESLint 8 with legacy .eslintrc.json
 *
 * Running `eslint` from the repo root resolves to the hoisted ESLint 8,
 * which cannot find the frontend's flat config and fails.
 *
 * Note: functions are responsible for including the file paths themselves;
 * lint-staged does not append them to a function task.
 *
 * Two rules keep these tasks working on every platform:
 *
 * 1. Invoke tools as `node <path-to-bin>`, never via `npx`. Husky runs hooks
 *    with Git Bash on Windows, where the `npx` shell wrapper misbehaves: it
 *    either fails with '"node"' is not recognized or hangs outright. `node`
 *    itself resolves reliably in that shell.
 *
 * 2. Quote every path that is interpolated into a command string. lint-staged
 *    parses the command string on whitespace before running it, so an unquoted
 *    path is re-split at each space. This repo lives under "Guides Nepal", so
 *    unquoted absolute paths were shredded into "Guides" and
 *    "Nepal/dashboard/..." and prettier reported that no files matched.
 */
const path = require('path');

const toWorkspacePath = (workspace, file) =>
  path.relative(workspace, path.resolve(file)).split(path.sep).join('/');

const runEslint = (workspace, filenames) => {
  const files = filenames.map((f) => toWorkspacePath(workspace, f)).join(' ');
  return `node scripts/run-eslint.js ${workspace} --fix ${files}`;
};

const runPrettier = (filenames) => {
  const files = filenames.map((f) => `"${f}"`).join(' ');
  return `node node_modules/prettier/bin/prettier.cjs --write ${files}`;
};

module.exports = {
  'frontend/**/*.{ts,tsx}': (filenames) => [
    runEslint('frontend', filenames),
    runPrettier(filenames),
  ],
  'dashboard/**/*.{ts,tsx}': (filenames) => [
    runEslint('dashboard', filenames),
    runPrettier(filenames),
  ],
  // Run Python tools as `node scripts/run-py.js -m <tool>` so they use the
  // backend venv on every OS. Bare `black` / `ruff` fail on machines where
  // the venv is not activated (Windows especially) or where the shims are
  // not on PATH.
  //
  // These MUST be functions (not strings): lint-staged appends the staged
  // filenames to string tasks, but run-py.js always runs with cwd=backend/,
  // so root-relative paths like `backend/app/x.py` would resolve to the
  // non-existent `backend/backend/app/x.py`. Functions take control of the
  // filenames and relativize them to backend/ first.
  'backend/**/*.py': (filenames) => {
    const files = filenames
      .map((f) => path.relative('backend', path.resolve(f)).split(path.sep).join('/'))
      .map((f) => `"${f}"`)
      .join(' ');
    return [
      `node scripts/run-py.js -m black ${files}`,
      // `verify_auth.py` is excluded via [tool.ruff] extend-exclude in
      // pyproject.toml, but ruff ignores exclusions for files passed
      // explicitly on the command line. --force-exclude restores the
      // configured exclusion so E402 (intentional late imports in
      // verify_auth.py) no longer fails the pre-commit hook.
      `node scripts/run-py.js -m ruff check --force-exclude --fix ${files}`,
    ];
  },
};