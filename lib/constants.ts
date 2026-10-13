export const LOCALES = ["id", "en"] as const;
export type SupportedLocale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: SupportedLocale = "id";

export const COOKIES = {
  SESSION: "session",
  LOCALE: "locale",
  THEME_COLOR: "theme_color",
  THEME_RADIUS: "theme_radius",
  THEME_MODE: "theme_mode",
} as const;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  ASSETS: "/assets",
  VENDORS: "/dashboard/vendors",
  DEPARTMENTS: "/dashboard/departments",
  LOCATIONS: "/dashboard/locations",
  EMPLOYEES: "/dashboard/employees",
  CATEGORIES: "/dashboard/categories",
  MAINTENANCE_CATEGORIES: "/dashboard/maintenance-categories",
  LICENSES: "/dashboard/licenses",
  INSURANCES: "/dashboard/insurances",
  SETTINGS: "/dashboard/settings",
} as const;

export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.ASSETS,
  ROUTES.VENDORS,
  ROUTES.DEPARTMENTS,
  ROUTES.LOCATIONS,
  ROUTES.EMPLOYEES,
  ROUTES.CATEGORIES,
  ROUTES.MAINTENANCE_CATEGORIES,
  ROUTES.LICENSES,
  ROUTES.INSURANCES,
  ROUTES.SETTINGS,
] as const;

export const AUTH_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
] as const;

export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
  MANAGER: "manager",
} as const;

export const USER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
} as const;
