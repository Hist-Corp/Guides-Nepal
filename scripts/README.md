# Scripts

This directory contains automation scripts for the Guides Nepal project.

## Available Scripts

### setup.js

Automated setup script for the development environment.

```bash
node scripts/setup.js
```

This script will:
1. Check for required prerequisites (Node.js, npm, Python, pip, Git)
2. Create environment files from templates
3. Install frontend dependencies
4. Install dashboard dependencies
5. Set up Python virtual environment and install backend dependencies
6. Optionally set up the database
7. Install git hooks

## Usage

### Initial Setup

```bash
# Run the automated setup
npm run setup
```

### Manual Setup

If you prefer to set up manually:

1. Install dependencies:
   ```bash
   cd frontend && npm install
   cd ../dashboard && npm install
   cd ../backend && python -m venv .venv
   .venv\Scripts\pip install -r requirements.txt
   ```

2. Create environment files:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   cp dashboard/.env.example dashboard/.env
   ```

3. Update environment files with your credentials

4. Install git hooks:
   ```bash
   npm run prepare
   ```