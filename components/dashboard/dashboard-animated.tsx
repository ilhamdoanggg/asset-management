"use client";

import * as React from "react";
import { motion, Reorder } from "motion/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MetricCardData } from "@/types";
import {
  Package,
  CircleDollarSign,
  CheckCircle2,
  Wrench,
  ShieldCheck,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";

const METRIC_ICONS: Record<string, LucideIcon> = {
  package: Package,
  value: CircleDollarSign,
  active: CheckCircle2,
  backup: ShieldCheck,
  damaged: AlertTriangle,
  maintenance: Wrench,
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

const ORDER_KEY = "kinertec:metric-order:v1";

function restoreOrder(metrics: MetricCardData[]): MetricCardData[] {
  if (typeof window === "undefined") return metrics;
  try {
    const saved = JSON.parse(localStorage.getItem(ORDER_KEY) ?? "[]") as string[];
    if (!Array.isArray(saved) || saved.length === 0) return metrics;
    const byIcon = new Map(metrics.map((m) => [m.icon, m]));
    const ordered = saved.flatMap((icon) => (byIcon.has(icon) ? [byIcon.get(icon)!] : []));
    for (const m of metrics) if (!ordered.includes(m)) ordered.push(m);
    return ordered;
  } catch {
    return metrics;
  }
}

export function AnimatedMetricGrid({ metrics }: { metrics: MetricCardData[] }) {
  const [order, setOrder] = React.useState<MetricCardData[]>(() => restoreOrder(metrics));

  function handleReorder(next: MetricCardData[]) {
    setOrder(next);
    try {
      localStorage.setItem(ORDER_KEY, JSON.stringify(next.map((m) => m.icon)));
    } catch {
      // storage unavailable — order simply won't persist
    }
  }

  return (
    <Reorder.Group
      axis="x"
      values={order}
      onReorder={handleReorder}
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
    >
      {order.map((metric) => {
        const Icon = METRIC_ICONS[metric.icon] ?? Package;
        const tileClass =
          metric.badgeVariant === "destructive"
            ? "bg-destructive/10 text-destructive"
            : metric.badgeVariant === "default"
              ? "bg-primary/10 text-primary"
              : "bg-muted text-foreground";
        return (
        <Reorder.Item
          key={metric.title}
          value={metric}
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          whileDrag={{ scale: 1.03 }}
          className="h-full min-w-0 cursor-grab active:cursor-grabbing"
        >
          <Card className="h-full overflow-hidden shadow-xs transition-shadow duration-200 hover:shadow-md border-border/80">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <div className={`flex size-8 items-center justify-center rounded-md ${tileClass}`}>
                <Icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between gap-2">
                <div className="text-2xl font-bold tracking-tight tabular-nums">{metric.value}</div>
                <Badge variant={metric.badgeVariant} className="text-xs">
                  {metric.badge}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        </Reorder.Item>
        );
      })}
    </Reorder.Group>
  );
}

export function AnimatedSection({
  children,
  delay = 0.2,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
