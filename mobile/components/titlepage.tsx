import { useTheme } from "@/constants/themecontext"
import { useMemo } from "react"
import { StyleSheet, View, Text } from "react-native"

interface TitlePageProps {
    title: string,
    subtitle: string
}

export function TitlePage({ subtitle, title }: TitlePageProps) {
    const styles = useStyles()
    return (
        <View >
            <Text style={styles.subtitle}>{subtitle}</Text>
            <Text style={styles.title}>{title}</Text>
        </View>
    )
}

function useStyles() {
    const theme = useTheme()
    return useMemo(() => StyleSheet.create({
        title: {
            fontFamily: theme.fonts.playfair.bold,
            fontSize: theme.fontSizes.xl,
            color: theme.colors.text.secondary,
        },
        subtitle: {
            color: theme.colors.text.muted,
            fontSize: theme.fontSizes.sm
        }
    }), [theme])
}