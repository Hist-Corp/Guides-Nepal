# RENDER_DEPLOYMENT_TROUBLESHOOTING.md (archived)

Consolidated into **[DEPLOYMENT.md](./DEPLOYMENT.md)**. Common fixes: invalid `cors` package removed from requirements.txt; Dockerfile path is `backend/Dockerfile` in `render.yaml`; `DATABASE_URL` is `sync: false` — set it as a secret in the Render dashboard (URL-encode special chars, `@` → `%40`).
