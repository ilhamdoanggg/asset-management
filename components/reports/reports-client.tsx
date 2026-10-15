"use client";

import * as React from "react";
import {
  BarChart3,
  Monitor,
  Layers,
  History,
  Download,
  Boxes,
  CircleDollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { MasterLayout } from "@/components/master/master-layout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/format";
import type {
  ComputerInventoryReportItem,
  CategoryValuationReportItem,
  ActivityLogReportItem,
  ReportsData,
} from "@/lib/reports";
import type { TranslationSchema } from "@/locales";

type Dict = TranslationSchema["reports"];

export function ReportsClient({
  data,
  dict,
}: {
  data: ReportsData;
  dict: Dict;
}) {
  const [activeTab, setActiveTab] = React.useState("computers");
  const [query, setQuery] = React.useState("");

  const filteredComputers = data.computers.filter((c) => {
    const q = query.toLowerCase();
    return (
      !q ||
      [
        c.asset_code,
        c.computer_name,
        c.user_name,
        c.department_name,
        c.current_room,
        c.ip_address,
        c.processor_detail,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  });

  const filteredValuations = data.categoryValuations.filter((v) => {
    const q = query.toLowerCase();
    return (
      !q ||
      [v.category_name, v.category_code]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  });

  const filteredHistory = data.recentHistory.filter((h) => {
    const q = query.toLowerCase();
    return (
      !q ||
      [h.asset_code, h.asset_name, h.action_type, h.actor_name, h.activity_summary]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  });

  const computerColumns: DataTableColumn<ComputerInventoryReportItem>[] = [
    {
      header: dict.tableAssetCode,
      cellClassName: "font-mono text-xs font-medium",
      render: (c) => c.asset_code,
    },
    {
      header: dict.tableComputerName,
      render: (c) => (
        <div className="flex flex-col">
          <span className="font-medium">{c.computer_name ?? dict.unassigned}</span>
          <span className="text-[11px] font-mono text-muted-foreground">
            {c.ip_address ?? "-"}
          </span>
        </div>
      ),
    },
    {
      header: dict.tableUser,
      cellClassName: "text-sm",
      render: (c) => (
        <div className="flex flex-col">
          <span>{c.user_name ?? dict.unassigned}</span>
          <span className="text-[11px] text-muted-foreground">
            {c.department_name ?? "-"}
          </span>
        </div>
      ),
    },
    {
      header: dict.tableRoom,
      cellClassName: "text-xs",
      render: (c) => c.current_room ?? dict.unassigned,
    },
    {
      header: dict.tableSpecs,
      render: (c) => (
        <div className="flex flex-col text-xs">
          <span>{c.processor_detail ?? "-"}</span>
          <span className="text-muted-foreground text-[11px]">
            {[
              c.ram_capacity_gb ? `${c.ram_capacity_gb}GB RAM` : null,
              c.storage_detail,
              c.os_name,
            ]
              .filter(Boolean)
              .join(" · ") || "-"}
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      render: (c) => (
        <Badge
          variant={c.asset_status === "in_use" ? "default" : "outline"}
          className="text-[11px]"
        >
          {c.asset_status}
        </Badge>
      ),
    },
  ];

  const valuationColumns: DataTableColumn<CategoryValuationReportItem>[] = [
    {
      header: dict.tableCategory,
      render: (v) => (
        <div className="flex flex-col">
          <span className="font-medium">{v.category_name}</span>
          <span className="font-mono text-xs text-muted-foreground">
            {v.category_code}
          </span>
        </div>
      ),
    },
    {
      header: dict.tableCount,
      cellClassName: "font-mono text-xs tabular-nums text-center",
      render: (v) => v.asset_count,
    },
    {
      header: dict.tableTotalValue,
      cellClassName: "text-right font-mono text-xs tabular-nums font-semibold",
      render: (v) => formatCurrency(v.total_purchase_cost),
    },
  ];

  const historyColumns: DataTableColumn<ActivityLogReportItem>[] = [
    {
      header: dict.tableTime,
      cellClassName: "font-mono text-xs text-muted-foreground",
      render: (h) => new Date(h.event_timestamp).toLocaleString("id-ID"),
    },
    {
      header: dict.tableAssetCode,
      render: (h) => (
        <div className="flex flex-col">
          <span className="font-medium">{h.asset_name}</span>
          <span className="font-mono text-xs text-muted-foreground">
            {h.asset_code}
          </span>
        </div>
      ),
    },
    {
      header: dict.tableAction,
      render: (h) => (
        <div className="flex flex-col">
          <span className="text-xs font-medium">{h.activity_summary}</span>
          <span className="text-[11px] font-mono text-muted-foreground">
            {h.action_type}
          </span>
        </div>
      ),
    },
    {
      header: dict.tableActor,
      cellClassName: "text-xs",
      render: (h) => h.actor_name ?? dict.unassigned,
    },
  ];

  function exportActiveCsv() {
    let rows: Record<string, unknown>[] = [];
    let filename = "report.csv";

    if (activeTab === "computers") {
      rows = filteredComputers as unknown as Record<string, unknown>[];
      filename = "inventaris-komputer.csv";
    } else if (activeTab === "valuation") {
      rows = filteredValuations as unknown as Record<string, unknown>[];
      filename = "valuasi-kategori.csv";
    } else {
      rows = filteredHistory as unknown as Record<string, unknown>[];
      filename = "log-aktivitas.csv";
    }

    if (rows.length === 0) return;

    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((h) => {
            const val = row[h];
            const str = val === null || val === undefined ? "" : String(val);
            return `"${str.replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <MasterLayout
      icon={BarChart3}
      title={dict.title}
      subtitle={dict.subtitle}
      addLabel={dict.exportCsv}
      onAdd={exportActiveCsv}
      stats={[
        {
          label: dict.totalComputers,
          value: data.metrics.totalComputers,
          icon: Monitor,
          tile: "bg-primary/10 text-primary",
        },
        {
          label: dict.totalAssets,
          value: data.metrics.totalAssets,
          icon: Boxes,
          tile: "bg-chart-2/15 text-chart-2",
        },
        {
          label: dict.totalValuation,
          value: formatCurrency(data.metrics.totalValuation),
          icon: CircleDollarSign,
          tile: "bg-chart-3/15 text-chart-3",
        },
      ]}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-2 border-b">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-fit">
          <TabsList>
            <TabsTrigger value="computers">{dict.tabComputers}</TabsTrigger>
            <TabsTrigger value="valuation">{dict.tabValuation}</TabsTrigger>
            <TabsTrigger value="history">{dict.tabHistory}</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button
          variant="outline"
          size="sm"
          onClick={exportActiveCsv}
          className="gap-1.5"
        >
          <Download className="size-3.5" />
          {dict.exportCsv}
        </Button>
      </div>

      {activeTab === "computers" && (
        <DataTable
          data={filteredComputers}
          columns={computerColumns}
          rowKey={(c) => c.asset_id}
          resetKey={query + activeTab}
          totalCount={data.computers.length}
          searchValue={query}
          onSearchChange={setQuery}
          searchPlaceholder={dict.searchPlaceholder}
          emptyText={dict.emptyComputers}
          emptyIcon={<Monitor className="size-5" />}
          labels={{
            showing: dict.showing,
            of: dict.of,
            previous: dict.previous,
            next: dict.next,
            page: dict.page,
            show: dict.show,
          }}
        />
      )}

      {activeTab === "valuation" && (
        <DataTable
          data={filteredValuations}
          columns={valuationColumns}
          rowKey={(v) => v.category_code}
          resetKey={query + activeTab}
          totalCount={data.categoryValuations.length}
          searchValue={query}
          onSearchChange={setQuery}
          searchPlaceholder={dict.searchPlaceholder}
          emptyText={dict.emptyValuation}
          emptyIcon={<Layers className="size-5" />}
          labels={{
            showing: dict.showing,
            of: dict.of,
            previous: dict.previous,
            next: dict.next,
            page: dict.page,
            show: dict.show,
          }}
        />
      )}

      {activeTab === "history" && (
        <DataTable
          data={filteredHistory}
          columns={historyColumns}
          rowKey={(h) => h.id}
          resetKey={query + activeTab}
          totalCount={data.recentHistory.length}
          searchValue={query}
          onSearchChange={setQuery}
          searchPlaceholder={dict.searchPlaceholder}
          emptyText={dict.emptyHistory}
          emptyIcon={<History className="size-5" />}
          labels={{
            showing: dict.showing,
            of: dict.of,
            previous: dict.previous,
            next: dict.next,
            page: dict.page,
            show: dict.show,
          }}
        />
      )}
    </MasterLayout>
  );
}
