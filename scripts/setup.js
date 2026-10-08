#!/usr/bin/env node

/**
 * Guides Nepal - Automated Setup Script
 * This script sets up the development environment for the project
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Cross-platform Python: `python3` on macOS/Linux, `python`/`py` on Windows.
// Returns the first interpreter that responds to `--version`.
const getPythonCommand = () => {
  const candidates =
    process.platform === 'win32' ? ['python', 'py', 'python3'] : ['python3', 'python'];
  for (const c of candidates) {
    try {
      execSync(`${c} --version`, { stdio: 'pipe' });
      return c;
    } catch { /* try next */ }
  }
  return process.platform === 'win32' ? 'python' : 'python3';
};

// Path to the backend venv's python, OS-aware:
// Windows -> backend/.venv/Scripts/python.exe, macOS/Linux -> backend/.venv/bin/python
// NOTE: callers must quote the result (paths may contain spaces).
const venvBin = (...names) => {
  const dir = process.platform === 'win32' ? 'Scripts' : 'bin';
  if (process.platform === 'win32') {
    names = names.map((n) => (n === 'python' ? 'python.exe' : n));
  }
  return path.join('backend', '.venv', dir, ...names);
};

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.cyan}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
  step: (msg) => console.log(`\n${colors.bright}${colors.cyan}=== ${msg} ===${colors.reset}`)
};
const checkPrerequisites = async () => {
  log.step('Checking Prerequisites');

  const prerequisites = [
    { name: 'Node.js', command: 'node --version', minVersion: '18.0.0' },
    { name: 'npm', command: 'npm --version', minVersion: '8.0.0' },
    // Cross-platform: `python3` on macOS/Linux, `python`/`py` on Windows.
    // run-py.js resolves this automatically; here we just need *some* python.
    { name: 'Python', command: getPythonCommand() + ' --version', minVersion: '3.9.0' },
    { name: 'Git', command: 'git --version', minVersion: '2.0.0' }
  ];

  const results = {};

  for (const prereq of prerequisites) {
    try {
      const version = execSync(prereq.command, { encoding: 'utf8' }).trim();
      log.success(`${prereq.name}: ${version}`);
      results[prereq.name] = true;
    } catch (error) {
      log.error(`${prereq.name}: Not found`);
      results[prereq.name] = false;
    }
  }

  // Check for optional tools
  const optionalTools = [
    { name: 'Docker', command: 'docker --version' },
    { name: 'PostgreSQL', command: 'psql --version' }
  ];

  for (const tool of optionalTools) {
    try {
      const version = execSync(tool.command, { encoding: 'utf8' }).trim();
      log.success(`${tool.name}: ${version} (optional)`);
    } catch (error) {
      log.warning(`${tool.name}: Not found (optional)`);
    }
  }

  return results;
};

const setupEnvironmentFiles = async () => {
  log.step('Setting Up Environment Files');

  const envFiles = [
    { example: 'backend/.env.example', target: 'backend/.env' },
    { example: 'frontend/.env.example', target: 'frontend/.env' },
    { example: 'dashboard/.env.example', target: 'dashboard/.env' }
  ];

  for (const { example, target } of envFiles) {
    if (!fs.existsSync(target)) {
      if (fs.existsSync(example)) {
        fs.copyFileSync(example, target);
        log.success(`Created ${target} from ${example}`);
        log.warning(`Please update ${target} with your actual credentials`);
      } else {
        log.warning(`Example file ${example} not found`);
      }
    } else {
      log.info(`${target} already exists`);
    }
  }
};

const installFrontendDependencies = async () => {
  log.step('Installing Frontend Dependencies');

  // Cross-platform: run with cwd instead of `cd frontend && ...` so this
  // works in cmd.exe, PowerShell, and POSIX shells alike.
  if (runCommand('npm install', { cwd: path.join(__dirname, '..', 'frontend') })) {
    log.success('Frontend dependencies installed');
  } else {
    log.error('Failed to install frontend dependencies');
  }
};

const installDashboardDependencies = async () => {
  log.step('Installing Dashboard Dependencies');

  // Cross-platform: run with cwd instead of `cd dashboard && ...`.
  if (runCommand('npm install', { cwd: path.join(__dirname, '..', 'dashboard') })) {
    log.success('Dashboard dependencies installed');
  } else {
    log.error('Failed to install dashboard dependencies');
  }
};

const setupBackendEnvironment = async () => {
  log.step('Setting Up Backend Environment');

  const venvPath = path.join(__dirname, '..', 'backend', '.venv');

  if (!fs.existsSync(venvPath)) {
    log.info('Creating Python virtual environment...');
    // Cross-platform: run `python -m venv` with cwd=backend/ instead of
    // `cd backend && ...` (breaks cmd.exe quoting on Windows).
    if (runCommand(`${getPythonCommand()} -m venv .venv`, { cwd: path.join(__dirname, '..', 'backend') })) {
      log.success('Virtual environment created');
    } else {
      log.error('Failed to create virtual environment');
      return;
    }
  } else {
    log.info('Virtual environment already exists');
  }

  log.info('Installing backend dependencies...');
  // `python -m pip` (not the bare pip shim): reliable when the repo path
  // contains spaces and on Windows, where extensionless Scripts\pip may not
  // resolve. venvBin() picks Scripts (Windows) vs bin (macOS/Linux).
  if (runCommand(`"${venvBin('python')}" -m pip install -r backend/requirements.txt`)) {
    log.success('Backend dependencies installed');
  } else {
    log.error('Failed to install backend dependencies');
  }
};
const runCommand = (command, options = {}) => {
  try {
    // Cross-platform: cmd.exe cannot parse single-quoted paths (e.g. a venv
    // path with spaces), so strip single quotes on Windows before exec.
    // POSIX shells need the quoting, so it is kept there.
    const effective = process.platform === 'win32' ? command.replace(/'/g, '') : command;
    execSync(effective, { stdio: 'inherit', ...options });
    return true;
  } catch (error) {
    log.error(`Command failed: ${command}`);
    return false;
  }
};
const setupDatabase = async () => {
  log.step('Database Setup');

  const setupDb = await question('Do you want to set up the database? (y/n): ');

  if (setupDb.toLowerCase() === 'y') {
    log.info('Please ensure PostgreSQL is running and update backend/.env with your database credentials');
    const continueSetup = await question('Press Enter to continue or "s" to skip: ');

    if (continueSetup.toLowerCase() !== 's') {
      try {
        log.info('Running database migrations...');
        // Cross-platform: run-py.js finds backend/.venv on every OS and runs
        // from backend/, so no Scripts-vs-bin path handling is needed here.
        runCommand('node scripts/run-py.js -m alembic upgrade head');
        log.success('Database migrations completed');
      } catch (error) {
        log.warning('Database migration failed. You may need to configure DATABASE_URL first.');
      }
    }
  }
};

const setupGitHooks = async () => {
  log.step('Setting Up Git Hooks');

  if (runCommand('npm run prepare')) {
    log.success('Git hooks installed');
  } else {
    log.warning('Failed to install git hooks');
  }
};

const displayNextSteps = () => {
  log.step('Setup Complete!');

  console.log(`
${colors.bright}Next Steps:${colors.reset}

1. ${colors.cyan}Update environment files:${colors.reset}
   - backend/.env - Add your database URL and secret key
   - frontend/.env - Add your Supabase credentials
   - dashboard/.env - Add your Supabase credentials

2. ${colors.cyan}Start development servers:${colors.reset}
   - All services: ${colors.green}npm run dev${colors.reset}
   - Frontend only: ${colors.green}npm run dev:frontend${colors.reset}
   - Backend only: ${colors.green}npm run dev:backend${colors.reset}
   - Dashboard only: ${colors.green}npm run dev:dashboard${colors.reset}

3. ${colors.cyan}Run tests:${colors.reset}
   - All tests: ${colors.green}npm test${colors.reset}
   - E2E tests: ${colors.green}npm run test:e2e${colors.reset}

4. ${colors.cyan}Code quality:${colors.reset}
   - Lint: ${colors.green}npm run lint${colors.reset}
   - Format: ${colors.green}npm run format${colors.reset}
   - Type check: ${colors.green}npm run typecheck${colors.reset}

${colors.bright}Happy coding! 🚀${colors.reset}
`);
};

const main = async () => {
  console.log(`
${colors.bright}${colors.cyan}╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║                    Guides Nepal Setup                        ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}
`);

  try {
    await checkPrerequisites();
    await setupEnvironmentFiles();
    await installFrontendDependencies();
    await installDashboardDependencies();
    await setupBackendEnvironment();
    await setupDatabase();
    await setupGitHooks();
    await displayNextSteps();
  } catch (error) {
    log.error(`Setup failed: ${error.message}`);
    process.exit(1);
  } finally {
    rl.close();
  }
};

main();