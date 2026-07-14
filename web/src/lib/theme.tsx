"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
}>({ theme: "light", setTheme: () => {} });

const STORAGE_KEY = "crma-theme";

export function ThemeProvider({
  children,
  initial = "light",
}: {
  children: ReactNode;
  initial?: Theme;
}) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return initial;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : initial;
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function setTheme(t: Theme) {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
