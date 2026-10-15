---
name: asset-management
description: "Working conventions for the Kinertec asset-management app (Next.js 16 + shadcn + PostgreSQL). Use when adding pages, tables, server actions, queries, locales, or theme-aware UI in this repo. Covers locale routing, server-component reads vs server-action writes, UUID/soft-delete schema rules, i18n parity, and the shared DataTable pattern."
---

# Asset Management (Kinertec) — Project Skill

B2B asset-management SaaS. Next.js 16.4 (Turbopack) + React 19 + Tailwind CSS v4 + shadcn (Base UI) + `postgres.js` + PostgreSQL 16. Brand: **Kinertec** (`public/logo.png`).

## Stack & Commands

- `docker compose up -d` → PostgreSQL 16 (`asset_management_db`). `DATABASE_URL` in `.env.example` (no `?schema=` param — postgres.js rejects it).
- Schema: `database/001-db-setup.sql` (DDL only). Mock data: `database/002-seed.sql`. Apply in order to a fresh DB.
- `npm run dev` / `npm run build` / `npm start`. Verify every change: `npx tsc --noEmit` (+ `npm run build` for route/layout changes).
- Tests: plain `node:assert` self-checks in `lib/*.test.ts`, run with a TS-capable runner (e.g. `npx tsx lib/auth.test.ts`).

## Architecture Rules

1. **READ in Server Components, WRITE in Server Actions.** Queries live in `lib/*.ts` (`lib/dashboard.ts`, `lib/vendors.ts`) and are called directly from `app/[locale]/dashboard/**/page.tsx`. Mutations live in `app/actions/*.ts` and call `revalidatePath('/{locale}/...')` using the locale cookie.
2. **Locale routing.** All pages under `app/[locale]/` (`id` default, `en`). Dictionaries in `locales/{id,en}/index.ts` typed by `locales/types.ts`. Every new key must exist in both locales — asserted by `lib/auth.test.ts` parity check.
3. **Auth & guards.** `lib/auth.ts` (scrypt passwords, HMAC-signed session cookie). `proxy.ts` guards `/dashboard*` and redirects to `/{locale}/login`. After login/register → `/{locale}/dashboard`.
4. **Schema rules.** PKs are `UUID DEFAULT gen_random_uuid()` (never BIGSERIAL). Every entity table carries audit columns (`created_at/created_by/updated_at/updated_by/deleted_at/deleted_by/is_deleted`) and queries filter `is_deleted = FALSE`. IDs are `string` in TS. Table roles: Master (lookup/reference), Transaction (state changes, FK-guarded), Log (append-only history, never edited).
5. **Concurrency & invariant guards (in DB, not app code).** One active checkout per asset: `UNIQUE INDEX uq_active_asset_assignment ON asset_assignments(asset_id) WHERE returned_at IS NULL`. License seats: `CHECK (seats_used <= seats_total)` on `software_licenses` + `trg_fn_sync_license_seats()` (BEFORE INSERT allocates only if capacity remains, else `RAISE 'License seats exhausted'`; AFTER DELETE decrements). History trigger `trg_fn_log_asset_history` records `NEW.created_by/updated_by` — asset write actions must pass the session user id through.
6. **Theme.** 7 palettes + radius + light/dark/system, persisted per user in DB and restored to cookies on login (`lib/themes.ts`, `app/actions/theme.ts`). UI must use semantic theme tokens only — no hardcoded hex, no hardcoded gradients.
7. **Tables.** Always use `components/ui/data-table.tsx`: toolbar (Show selector left, search right via `searchValue`/`onSearchChange`), footer (Showing-text left, Show + Prev/number/Next + page jumper right). Never use raw `PaginationLink` with text children — use `PaginationPrevious`/`PaginationNext`. Wrap tables in `overflow-x-auto`.
8. **Forms & feedback.** shadcn `FieldGroup`+`Field`, errors via `Alert`, loading via `Skeleton`/`Spinner`, mutations wrapped in `toast.promise`. No native `confirm()`. Form modals use `DismissibleDialog` (dismiss via footer buttons, the X button, ESC or overlay click; confirms before discarding edits). Keep `BlockingDialog`/`BlockingAlertDialog` only where blocking is intentional (e.g. destructive confirmations). Route changes show an instant skeleton through `loading.tsx` files under `app/[locale]/dashboard/**` (shared shapes in `components/dashboard/loading-skeletons.tsx`).
9. **Fonts.** Poppins (display) + Open Sans (body) via `next/font/google`; headings use `font-heading`. Lucide icons only, no emoji.
