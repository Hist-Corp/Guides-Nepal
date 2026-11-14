# FIX_PERMISSION_ERROR.md (archived)

The uploads-directory permission fix is already applied: `backend/Dockerfile` creates `app/uploads` and sets ownership before switching to the non-root user, and `backend/app/main.py` mounts `/uploads` defensively (warnings instead of crashes). See **[DEPLOYMENT.md](./DEPLOYMENT.md)**.
