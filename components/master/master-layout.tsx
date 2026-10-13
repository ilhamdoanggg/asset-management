"use client";

import * as React from "react";
import { Plus, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedSection } from "@/components/dashboard/dashboard-animated";

export interface MasterStat {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  tile: string;
}

interface MasterLayoutProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  addLabel: string;
  onAdd: () => void;
  stats: MasterStat[];
  children: React.ReactNode;
}

/** Shared shell for master-data pages: header + stat cards + table card. */
export function MasterLayout({
  icon: Icon,
  title,
  subtitle,
  addLabel,
  onAdd,
  stats,
  children,
}: MasterLayoutProps) {
  return (
    <div className="flex flex-col gap-6">
      <AnimatedSection delay={0}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary to-primary/60 shadow-md shadow-primary/20 ring-1 ring-primary/30">
              <Icon className="size-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          <Button onClick={onAdd} size="sm" className="w-fit shadow-xs shadow-primary/20">
            <Plus data-icon="inline-start" />
            {addLabel}
          </Button>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.08}>
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <Card key={s.label} className="shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${s.tile}`}>
                  <s.icon className="size-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">{s.value}</p>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.16}>
        <Card className="shadow-xs">
          <CardContent className="flex flex-col gap-4 p-4 md:p-6">{children}</CardContent>
        </Card>
      </AnimatedSection>
    </div>
  );
}
