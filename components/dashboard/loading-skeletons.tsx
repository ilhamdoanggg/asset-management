import * as React from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Route-level loading skeletons.
 *
 * These are rendered by the `loading.tsx` files under
 * `app/[locale]/dashboard/**`, which Next.js uses as an instant Suspense
 * fallback while the page's server data streams in. Each shape mirrors the real
 * page it stands in for (MasterLayout shell, dashboard overview, settings) so
 * the swap to real content keeps layout shift to a minimum.
 *
 * `role="status"` announces a single non-visual "Loading" message while the
 * placeholder bars stay decorative.
 */

function Status({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div role="status" aria-live="polite" className={className}>
      <span className="sr-only">Loading</span>
      {children}
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <Card className="shadow-xs">
      <CardContent className="flex items-center gap-3 p-4">
        <Skeleton className="size-10 shrink-0 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-14" />
          <Skeleton className="h-3 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

function TableSkeleton({ columns = 5, rows = 6 }: { columns?: number; rows?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-full rounded-md sm:max-w-xs" />
      </div>
      <div className="overflow-hidden rounded-md border">
        <div className="flex items-center gap-4 bg-muted/50 px-3 py-2.5">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-3 flex-1" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 border-t px-3 py-3.5">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton key={c} className={c === 0 ? "h-4 w-20 shrink-0" : "h-4 flex-1"} />
            ))}
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-56 rounded-md" />
      </div>
    </div>
  );
}

/** Matches the `MasterLayout` shell used by master-data pages. */
export function MasterPageSkeleton() {
  return (
    <Status className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="size-11 shrink-0 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-40 md:h-8 md:w-48" />
            <Skeleton className="h-4 w-56 max-w-full" />
          </div>
        </div>
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <Card className="shadow-xs">
        <CardContent className="p-4 md:p-6">
          <TableSkeleton />
        </CardContent>
      </Card>
    </Status>
  );
}

/** Matches the dashboard overview: hero valuation, metric grid, charts, recent table. */
export function DashboardPageSkeleton() {
  return (
    <Status className="flex flex-col gap-6">
      <Card className="overflow-hidden border-0 bg-muted/60 shadow-xs">
        <CardContent className="space-y-3 p-6">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-56 md:w-72" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-8 rounded-md" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="shadow-xs">
            <CardHeader>
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-xs">
        <CardHeader>
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-52" />
        </CardHeader>
        <CardContent>
          <TableSkeleton columns={5} rows={5} />
        </CardContent>
      </Card>
    </Status>
  );
}

/** Matches the settings page: heading, tab strip, and profile card. */
export function SettingsPageSkeleton() {
  return (
    <Status className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>

      <Skeleton className="h-10 w-full max-w-lg rounded-lg" />

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-56 max-w-full" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 shrink-0 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Status>
  );
}

function FieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-3.5 w-24" />
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  );
}

/** Matches the asset create/edit page: header, section cards, and action bar. */
export function AssetFormSkeleton() {
  return (
    <Status className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex items-start gap-3">
        <Skeleton className="size-9 shrink-0 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-40 md:h-8" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
      </div>

      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="shadow-xs">
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: i === 2 ? 4 : 6 }).map((_, f) => (
                <FieldSkeleton key={f} />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex items-center justify-end gap-2">
        <Skeleton className="h-9 w-20 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>
    </Status>
  );
}

/** Matches the asset detail page: header with status, overview, and history. */
export function AssetDetailSkeleton() {
  return (
    <Status className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Skeleton className="size-9 shrink-0 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48 md:h-8" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      <Card className="shadow-xs">
        <CardHeader>
          <Skeleton className="h-5 w-44" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-32 max-w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xs">
        <CardHeader>
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-56 max-w-full" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </Status>
  );
}

