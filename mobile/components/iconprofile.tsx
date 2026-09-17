import { useTheme } from "@/constants/themecontext"
import { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";

export interface IconProfileProps {
    width: number;
    height: number;
    fontSize: number | undefined;
    name: string
    shadow: boolean
}
export function IconProfile({ width, height, fontSize, name, shadow }: IconProfileProps) {
    const Theme = useTheme()
    const styles = useStyles(width, height)
    const letter = (name: string) => {
        const letter = name.charAt(0).toUpperCase()
        return letter
    }
    return (
        <View style={[shadow ? styles.icon_shadow : null, styles.icon_profile]}>
            <Text style={[{ fontSize, fontWeight: "bold" }]}>{letter(name)}</Text>
        </View>
    )
}

function useStyles(width:number, height:number) {
    const theme = useTheme()
    return useMemo(() => StyleSheet.create({
        icon_shadow: {
            boxShadow: "0 8px 10px rgba(212,169,106,0.3)",
        },
        icon_profile: {
            position: 'relative',
            backgroundColor: theme.gradients.premium[0],
            borderRadius: theme.radius.full,
            minWidth: width,
            minHeight: height,
            justifyContent: "center",
            alignItems: "center",
        },
    }), [theme])
}