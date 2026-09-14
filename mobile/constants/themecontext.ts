import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';
import { AppTheme, DarkTheme, LightTheme } from './theme';

// ─── Types ────────────────────────────────────────────────────────────────────

type ThemeContextType = {
  theme:       AppTheme;
  isDark:      boolean;
  toggleTheme: () => void;
  setDark:     (dark: boolean) => void;
};

// ─── Context ──────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextType>({
  theme:       DarkTheme,
  isDark:      true,
  toggleTheme: () => {},
  setDark:     () => {},
});

// ─── Provider — à placer dans app/_layout.tsx ─────────────────────────────────

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();                    // 1 seul appel ici
  const [override, setOverride] = useState<boolean | null>(null);

  const isDark = override !== null ? override : systemScheme === 'dark';
  const theme  = isDark ? DarkTheme : LightTheme;

  return React.createElement(
      ThemeContext.Provider,
      {
        value: {
          theme,
          isDark,
          toggleTheme: () => setOverride(prev =>
            prev === null ? !isDark : !prev
          ),
          setDark: (dark: boolean) => setOverride(dark),
        },
      },
      children,
    );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

// Suit le système — simple, sans toggle manuel
export function useTheme(): AppTheme {
  const scheme = useColorScheme();                          // 1 seul appel ici
  return scheme === 'dark' ? DarkTheme : LightTheme;
}

// Avec toggle manuel — nécessite ThemeProvider dans _layout.tsx
export function useThemeContext(): ThemeContextType {
  return useContext(ThemeContext);
}