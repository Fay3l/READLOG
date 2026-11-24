import { useEffect, useMemo, useState } from "react";
import { Image, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useInstall } from "@/hooks/useInstall";
import { useTheme } from "@/constants/themecontext";
import { AppTheme } from "@/constants/theme";

// Lien vers l'APK Android (EAS Build ou fichier servi par le site), défini au build :
// EXPO_PUBLIC_APK_URL=https://readlog.exemple.fr/readlog.apk
const APK_URL = process.env.EXPO_PUBLIC_APK_URL
const DISMISSED_KEY = "install-banner-dismissed"

type Mode = "prompt" | "ios" | "android-apk" | "insecure" | null

// Bandeau "Installer ReadLog" en bas de l'écran (version web uniquement).
// Traduction React de InstallBanner.vue :
//   v-if / v-else-if → rendu conditionnel ; @click → onPress ; <Transition> → animation CSS
export function InstallBanner() {
    const theme = useTheme()
    const styles = useStyles(theme)
    const { canPrompt, isIos, isAndroid, isInstalled, isSecure, install } = useInstall()
    // ?install=1 force l'affichage (lien partagé "installer l'app"), comme dans ta version Vue
    const [forced] = useState(() => new URLSearchParams(window.location.search).get("install") === "1")
    const [closed, setClosed] = useState(() => {
        try { return localStorage.getItem(DISMISSED_KEY) === "1" && !forced } catch { return false } // navigation privée
    })
    const [ready, setReady] = useState(false)

    useEffect(() => {
        // petit délai : on laisse l'utilisateur découvrir la page avant de lui proposer l'installation
        const timer = setTimeout(() => setReady(true), 2500)
        return () => clearTimeout(timer)
    }, [])

    const mode: Mode = (() => {
        if (!ready || closed || isInstalled) return null
        if (!isSecure) return forced ? "insecure" : null
        if (canPrompt) return "prompt"            // Chrome / Edge : vraie boîte d'installation
        if (isIos) return "ios"                  // Safari iOS : gestes à faire à la main
        if (isAndroid && APK_URL) return "android-apk"
        return null
    })()

    const close = () => {
        setClosed(true)
        try { localStorage.setItem(DISMISSED_KEY, "1") } catch { /* navigation privée */ }
    }

    const onInstall = async () => {
        if (await install()) close()
    }

    if (!mode) return null

    return (
        <View style={styles.overlay}>
            <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Fermer" />
            <View style={styles.sheet} accessibilityRole="none" aria-modal aria-labelledby="install-title">
                <View style={styles.header}>
                    <Image source={{ uri: "/icons/icon-192.png" }} style={styles.icon} />
                    <View style={{ flex: 1 }}>
                        <Text nativeID="install-title" style={styles.title}>
                            {mode === "ios" ? "Ajoute ReadLog sur ton iPhone" : "Installer ReadLog"}
                        </Text>
                        <Text style={styles.subtitle}>
                            {mode === "ios" ? "En 3 gestes" : "Gratuit, sans passer par un store"}
                        </Text>
                    </View>
                    <Pressable onPress={close} style={styles.close} accessibilityRole="button" accessibilityLabel="Fermer">
                        <Text style={styles.close_text}>×</Text>
                    </Pressable>
                </View>

                {mode === "prompt" || mode === "android-apk" ? (
                    <>
                        <View style={{ gap: 6 }}>
                            <Text style={styles.bullet}>•  Ta bibliothèque en un geste, depuis l’écran d’accueil</Text>
                            <Text style={styles.bullet}>•  En plein écran, comme une vraie application</Text>
                        </View>
                        {mode === "prompt" ? (
                            <Pressable onPress={onInstall} style={styles.primary} accessibilityRole="button">
                                <Text style={styles.primary_text}>Installer</Text>
                            </Pressable>
                        ) : null}
                        {isAndroid && APK_URL ? (
                            // Sur Android, l'app native (scan du code-barres compris) est aussi disponible
                            <Pressable onPress={() => Linking.openURL(APK_URL)} accessibilityRole="link"
                                style={mode === "prompt" ? styles.secondary : styles.primary}>
                                <Text style={mode === "prompt" ? styles.secondary_text : styles.primary_text}>
                                    Télécharger l’app Android (APK)
                                </Text>
                            </Pressable>
                        ) : null}
                        <Pressable onPress={close} style={styles.later} accessibilityRole="button">
                            <Text style={styles.later_text}>Plus tard</Text>
                        </Pressable>
                    </>
                ) : mode === "ios" ? (
                    <>
                        <View style={{ gap: 8 }}>
                            {[
                                ["Touche", "Partager", "en bas de Safari"],
                                ["Choisis", "Sur l’écran d’accueil", ""],
                                ["Confirme avec", "Ajouter", ""],
                            ].map(([before, strong, after], i) => (
                                <View key={i} style={styles.step}>
                                    <View style={styles.step_number}>
                                        <Text style={styles.step_number_text}>{i + 1}</Text>
                                    </View>
                                    <Text style={styles.step_text}>
                                        {before} <Text style={styles.strong}>{strong}</Text> {after}
                                    </Text>
                                </View>
                            ))}
                        </View>
                        <Pressable onPress={close} style={styles.primary} accessibilityRole="button">
                            <Text style={styles.primary_text}>J’ai compris</Text>
                        </Pressable>
                    </>
                ) : (
                    <>
                        <Text style={styles.insecure}>
                            Cette page est ouverte en <Text style={styles.strong}>HTTP</Text> : le navigateur bloque
                            l’installation. Ouvre-la en <Text style={styles.strong}>HTTPS</Text>.
                        </Text>
                        <Pressable onPress={close} style={styles.primary} accessibilityRole="button">
                            <Text style={styles.primary_text}>OK</Text>
                        </Pressable>
                    </>
                )}
            </View>
        </View>
    )
}

function useStyles(theme: AppTheme) {
    return useMemo(() => StyleSheet.create({
        overlay: {
            position: 'fixed' as 'absolute', // "fixed" n'existe que sur le web : il couvre tout l'écran
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 50,
            justifyContent: 'flex-end',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
            animationKeyframes: [{ from: { opacity: 0 }, to: { opacity: 1 } }],
            animationDuration: '250ms',
        } as object,
        sheet: {
            width: '100%',
            maxWidth: 480,
            gap: 16,
            paddingHorizontal: 20,
            paddingTop: 20,
            // env(safe-area-inset-bottom) : la barre de geste de l'iPhone ne cache pas les boutons
            paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' as unknown as number,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderWidth: 1,
            borderColor: theme.colors.border.card,
            backgroundColor: theme.colors.bg.card,
            animationKeyframes: [{ from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } }],
            animationDuration: '250ms',
        } as object,
        header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
        icon: { width: 56, height: 56, borderRadius: 16 },
        title: {
            fontFamily: theme.fonts.playfair.bold,
            fontSize: theme.fontSizes.lg,
            color: theme.colors.text.primary,
        },
        subtitle: {
            marginTop: 2,
            fontFamily: theme.fonts.dmSans.regular,
            fontSize: theme.fontSizes.sm,
            color: theme.colors.text.label,
        },
        close: {
            width: 44, height: 44, marginTop: -8, marginRight: -10, alignSelf: 'flex-start',
            borderRadius: theme.radius.full, alignItems: 'center', justifyContent: 'center',
        },
        close_text: { fontSize: 26, color: theme.colors.text.label },
        bullet: {
            fontFamily: theme.fonts.dmSans.regular,
            fontSize: theme.fontSizes.base,
            color: theme.colors.text.secondary,
        },
        step: {
            flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12,
            borderRadius: theme.radius.lg, backgroundColor: theme.colors.accent.ghost,
        },
        step_number: {
            width: 28, height: 28, borderRadius: theme.radius.full,
            backgroundColor: theme.colors.accent.default, alignItems: 'center', justifyContent: 'center',
        },
        step_number_text: {
            fontFamily: theme.fonts.dmSans.medium, color: theme.colors.text.onAccent,
        },
        step_text: {
            flex: 1, fontFamily: theme.fonts.dmSans.regular,
            fontSize: theme.fontSizes.sm, color: theme.colors.text.secondary,
        },
        strong: { fontFamily: theme.fonts.dmSans.medium, color: theme.colors.text.primary },
        insecure: {
            padding: 12, borderRadius: theme.radius.lg, backgroundColor: theme.colors.accent.ghost,
            fontFamily: theme.fonts.dmSans.regular, fontSize: theme.fontSizes.base,
            lineHeight: theme.fontSizes.base * 1.5, color: theme.colors.text.secondary,
        },
        primary: {
            paddingVertical: 16, borderRadius: theme.radius.lg,
            backgroundColor: theme.colors.accent.default, alignItems: 'center',
        },
        primary_text: {
            fontFamily: theme.fonts.dmSans.medium, fontSize: theme.fontSizes.md, color: theme.colors.text.onAccent,
        },
        secondary: {
            paddingVertical: 14, borderRadius: theme.radius.lg, alignItems: 'center',
            borderWidth: 1, borderColor: theme.colors.border.inactive,
        },
        secondary_text: {
            fontFamily: theme.fonts.dmSans.medium, fontSize: theme.fontSizes.base, color: theme.colors.text.primary,
        },
        later: { alignItems: 'center', paddingVertical: 6 },
        later_text: { fontFamily: theme.fonts.dmSans.regular, fontSize: theme.fontSizes.sm, color: theme.colors.text.label },
    }), [theme])
}
