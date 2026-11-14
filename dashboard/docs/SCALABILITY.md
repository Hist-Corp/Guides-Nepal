# Scalability Notes

- Strict folder separation; independent build and deploy.
- Role-based layouts decouple features; add modules per role without cross-impact.
- API layer centralizes auth and token handling; interceptors for secure headers.
- Guards ensure RBAC at routing level; combine with backend enforcement.
- State kept minimal (auth + role); fetch data on-demand to avoid over-fetching.
- Vite + TS for fast builds; Tailwind for scalable design system reuse.
