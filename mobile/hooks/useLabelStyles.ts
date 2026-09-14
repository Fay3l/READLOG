import { useTheme } from "@/constants/themecontext";
import { useMemo } from "react";
import { StyleSheet } from "react-native";

export function useLabelStyles() {
    const Theme = useTheme();
    return useMemo(() => StyleSheet.create({
        text_input: {
            borderColor: 'black',
            borderWidth: 0.7,
            borderRadius: Theme.radius.lg,
            padding: 5
        },
    }), [Theme])
}