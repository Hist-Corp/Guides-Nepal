# CI/CD Pipeline Documentation

This project uses **GitHub Actions** for Continuous Integration and Continuous Deployment (CI/CD) of the backend. The pipeline ensures code quality, security, and build readiness before any code is merged into the main branch.

## 🚀 Workflow Overview

The pipeline is defined in `.github/workflows/backend-ci.yml` and triggers on:
- **Push** to the `main` branch
- **Pull Request** targeting the `main` branch

The workflow operates exclusively on the `backend/` directory.

---

## 🛠 Pipeline Stages

The pipeline consists of 5 sequential stages. If any stage fails, the pipeline stops.

### 1. Code Quality (`quality`)
Ensures the codebase enforces strict style and type definitions.
- **Tools**:
  - `black`: Checks code formatting.
  - `ruff`: Lints for bugs and style violations.
  - `mypy`: Enforces static type checking.

### 2. Testing (`test`)
Validates application logic and API behavior.
- **Tools**:
  - `pytest`: Runs unit and integration tests.
- **Policy**: The pipeline fails immediately if any test fails.

### 3. Security Scanning (`security`)
Detects vulnerabilities in code and dependencies.
- **Tools**:
  - **Safety**: Checks installed dependencies against a database of known vulnerabilities.
  - **Bandit**: Scans Python code for common security issues (e.g., hardcoded secrets, SQL injection risks).
  - **TruffleHog**: Scans the git history and filesystem for high-entropy strings and secrets.

### 4. Build & Validate (`build`)
Ensures the application can be containerized successfully.
- **Actions**:
  - **Hadolint**: Lints the `Dockerfile` for best practices.
  - **Docker Compose**: Validates `docker-compose.yml` configuration.
  - **Docker Build**: Builds the production Docker image to ensure no build errors.

### 5. Readiness Check (`readiness`)
Simulates a pre-deployment check.
- **Checks**:
  - **Environment Variables**: Verifies that critical variables (`DATABASE_URL`, `SECRET_KEY`, `ENV`) are set.
  - **Mock DB Connection**: Ensures the database driver (`psycopg2`) is installed and the connection string is valid (without actually connecting to a live DB).
  - **Migration Dry-Run**: Runs `alembic upgrade head --sql` to verify that migration scripts generate valid SQL.

---

## 💻 Local Development & Verification

You can replicate most of the CI checks locally using the provided scripts.

### Running Quality & Security Checks
Use the `run_checks.sh` script to run formatting, linting, testing, and basic security checks (Bandit).

```bash
cd backend
./scripts/run_checks.sh
```

### Running Readiness Checks
To simulate the deployment readiness check:

```bash
cd backend
export DATABASE_URL="postgresql://user:pass@localhost:5432/db"
export SECRET_KEY="dev-secret"
export ENV="development"
python scripts/check_readiness.py
```

### Checking Migrations
To verify your migrations generate valid SQL:

```bash
cd backend
alembic upgrade head --sql
```

---

## 🔍 Troubleshooting

### Common Failures

- **Black/Ruff Errors**: Run `black .` and `ruff check --fix .` locally to fix formatting issues automatically.
- **Mypy Errors**: Ensure you have type hints for all function arguments and return values.
- **Safety Errors**: If a dependency is flagged, upgrade it in `requirements.txt`.
- **Bandit Errors**: If you have a false positive (e.g., "hardcoded password" in a test), mark the line with `# nosec`.
- **Readiness Failed**: Ensure you have `psycopg2-binary` installed and your environment variables are set correctly in the CI configuration.

### Secrets Management
Secrets are managed via **GitHub Secrets**. Do not commit `.env` files. The CI pipeline injects these secrets securely during the run.

---

## 🔒 Security Baseline

This pipeline enforces the following security baselines:
- **No Insecure Dependencies**: All packages are scanned.
- **No Hardcoded Secrets**: Code and history are scanned.
- **Secure Configuration**: Dockerfiles and Compose files are validated.
- **Type Safety**: Strict typing prevents common runtime errors.
