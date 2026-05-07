# Server Workspace

Hono API for machines, members, and sessions.

Required environment variables:

- `DATABASE_URL`
- `MACHINE_KEY_SECRET`
- `JWT_SECRET` - at least 32 characters
- `SUPERADMIN_EMAIL`
- `SUPERADMIN_PASSWORD` - at least 8 characters

Auth:

- `POST /api/auth/login` returns a JWT valid for 24 hours.
- `GET /api/auth/me` returns the current admin account.
- `POST /api/auth/admins` creates an admin account and requires the automatically-created superadmin account.

Protected API routes require `Authorization: Bearer <token>`. Machine heartbeat and scan-request endpoints remain protected by `x-machine-key` instead of admin JWT.

Run in development:

```bash
bun run dev
```

Drizzle commands:

```bash
bun run db:generate
bun run db:push
```
