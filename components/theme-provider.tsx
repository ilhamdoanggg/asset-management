"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import {
  type ThemeColor,
  type ThemeRadius,
  type ThemeMode,
  DEFAULT_THEME_COLOR,
  DEFAULT_THEME_RADIUS,
  DEFAULT_THEME_MODE,
  isThemeColor,
  isThemeRadius,
  isThemeMode,
} from "@/lib/themes";
import { COOKIES } from "@/lib/constants";
import { saveThemeAction } from "@/app/actions/theme";

interface ThemeColorContextType {
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
  themeRadius: ThemeRadius;
  setThemeRadius: (radius: ThemeRadius) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  resetTheme: () => void;
}

const ThemeColorContext = React.createContext<ThemeColorContextType | undefined>(
  undefined
);

export function useThemeColor() {
  const context = React.useContext(ThemeColorContext);
  if (!context) {
    throw new Error("useThemeColor must be used within a ThemeProvider");
  }
  return context;
}

function ThemeColorProviderInner({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const [themeColor, setThemeColorState] = React.useState<ThemeColor>(DEFAULT_THEME_COLOR);
  const [themeRadius, setThemeRadiusState] = React.useState<ThemeRadius>(DEFAULT_THEME_RADIUS);
  const [themeMode, setThemeModeState] = React.useState<ThemeMode>(DEFAULT_THEME_MODE);

  // Sync initial state from document/cookie on mount
  React.useEffect(() => {
    const activeColor = document.documentElement.getAttribute("data-theme-color");
    if (activeColor && isThemeColor(activeColor)) {
      setThemeColorState(activeColor);
    } else {
      const matchColor = document.cookie.match(new RegExp(`(?:^|; )${COOKIES.THEME_COLOR}=([^;]*)`));
      if (matchColor && isThemeColor(matchColor[1])) {
        setThemeColorState(matchColor[1]);
        document.documentElement.setAttribute("data-theme-color", matchColor[1]);
      }
    }

    const matchRadius = document.cookie.match(new RegExp(`(?:^|; )${COOKIES.THEME_RADIUS}=([^;]*)`));
    if (matchRadius && isThemeRadius(matchRadius[1])) {
      setThemeRadiusState(matchRadius[1]);
      document.documentElement.style.setProperty("--radius", `${matchRadius[1]}rem`);
    }

    const matchMode = document.cookie.match(new RegExp(`(?:^|; )${COOKIES.THEME_MODE}=([^;]*)`));
    if (matchMode && isThemeMode(matchMode[1])) {
      setThemeModeState(matchMode[1]);
      if (theme !== matchMode[1]) {
        setTheme(matchMode[1]);
      }
    }
  }, [theme, setTheme]);

  const setThemeColor = React.useCallback((color: ThemeColor) => {
    setThemeColorState(color);
    document.documentElement.setAttribute("data-theme-color", color);
    document.cookie = `${COOKIES.THEME_COLOR}=${color}; path=/; max-age=31536000; SameSite=Lax`;
    saveThemeAction({ themeColor: color }).catch(() => {});
  }, []);

  const setThemeRadius = React.useCallback((radius: ThemeRadius) => {
    setThemeRadiusState(radius);
    document.documentElement.style.setProperty("--radius", `${radius}rem`);
    document.cookie = `${COOKIES.THEME_RADIUS}=${radius}; path=/; max-age=31536000; SameSite=Lax`;
    saveThemeAction({ themeRadius: radius }).catch(() => {});
  }, []);

  const setThemeMode = React.useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    setTheme(mode);
    document.cookie = `${COOKIES.THEME_MODE}=${mode}; path=/; max-age=31536000; SameSite=Lax`;
    saveThemeAction({ themeMode: mode }).catch(() => {});
  }, [setTheme]);

  const resetTheme = React.useCallback(() => {
    setThemeColor(DEFAULT_THEME_COLOR);
    setThemeRadius(DEFAULT_THEME_RADIUS);
    setThemeMode(DEFAULT_THEME_MODE);
  }, [setThemeColor, setThemeRadius, setThemeMode]);

  return (
    <ThemeColorContext.Provider
      value={{
        themeColor,
        setThemeColor,
        themeRadius,
        setThemeRadius,
        themeMode: (theme as ThemeMode) || themeMode,
        setThemeMode,
        resetTheme,
      }}
    >
      {children}
    </ThemeColorContext.Provider>
  );
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <ThemeColorProviderInner>{children}</ThemeColorProviderInner>
    </NextThemesProvider>
  );
}
