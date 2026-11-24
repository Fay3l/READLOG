import { useMemo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { router, type Href } from "expo-router";
import { useTheme } from "@/constants/themecontext";

interface BackButtonProps {
    /** Écran où aller si l'historique est vide (ex : page ouverte directement par son URL) */
    readonly fallback?: Href
}

// Bouton « ‹ Retour » commun à tous les écrans empilés (fiche livre, recherche, ajout manuel)
export function BackButton({ fallback = '/(tabs)' }: BackButtonProps) {
    const theme = useTheme()
    const styles = useMemo(() => StyleSheet.create({
        back: {
            alignSelf: 'flex-start',
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: theme.radius.full,
            backgroundColor: theme.colors.accent.ghost,
        },
        text: {
            fontFamily: theme.fonts.dmSans.medium,
            fontSize: theme.fontSizes.sm,
            color: theme.colors.text.primary,
        },
    }), [theme])

    const goBack = () => {
        if (router.canGoBack()) router.back()
        else router.replace(fallback)
    }

    return (
        <Pressable onPress={goBack} hitSlop={10} accessibilityRole="button" accessibilityLabel="Retour"
            style={({ pressed }) => [styles.back, pressed && { opacity: 0.7 }]}>
            <Text style={styles.text}>‹  Retour</Text>
        </Pressable>
    )
}
