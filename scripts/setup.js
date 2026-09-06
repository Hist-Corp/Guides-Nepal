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
    { name: 'Python', command: 'python --version', minVersion: '3.9.0' },
    { name: 'pip', command: 'pip --version', minVersion: '21.0.0' },
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

  if (runCommand('cd frontend && npm install')) {
    log.success('Frontend dependencies installed');
  } else {
    log.error('Failed to install frontend dependencies');
  }
};

const installDashboardDependencies = async () => {
  log.step('Installing Dashboard Dependencies');

  if (runCommand('cd dashboard && npm install')) {
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
    if (runCommand('cd backend && python -m venv .venv')) {
      log.success('Virtual environment created');
    } else {
      log.error('Failed to create virtual environment');
      return;
    }
  } else {
    log.info('Virtual environment already exists');
  }

  log.info('Installing backend dependencies...');
  if (runCommand('cd backend && .venv\\Scripts\\pip install -r requirements.txt')) {
    log.success('Backend dependencies installed');
  } else {
    log.error('Failed to install backend dependencies');
  }
};
const runCommand = (command, options = {}) => {
  try {
    execSync(command, { stdio: 'inherit', ...options });
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
        runCommand('cd backend && .venv\\Scripts\\alembic upgrade head');
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