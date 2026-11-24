import { useEffect, type PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@/constants/themecontext";

// Largeur d'un grand téléphone : au-delà, l'app est centrée au lieu d'être étirée
const MAX_WIDTH = 480

// Version web : sur ordinateur, l'app s'affiche dans une colonne centrée, comme sur un téléphone.
export function WebFrame({ children }: PropsWithChildren) {
    const theme = useTheme()

    useEffect(() => {
        // Service worker (public/sw.js) : nécessaire pour que l'app soit installable (PWA).
        // Uniquement en production : en développement, il garderait d'anciens fichiers en cache.
        if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
            navigator.serviceWorker.register("/sw.js").catch(() => { /* non bloquant */ })
        }
    }, [])

    return (
        <View style={[styles.page, { backgroundColor: theme.colors.bg.shell }]}>
            <View style={[styles.column, { backgroundColor: theme.colors.bg.primary, borderColor: theme.colors.border.card }]}>
                {children}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        alignItems: 'center',
    },
    column: {
        flex: 1,
        width: '100%',
        maxWidth: MAX_WIDTH,
        // bordures visibles seulement quand la colonne ne touche pas les bords de l'écran
        borderLeftWidth: StyleSheet.hairlineWidth,
        borderRightWidth: StyleSheet.hairlineWidth,
        // "transform" crée un nouveau repère : les éléments "position: fixed" (bandeau
        // d'installation, tab bar) restent DANS la colonne au lieu de s'étaler sur tout l'écran
        transform: [{ translateX: 0 }],
        overflow: 'hidden',
    },
})
