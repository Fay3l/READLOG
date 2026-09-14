// hooks/useIndexStyles.ts
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { useTheme } from "@/constants/themecontext";

export function useIndexStyles() {
  const theme = useTheme();
  return useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      gap:5,
      alignItems: "center",
      backgroundColor: theme.colors.bg.primary,
    },
    secondary_text: {
      fontFamily: theme.fonts.playfair.regular,
      fontSize: theme.fontSizes.lg,
      color: theme.colors.text.secondary,
    },
    button: {
      backgroundColor: theme.colors.bg.banner,
      padding: 10,
      margin: 10,
      borderRadius: theme.radius.lg,
    },
    button_text: {
      fontFamily: theme.fonts.playfair.regular,
      fontSize: theme.fontSizes.md,
      color: theme.colors.text.secondary,
    }
  }), [theme]);
}