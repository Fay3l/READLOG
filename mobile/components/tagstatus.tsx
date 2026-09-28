import { useTheme } from "@/constants/themecontext";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

interface TagStatusProps {
    status: string;
    is_active: boolean | undefined
}


export function TagStatus({ status, is_active }: TagStatusProps) {
    const theme = useTheme()
    const styles = useStyles()
    if (status == "to_read") {
        return (
            <View style={[styles.tag, { backgroundColor: theme.colors.status.toReadBg, }]}>
                <Text style={[styles.text, { color: theme.colors.status.toRead }]}>À lire</Text>
            </View>
        )
    }
    if (status == "finished") {
        return (
            <View style={[styles.tag, { backgroundColor: theme.colors.status.finishedBg, }]}>
                <Text style={[styles.text, { color: theme.colors.status.finished }]}>Terminé</Text>
            </View>
        )
    }
    if (status == "reading") {
        return (
            <View style={[styles.tag, { backgroundColor: theme.colors.status.readingBg, }]}>
                <Text style={[styles.text, { color: theme.colors.status.reading }]}>En cours</Text>
            </View>
        )
    }
    else {
        if (is_active) {
            return (
                <View style={[styles.tag, { backgroundColor: theme.colors.border.focus, padding: 8 }]}>
                    <Text style={[styles.text, { color: theme.colors.text.onAccent }]}>{status}</Text>
                </View>
            )
        }
        return (
            <View style={[styles.tag, { backgroundColor: theme.colors.border.card, padding: 8 }]}>
                <Text style={[styles.text, { color: theme.colors.text.hint }]}>{status}</Text>
            </View>
        )
    }

}

function useStyles() {
    const theme = useTheme()
    return useMemo(() => StyleSheet.create({
        tag: {

            padding: 5,
            borderRadius: theme.radius.full,
            justifyContent: 'center',
            alignItems: 'center'
        },
        text: {
            textAlign: 'center',
            fontFamily: theme.fonts.dmSans.regular,
            fontSize: theme.fontSizes.xs
        }
    }), [theme])
}