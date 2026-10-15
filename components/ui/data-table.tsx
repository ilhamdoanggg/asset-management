"use client";

import * as React from "react";
import { Search } from "lucide-react";
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from "@/components/ui/table";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink,
  PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

export interface DataTableColumn<T> {
  header: React.ReactNode;
  render: (row: T) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}

export interface DataTableLabels {
  showing: string;
  of: string;
  previous: string;
  next: string;
  page: string;
  show: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  rowKey: (row: T, index: number) => string | number;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  /** change to reset back to page 1 (e.g. search query) */
  resetKey?: unknown;
  /** unfiltered row count; keeps the Show selector visible when a search yields 0 rows */
  totalCount?: number;
  emptyText: string;
  emptyIcon?: React.ReactNode;
  labels?: Partial<DataTableLabels>;
  minWidthClass?: string;
  /** when provided, renders a top toolbar: Show selector (left) + search input (right) */
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}

const DEFAULT_LABELS: DataTableLabels = {
  showing: "Showing",
  of: "of",
  previous: "Previous",
  next: "Next",
  page: "Page",
  show: "Show",
};

function PageSizeSelect({
  t, pageSize, pageSizeOptions, onChange,
}: {
  t: DataTableLabels;
  pageSize: number;
  pageSizeOptions: number[];
  onChange: (n: number) => void;
}) {
  return (
    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span>{t.show}</span>
      <NativeSelect
        size="sm"
        value={pageSize}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={t.show}
        className="w-18"
      >
        {pageSizeOptions.map((n) => (
          <NativeSelectOption key={n} value={n}>
            {n}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </label>
  );
}

export function DataTable<T>({
  data,
  columns,
  rowKey,
  defaultPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  resetKey,
  totalCount,
  emptyText,
  emptyIcon,
  labels,
  minWidthClass = "min-w-[720px]",
  searchValue,
  onSearchChange,
  searchPlaceholder,
}: DataTableProps<T>) {
  const t = { ...DEFAULT_LABELS, ...labels };
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(defaultPageSize);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => setPage(1), [resetKey]);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = data.slice((safePage - 1) * pageSize, safePage * pageSize);
  const rangeStart = data.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, data.length);

  const pageItems: (number | "…")[] = React.useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const nums = [...new Set([1, 2, safePage - 1, safePage, safePage + 1, totalPages - 1, totalPages])]
      .filter((n) => n >= 1 && n <= totalPages)
      .sort((a, b) => a - b);
    const out: (number | "…")[] = [];
    nums.forEach((n, i) => {
      if (i > 0 && n - nums[i - 1] > 1) out.push("…");
      out.push(n);
    });
    return out;
  }, [safePage, totalPages]);

  function goTo(p: number) {
    setPage(Math.min(totalPages, Math.max(1, p)));
  }

  function changePageSize(n: number) {
    setPageSize(n);
    setPage(1);
  }

  const withToolbar = onSearchChange !== undefined;
  const hasData = (totalCount ?? data.length) > 0;

  return (
    <div className="space-y-4">
      {withToolbar && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {hasData && (
            <PageSizeSelect t={t} pageSize={pageSize} pageSizeOptions={pageSizeOptions} onChange={changePageSize} />
          )}
          <div className="relative w-full sm:max-w-xs">
            <InputGroup>
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                value={searchValue ?? ""}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
              />
            </InputGroup>
          </div>
        </div>
      )}
      <div className="overflow-x-auto rounded-md border">
        <Table className={minWidthClass}>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {columns.map((c, i) => (
                <TableHead
                  key={i}
                  className={`text-xs font-semibold uppercase tracking-wide ${c.headerClassName ?? ""}`}
                >
                  {c.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody key={`${safePage}-${pageSize}-${data.length}`}>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <Empty>
                    <EmptyHeader>
                      {emptyIcon && <EmptyMedia>{emptyIcon}</EmptyMedia>}
                      <EmptyTitle>{emptyText}</EmptyTitle>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            ) : (
              paged.map((row, i) => (
                <TableRow
                  key={rowKey(row, i)}
                  className="animate-in fade-in-0 slide-in-from-bottom-1 duration-200 hover:bg-muted/40"
                  style={{ animationDelay: `${Math.min(i, 9) * 20}ms` }}
                >
                  {columns.map((c, j) => (
                    <TableCell key={j} className={c.cellClassName}>
                      {c.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {t.showing} {rangeStart}–{rangeEnd} {t.of} {data.length}
        </p>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {!withToolbar && hasData && (
            <PageSizeSelect t={t} pageSize={pageSize} pageSizeOptions={pageSizeOptions} onChange={changePageSize} />
          )}
          {totalPages > 1 && (
            <>
              <Pagination className="mx-0 w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    text={t.previous}
                    aria-label={t.previous}
                    aria-disabled={safePage === 1}
                    className={safePage === 1 ? "pointer-events-none opacity-40" : ""}
                    onClick={(e) => {
                      e.preventDefault();
                      goTo(safePage - 1);
                    }}
                  />
                </PaginationItem>
                {pageItems.map((item, i) =>
                  item === "…" ? (
                    <PaginationItem key={`ellipsis-${i}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={item}>
                      <PaginationLink
                        href="#"
                        isActive={item === safePage}
                        onClick={(e) => {
                          e.preventDefault();
                          goTo(item);
                        }}
                      >
                        {item}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    text={t.next}
                    aria-label={t.next}
                    aria-disabled={safePage === totalPages}
                    className={safePage === totalPages ? "pointer-events-none opacity-40" : ""}
                    onClick={(e) => {
                      e.preventDefault();
                      goTo(safePage + 1);
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>{t.page}</span>
              <NativeSelect
                size="sm"
                value={safePage}
                onChange={(e) => goTo(Number(e.target.value))}
                className="w-24"
              >
                {Array.from({ length: totalPages }, (_, i) => (
                  <NativeSelectOption key={i + 1} value={i + 1}>
                    {i + 1} / {totalPages}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </label>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
