"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface DashboardBreadcrumbProps {
  locale: string;
  appName: string;
  labels: Record<string, string>;
  fallback: string;
}

export function DashboardBreadcrumb({ locale, appName, labels, fallback }: DashboardBreadcrumbProps) {
  const pathname = usePathname();
  const section = pathname.replace(`/${locale}/dashboard`, "").split("/").filter(Boolean)[0];
  const current = section ? (labels[section] ?? fallback) : fallback;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href={`/${locale}/dashboard`}>
            {appName}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          <BreadcrumbPage>{current}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
