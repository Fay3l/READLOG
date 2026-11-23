import { useEffect, useMemo, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Screen } from "@/components/screen";
import { useTheme } from "@/constants/themecontext";
import { AppTheme } from "@/constants/theme";
import Camera from "@/assets/icon/camera.svg"
import OpenBook from "@/assets/icon/open-book.svg"
import TargetHitAim from "@/assets/icon/target-hit-aim.svg"

// Page d'accueil affichée uniquement quand il n'y a PAS de session.
// Si un token est enregistré, le Stack (app/_layout.tsx) ouvre directement la bibliothèque.
export default function Auth() {
    const theme = useTheme()
    const styles = useStyles(theme)

    // Apparition douce : l'étagère, puis le texte, puis les boutons
    // useState avec une fonction : les valeurs animées sont créées une seule fois.
    // (lire ref.current pendant le rendu est interdit par les règles de React)
    const [fade] = useState(() => [0, 1, 2].map(() => new Animated.Value(0)))
    useEffect(() => {
        Animated.stagger(140, fade.map(v =>
            Animated.timing(v, { toValue: 1, duration: 500, useNativeDriver: true })
        )).start()
    }, [fade])
    const appear = (i: number) => ({
        opacity: fade[i],
        transform: [{ translateY: fade[i].interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
    })

    return (
        <Screen>
            <SafeAreaView style={styles.container}>
                {/* ── Illustration : une étagère de livres aux couleurs du thème ── */}
                <Animated.View style={[styles.hero, appear(0)]}>
                    <BookShelf theme={theme} />
                </Animated.View>

                {/* ── Titre & promesse ── */}
                <Animated.View style={[styles.text_block, appear(1)]}>
                    <Text style={styles.logo}>ReadLog</Text>
                    <Text style={styles.tagline}>Tes lectures, ton histoire.</Text>

                    <View style={styles.features}>
                        <Feature theme={theme} icon={<Camera width={18} height={18} color={theme.colors.accent.default} />}
                            text="Scanne un livre, il rejoint ta bibliothèque" />
                        <Feature theme={theme} icon={<OpenBook width={18} height={18} />}
                            text="Suis ta progression page après page" />
                        <Feature theme={theme} icon={<TargetHitAim width={18} height={18} />}
                            text="Fixe-toi un objectif de lecture annuel" />
                    </View>
                </Animated.View>

                {/* ── Actions ── */}
                <Animated.View style={[styles.actions, appear(2)]}>
                    <Pressable
                        accessibilityRole="button"
                        onPress={() => router.push('/sign-up')}
                        style={({ pressed }) => [styles.button_primary, pressed && styles.pressed]}
                    >
                        <Text style={styles.button_primary_text}>Commencer gratuitement</Text>
                    </Pressable>
                    <Pressable
                        accessibilityRole="button"
                        onPress={() => router.push('/login')}
                        style={({ pressed }) => [styles.button_secondary, pressed && styles.pressed]}
                    >
                        <Text style={styles.button_secondary_text}>J’ai déjà un compte</Text>
                    </Pressable>
                </Animated.View>
            </SafeAreaView>
        </Screen>
    )
}

function Feature({ theme, icon, text }: { theme: AppTheme; icon: React.ReactNode; text: string }) {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{
                width: 34, height: 34, borderRadius: theme.radius.full,
                backgroundColor: theme.colors.accent.ghost,
                alignItems: 'center', justifyContent: 'center',
            }}>
                {icon}
            </View>
            <Text style={{
                flex: 1, fontFamily: theme.fonts.dmSans.regular,
                fontSize: theme.fontSizes.base, color: theme.colors.text.secondary,
            }}>{text}</Text>
        </View>
    )
}

// Dos de livres dessinés avec des View : pas d'image à charger, s'adapte au thème clair/sombre
function BookShelf({ theme }: { theme: AppTheme }) {
    const c = theme.colors
    const spines = [
        { h: 118, w: 26, color: c.status.toRead },
        { h: 140, w: 32, color: c.accent.default },
        { h: 104, w: 22, color: c.status.finished },
        { h: 132, w: 28, color: c.accent.dark },
        { h: 96, w: 24, color: c.status.abandoned },
        { h: 124, w: 30, color: c.status.reading, tilt: true },
    ]
    return (
        <View style={{ alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 5 }}>
                {spines.map((s, i) => (
                    <View key={i} style={{
                        width: s.w, height: s.h, backgroundColor: s.color,
                        borderRadius: 4, opacity: 0.92,
                        justifyContent: 'space-between', paddingVertical: 12, alignItems: 'center',
                        transform: s.tilt ? [{ rotate: '8deg' }, { translateX: 6 }] : undefined,
                    }}>
                        {/* petites bandes décoratives sur la tranche */}
                        <View style={{ width: '60%', height: 3, borderRadius: 2, backgroundColor: c.bg.primary, opacity: 0.35 }} />
                        <View style={{ width: '60%', height: 3, borderRadius: 2, backgroundColor: c.bg.primary, opacity: 0.35 }} />
                    </View>
                ))}
            </View>
            {/* la planche */}
            <View style={{ width: 260, height: 8, borderRadius: 4, backgroundColor: c.border.inactive, marginTop: 2 }} />
        </View>
    )
}

function useStyles(theme: AppTheme) {
    return useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            paddingHorizontal: 24,
            paddingVertical: 16,
            justifyContent: 'space-between',
        },
        hero: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 180,
        },
        text_block: {
            gap: 6,
        },
        logo: {
            fontFamily: theme.fonts.playfair.bold,
            fontSize: theme.fontSizes['3xl'] + 6,
            color: theme.colors.text.primary,
        },
        tagline: {
            fontFamily: theme.fonts.playfair.italic,
            fontSize: theme.fontSizes.lg,
            color: theme.colors.accent.default,
        },
        features: {
            gap: 14,
            marginTop: 24,
        },
        actions: {
            gap: 12,
            marginTop: 32,
            marginBottom: 8,
        },
        button_primary: {
            backgroundColor: theme.colors.accent.default,
            borderRadius: theme.radius.lg,
            paddingVertical: 18,
            alignItems: 'center',
            ...theme.shadows.md,
            shadowColor: theme.colors.accent.default,
        },
        button_primary_text: {
            fontFamily: theme.fonts.dmSans.medium,
            fontSize: theme.fontSizes.md,
            color: theme.colors.text.onAccent,
        },
        button_secondary: {
            borderRadius: theme.radius.lg,
            paddingVertical: 17,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.colors.border.inactive,
            backgroundColor: theme.colors.accent.ghost,
        },
        button_secondary_text: {
            fontFamily: theme.fonts.dmSans.medium,
            fontSize: theme.fontSizes.md,
            color: theme.colors.text.primary,
        },
        pressed: {
            opacity: 0.85,
            transform: [{ scale: 0.98 }],
        },
    }), [theme])
}
