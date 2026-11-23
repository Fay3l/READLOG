import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { AppTheme, DarkTheme, LightTheme } from './theme';
import { useStorageState } from '@/auth/useStorageState';

// ─── Types ────────────────────────────────────────────────────────────────────

// "system" = suit le réglage du téléphone
export type ThemeMode = 'system' | 'light' | 'dark';

type ThemeContextType = {
  theme:       AppTheme;
  isDark:      boolean;
  mode:        ThemeMode;
  setMode:     (mode: ThemeMode) => void;
  toggleTheme: () => void;
  setDark:     (dark: boolean) => void;
};

// ─── Context ──────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextType>({
  theme:       DarkTheme,
  isDark:      true,
  mode:        'system',
  setMode:     () => {},
  toggleTheme: () => {},
  setDark:     () => {},
});

// ─── Provider — placé dans app/_layout.tsx, autour de toute l'app ─────────────

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  // ✅ le choix est enregistré : il est conservé au redémarrage de l'app
  const [[, stored], setStored] = useStorageState('theme');
  const mode: ThemeMode = stored === 'light' || stored === 'dark' ? stored : 'system';

  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
  const theme  = isDark ? DarkTheme : LightTheme;
  const setMode = (m: ThemeMode) => setStored(m === 'system' ? null : m);

  return React.createElement(
      ThemeContext.Provider,
      {
        value: {
          theme,
          isDark,
          mode,
          setMode,
          toggleTheme: () => setMode(isDark ? 'light' : 'dark'),
          setDark: (dark: boolean) => setMode(dark ? 'dark' : 'light'),
        },
      },
      children,
    );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

// ✅ lit le thème du Provider : respecte le choix fait dans le profil
// (avant, ce hook relisait le système et ignorait ce choix)
export function useTheme(): AppTheme {
  return useContext(ThemeContext).theme;
}

export function useThemeContext(): ThemeContextType {
  return useContext(ThemeContext);
}
