'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext({ theme: 'light', setTheme: () => {}, toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        let stored = window.localStorage.getItem('peachy-theme');
        if (!stored) {
          const legacy = window.localStorage.getItem('peachy_theme');
          if (legacy === 'dark' || legacy === 'light') {
            stored = legacy;
            window.localStorage.setItem('peachy-theme', legacy);
            window.localStorage.removeItem('peachy_theme');
          }
        }
        if (stored === 'dark' || stored === 'light') return stored;
        // Fallback to system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
      }
    } catch {}
    return 'light';
  });

  // One-time migration from legacy key
  useEffect(() => {
    try {
      const legacy = typeof window !== 'undefined' ? window.localStorage.getItem('peachy_theme') : null;
      if (legacy === 'dark' || legacy === 'light') {
        window.localStorage.setItem('peachy-theme', legacy);
        window.localStorage.removeItem('peachy_theme');
      }
    } catch {}
  }, []);

  const applyThemeToDom = useCallback((t) => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      const body = document.body;
      if (t === 'dark') {
        root.classList.add('dark');
        body.classList.add('dark');
      } else {
        root.classList.remove('dark');
        body.classList.remove('dark');
      }
    }
    try {
      if (typeof window !== 'undefined') window.localStorage.setItem('peachy-theme', t);
    } catch {}
  }, []);

  // Reflect on document root and persist
  useEffect(() => {
    applyThemeToDom(theme);
  }, [theme, applyThemeToDom]);

  const setTheme = useCallback((t) => {
    const next = t === 'dark' ? 'dark' : 'light';
    setThemeState(next);
    applyThemeToDom(next);
  }, [applyThemeToDom]);
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}


