# Changelog

All notable changes to this project are documented in this file.

The format is based on "Keep a Changelog" and is intended to give contributors and deployers a concise overview of recent work.

## [Unreleased]
### Changed
- Documentation overhaul: consolidated the 18 overlapping deployment/security documents into canonical [DEPLOYMENT.md](DEPLOYMENT.md) and [SECURITY.md](SECURITY.md) (old files are now redirect stubs).
- Rewrote docs/DEVELOPMENT_SETUP.md, docs/ARCHITECTURE.md, docs/FOLDER_STRUCTURE.md and dashboard/README.md to match the current code (ports 5175/5176/8000, actual env vars, 8-role RBAC, current API routers, CI workflows, testing setup).

## [1.0.1] - 2026-09-08
### Added
- Improved developer documentation and onboarding (README updates).
- Example environment files for frontend and backend.

### Changed
- Minor UX and tooling improvements across frontend and dashboard.

## [1.0.0] - Initial public release
- Base platform: React + Vite frontend, FastAPI backend, PostgreSQL.
- Core features: browsing experiences, bookings, user profiles, AI chat integration (Maila Dai), RBAC dashboard.

## Notes
- For the full commit history, use the repository commit log on GitHub.
- When preparing releases, update this file and move Unreleased items into a new version section.
