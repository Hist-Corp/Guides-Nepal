import { useCallback, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

const KEY = "gn_theme";

function currentTheme(): Theme {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "dark" || saved === "light") return saved;
  } catch {}
  return "light";
}

function apply(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

/** Module-level store so every useTheme() consumer stays in sync. */
let current: Theme = currentTheme();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): Theme {
  return current;
}

function setThemeGlobal(next: Theme) {
  if (next === current) return;
  current = next;
  apply(next);
  try {
    localStorage.setItem(KEY, next);
  } catch {}
  listeners.forEach((l) => l());
}

// Apply once at module load so the first paint matches the stored preference.
apply(current);

export function useTheme(): {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
} {
  const theme = useSyncExternalStore(subscribe, getSnapshot);

  const setTheme = useCallback((t: Theme) => setThemeGlobal(t), []);
  const toggleTheme = useCallback(
    () => setThemeGlobal(current === "dark" ? "light" : "dark"),
    []
  );

  return { theme, setTheme, toggleTheme };
}