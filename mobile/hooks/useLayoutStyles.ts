import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { useTheme } from "@/constants/themecontext";

export function useLayoutStyles() {
    const Theme = useTheme();
    return useMemo(() => StyleSheet.create({
        tabBarIcon: {
            fontSize: Theme.fontSizes.md
        },
        tabBarLabel: {
            color: Theme.colors.text.secondary,
        },
        tabBarLabelActive: {
            color: "#e3a54a",
        },
        tabBarStyle: {
            backgroundColor: Theme.colors.bg.nav,
            fontFamily: Theme.fonts.system.serif,
            position: 'absolute',
        }
    }), [Theme]);
    
}