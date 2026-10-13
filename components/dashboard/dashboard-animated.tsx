"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export interface MetricCardData {
  title: string;
  value: string;
  description: string;
  icon: string;
  badge: string;
  badgeVariant: "default" | "secondary" | "destructive" | "outline";
}

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

export function AnimatedMetricGrid({ metrics }: { metrics: MetricCardData[] }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
    >
      {metrics.map((metric) => {
        const Icon = METRIC_ICONS[metric.icon] ?? Package;
        return (
        <motion.div
          key={metric.title}
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="h-full min-w-0"
        >
          <Card className="h-full overflow-hidden shadow-xs transition-shadow duration-200 hover:shadow-md border-border/80">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <div className="flex size-8 items-center justify-center rounded-md bg-muted text-foreground">
                <Icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between gap-2">
                <div className="text-2xl font-bold tracking-tight">{metric.value}</div>
                <Badge variant={metric.badgeVariant} className="text-xs">
                  {metric.badge}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>
        );
      })}
    </motion.div>
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
