# Kinertec — Asset Management

B2B asset-management web app: asset inventory, vendors, maintenance, depreciation, employees, and reporting — with per-user theming and Indonesian/English locales.

**Stack:** Next.js 16.4 (Turbopack) · React 19 · Tailwind CSS v4 · shadcn/ui (Base UI) · `postgres.js` · PostgreSQL 16 · Poppins + Open Sans

## Quickstart

```bash
docker compose up -d                                   # PostgreSQL 16 (asset_management_db)
cp .env.example .env.production 2>/dev/null; true     # set DATABASE_URL (no ?schema= param)
psql "$DATABASE_URL" -f database/001-db-setup.sql     # schema (DDL)
psql "$DATABASE_URL" -f database/002-seed.sql         # mock data
npm install && npm run dev                            # http://localhost:3000/id
```

Seeded login: check `database/002-seed.sql` (superadmin). After login you land on `/id/dashboard`.

## Project Structure

```
app/[locale]/              # id (default) + en routes; dashboard nested below
  dashboard/               # layout (sidebar + breadcrumb) + overview page
    vendors/ settings/     # feature pages (server components)
  login/ register/
app/actions/               # server actions (writes): auth, vendors, theme, settings
lib/                       # db, auth, dashboard/vendors queries, themes, constants, i18n
locales/id|en/             # type-safe dictionaries (id/en parity enforced by test)
components/
  ui/                      # shadcn primitives + data-table (shared table pattern)
  vendors/ dashboard/ settings/ auth/   # feature clients
database/                  # 001-db-setup.sql (schema) · 002-seed.sql (mock data)
proxy.ts                   # locale redirect + /dashboard* auth guard + security headers
```

## Conventions

- **READ** via Server Components calling `lib/*.ts` queries; **WRITE** via Server Actions with locale-aware `revalidatePath`.
- PKs are UUID (`string` in TS); tables use soft delete (`is_deleted = FALSE` filter).
- UI uses semantic theme tokens only; tables use `DataTable`; forms use `FieldGroup` + `Alert`; feedback via `toast.promise`.
- Full agent working rules live in `.agents/skills/asset-management/SKILL.md`.

## Verify

```bash
npx tsc --noEmit              # required after every change
npx tsx lib/auth.test.ts      # i18n parity + auth checks (lib/*.test.ts)
npm run build                 # for route/layout changes
```
