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
 * paths may be absolute or relative (resolved against the repo root).
 */
const path = require('path');

const toWorkspacePath = (workspace, file) =>
  path.relative(workspace, path.resolve(file)).split(path.sep).join('/');

const runEslint = (workspace, filenames) => {
  const files = filenames.map((f) => toWorkspacePath(workspace, f)).join(' ');
  return `node scripts/run-eslint.js ${workspace} --fix ${files}`;
};

const runPrettier = (filenames) => `npx prettier --write ${filenames.join(' ')}`;

module.exports = {
  'frontend/**/*.{ts,tsx}': (filenames) => [
    runEslint('frontend', filenames),
    runPrettier(filenames),
  ],
  'dashboard/**/*.{ts,tsx}': (filenames) => [
    runEslint('dashboard', filenames),
    runPrettier(filenames),
  ],
  'backend/**/*.py': ['black', 'ruff check --fix'],
};