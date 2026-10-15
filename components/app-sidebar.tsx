"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  Building2,
  MapPin,
  Wrench,
  Calculator,
  ClipboardCheck,
  Store,
  BarChart3,
  Settings,
  Tags,
  Cog,
  KeyRound,
  Umbrella,
  LogOut,
  ChevronRight,
  ChevronsUpDown,
  Boxes,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { logoutAction } from "@/app/actions/auth";
import type { Locale, TranslationSchema } from "@/locales";

interface AppSidebarProps {
  locale: Locale;
  dict: TranslationSchema;
  user: {
    username: string;
    email: string;
    role: string;
  } | null;
}

export function AppSidebar({ locale, dict, user }: AppSidebarProps) {
  const pathname = usePathname();

  const dashboardHref = `/${locale}/dashboard`;

  const operationalNavigation = [
    {
      title: dict.sidebar.dashboard,
      href: dashboardHref,
      icon: LayoutDashboard,
    },
    {
      title: dict.sidebar.assets,
      href: `/${locale}/dashboard/assets`,
      icon: Package,
    },
    {
      title: dict.sidebar.maintenance,
      href: `/${locale}/dashboard/maintenance`,
      icon: Wrench,
    },
    {
      title: dict.sidebar.audits,
      href: `/${locale}/dashboard/audits`,
      icon: ClipboardCheck,
    },
    {
      title: dict.sidebar.depreciation,
      href: `/${locale}/dashboard/depreciation`,
      icon: Calculator,
    },
  ];

  const organizationNavigation = [
    {
      title: dict.sidebar.employees,
      href: `/${locale}/dashboard/employees`,
      icon: Users,
    },
    {
      title: dict.sidebar.departments,
      href: `/${locale}/dashboard/departments`,
      icon: Building2,
    },
    {
      title: dict.sidebar.locations,
      href: `/${locale}/dashboard/locations`,
      icon: MapPin,
    },
  ];

  const masterDataNavigation = [
    {
      title: dict.sidebar.categories,
      href: `/${locale}/dashboard/categories`,
      icon: Tags,
    },
    {
      title: dict.sidebar.maintenanceCategories,
      href: `/${locale}/dashboard/maintenance-categories`,
      icon: Cog,
    },
    {
      title: dict.sidebar.licenses,
      href: `/${locale}/dashboard/licenses`,
      icon: KeyRound,
    },
    {
      title: dict.sidebar.insurances,
      href: `/${locale}/dashboard/insurances`,
      icon: Umbrella,
    },
    {
      title: dict.sidebar.vendors,
      href: `/${locale}/dashboard/vendors`,
      icon: Store,
    },
  ];

  const systemNavigation = [
    {
      title: dict.sidebar.reports,
      href: `/${locale}/dashboard/reports`,
      icon: BarChart3,
    },
    {
      title: dict.sidebar.settings,
      href: `/${locale}/dashboard/settings`,
      icon: Settings,
    },
  ];

  function isActivePath(href: string) {
    return pathname === href || (href !== dashboardHref && pathname.startsWith(href));
  }

  const isMasterActive = masterDataNavigation.some((item) => isActivePath(item.href));
  const [masterOpen, setMasterOpen] = React.useState(isMasterActive);

  function renderNavItems(items: { title: string; href: string; icon: typeof LayoutDashboard }[]) {
    return items.map((item) => {
      const isActive = isActivePath(item.href);
      return (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            isActive={isActive}
            tooltip={item.title}
            render={<Link href={item.href} />}
            className="relative rounded-lg px-3 py-2 font-medium transition-all duration-200 hover:bg-accent/70 data-[active=true]:bg-primary/10 data-[active=true]:font-semibold data-[active=true]:text-primary data-[active=true]:shadow-xs data-[active=true]:ring-1 data-[active=true]:ring-primary/20"
          >
            <span aria-hidden className="absolute left-0 top-1/2 hidden h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary group-data-[active=true]/menu-button:block" />
            <item.icon className="size-4 shrink-0" />
            <span>{item.title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });
  }

  const userInitial = user?.username ? user.username.slice(0, 2).toUpperCase() : "AD";

  return (
    <Sidebar collapsible="icon" className="border-r border-border/60">
      <SidebarHeader className="pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href={`/${locale}/dashboard`} />} className="gap-3 rounded-xl px-2 py-2 hover:bg-accent/60">
              <div className="flex aspect-square size-9 items-center justify-center rounded-xl overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/60 p-1 shadow-md shadow-primary/20 ring-1 ring-primary/30">
                <Image
                  src="/logo.png"
                  alt={dict.common.appName}
                  width={32}
                  height={32}
                  className="size-full rounded-lg bg-background object-contain"
                  priority
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold tracking-tight">{dict.common.appName}</span>
                <span className="truncate text-[11px] font-medium uppercase tracking-widest text-muted-foreground">{dict.sidebar.platform}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-1 px-2">
        {/* Operational */}
        <SidebarGroup className="px-0">
          <SidebarGroupLabel className="px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80">{dict.sidebar.navOperational}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {renderNavItems(operationalNavigation)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Organization */}
        <SidebarGroup className="px-0">
          <SidebarGroupLabel className="px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80">{dict.sidebar.navOrganization}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {renderNavItems(organizationNavigation)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Master Data (collapsible) */}
        <SidebarGroup className="px-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              <Collapsible
                open={masterOpen || isMasterActive}
                onOpenChange={setMasterOpen}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger
                    render={
                      <SidebarMenuButton
                        tooltip={dict.sidebar.masterData}
                        className="rounded-lg px-3 py-2 font-medium transition-all duration-200 hover:bg-accent/70 data-[active=true]:bg-primary/10 data-[active=true]:font-semibold data-[active=true]:text-primary"
                      />
                    }
                  >
                    <Boxes className="size-4 shrink-0" />
                    <span>{dict.sidebar.masterData}</span>
                    <ChevronRight className="ml-auto size-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {masterDataNavigation.map((item) => (
                        <SidebarMenuSubItem key={item.href}>
                          <SidebarMenuSubButton
                            isActive={isActivePath(item.href)}
                            render={<Link href={item.href} />}
                          >
                            <item.icon />
                            <span>{item.title}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System */}
        <SidebarGroup className="px-0">
          <SidebarGroupLabel className="px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80">{dict.sidebar.navSystem}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {renderNavItems(systemNavigation)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="rounded-xl ring-1 ring-border/60 bg-card/60 backdrop-blur-sm transition-colors hover:bg-accent/70 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  />
                }
              >
                <Avatar className="size-8 rounded-lg ring-1 ring-primary/20">
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-primary to-primary/60 font-semibold text-xs text-primary-foreground">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user?.username ?? "Administrator"}</span>
                  <span className="truncate text-xs text-muted-foreground">{user?.email ?? "admin@example.com"}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-lg"
                side="top"
                align="end"
                sideOffset={8}
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="size-8 rounded-lg">
                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold text-xs">
                          {userInitial}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{user?.username ?? "Administrator"}</span>
                        <span className="truncate text-xs text-muted-foreground capitalize">
                          {user?.role ?? "Admin"}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href={`/${locale}/dashboard/settings`} />}>
                  <Settings className="size-4 mr-2" />
                  {dict.sidebar.settings}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    logoutAction();
                  }}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="size-4 mr-2" />
                  {dict.sidebar.logout}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
