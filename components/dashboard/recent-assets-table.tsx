"use client";

import * as React from "react";
import {
  Package,
  Laptop,
  Server,
  Car,
  HardHat,
  Armchair,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { formatCurrency } from "@/lib/format";
import type { RecentAssetItem } from "@/lib/dashboard";
import type { TranslationSchema } from "@/locales";

type Dict = TranslationSchema["dashboard"];

function getCategoryIcon(code: string) {
  switch (code) {
    case "LAPTOP":
      return Laptop;
    case "SERVER":
      return Server;
    case "VEHICLE":
      return Car;
    case "MACHINE":
      return HardHat;
    case "FURNITURE":
      return Armchair;
    default:
      return Package;
  }
}

function getStatusBadge(status: string, dict: Dict) {
  switch (status) {
    case "in_use":
      return { label: dict.statusAssigned, variant: "default" as const };
    case "active":
      return { label: dict.statusActive, variant: "default" as const };
    case "available":
      return { label: dict.statusAvailable, variant: "outline" as const };
    case "backup":
      return { label: dict.statusBackup, variant: "outline" as const };
    case "maintenance":
      return { label: dict.statusMaintenance, variant: "destructive" as const };
    case "damaged":
    case "broken":
      return { label: dict.statusDamaged, variant: "destructive" as const };
    case "disposed":
      return { label: dict.statusDisposed, variant: "secondary" as const };
    default:
      return { label: status, variant: "secondary" as const };
  }
}

export function RecentAssetsTable({
  assets,
  dict,
}: {
  assets: RecentAssetItem[];
  dict: Dict;
}) {
  const [query, setQuery] = React.useState("");

  const filtered = assets.filter((a) => {
    const q = query.toLowerCase();
    return (
      !q ||
      [a.code, a.name, a.category, a.assignee, a.department]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  });

  const columns: DataTableColumn<RecentAssetItem>[] = [
    {
      header: dict.assetCode,
      render: (a) => (
        <span className="font-mono text-xs font-semibold text-primary">
          {a.code}
        </span>
      ),
    },
    {
      header: dict.assetName,
      render: (a) => (
        <div className="flex flex-col">
          <span className="font-medium leading-snug">{a.name}</span>
          <span className="text-xs text-muted-foreground">{a.specs}</span>
        </div>
      ),
    },
    {
      header: dict.category,
      render: (a) => {
        const CategoryIcon = getCategoryIcon(a.categoryCode);
        return (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CategoryIcon className="size-3.5" />
            <span>{a.category}</span>
          </div>
        );
      },
    },
    {
      header: dict.assignee,
      render: (a) => (
        <div className="flex items-center gap-2">
          <Avatar className="size-6">
            <AvatarFallback className="bg-muted text-[10px] font-medium">
              {a.assignee.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-xs font-medium">{a.assignee}</span>
            <span className="text-[10px] text-muted-foreground">
              {a.department}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: dict.cost,
      headerClassName: "text-right",
      cellClassName: "text-right font-mono text-xs font-medium",
      render: (a) => formatCurrency(a.cost),
    },
    {
      header: dict.status,
      headerClassName: "w-28 text-center",
      render: (a) => {
        const statusInfo = getStatusBadge(a.status, dict);
        return (
          <div className="flex justify-center">
            <Badge variant={statusInfo.variant} className="text-[11px]">
              {statusInfo.label}
            </Badge>
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      data={filtered}
      columns={columns}
      rowKey={(a) => a.code}
      resetKey={query}
      totalCount={assets.length}
      searchValue={query}
      onSearchChange={setQuery}
      searchPlaceholder={dict.searchPlaceholder}
      emptyText={dict.emptyAssets}
      emptyIcon={<Package className="size-5" />}
      labels={{
        showing: dict.showing,
        of: dict.of,
        previous: dict.previous,
        next: dict.next,
        page: dict.page,
        show: dict.show,
      }}
    />
  );
}
