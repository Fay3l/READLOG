import { useSession } from "@/auth/ctx";
import { useTheme, useThemeContext, ThemeMode } from "@/constants/themecontext";
import { AppTheme } from "@/constants/theme";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Bell from "@/assets/icon/bell.svg"
import Moon from "@/assets/icon/moon.svg"
import TargetHitAim from "@/assets/icon/target-hit-aim.svg"
import CheckMark from "@/assets/icon/check-mark.svg"
import OpenBook from "@/assets/icon/open-book.svg"
import Books from "@/assets/icon/books.svg"
import FileText from "@/assets/icon/file-text.svg"
import { Screen } from "@/components/screen";
import { TitlePage } from "@/components/titlepage";
import { AnimateBook } from "@/components/animatebook";
import { useUserStore } from "@/types/users";
import { useUserBookStore } from "@/types/books";
import { TAB_BAR_SPACE } from "@/constants/layout";
import { useMemo } from "react";

const DAYS_FR: Record<string, string> = {
    mon: "Lun", tue: "Mar", wed: "Mer", thu: "Jeu", fri: "Ven", sat: "Sam", sun: "Dim",
}

export default function Profile() {
    const theme = useTheme()
    const { mode, setMode } = useThemeContext()
    const styles = useStyles(theme)
    const { signOut } = useSession();
    const { user, isLoading } = useUserStore();
    const userBooks = useUserBookStore(s => s.userBooks) ?? []

    if (isLoading || !user) {
        return (
            <Screen>
                <SafeAreaView>
                    <AnimateBook />
                </SafeAreaView>
            </Screen>
        );
    }

    // Petits chiffres calculés depuis la bibliothèque déjà chargée (pas d'appel réseau en plus)
    const finished = userBooks.filter(b => b.status === "finished").length
    const reading = userBooks.filter(b => b.status === "reading").length
    const pages = userBooks.reduce((sum, b) =>
        sum + (b.status === "finished" ? Math.max(b.current_page, b.page_count ?? 0) : b.current_page), 0)

    const badges = [
        { label: "Premier livre", earned: finished >= 1, icon: <CheckMark width={22} height={22} /> },
        { label: "5 livres lus", earned: finished >= 5, icon: <OpenBook width={22} height={22} /> },
        { label: "Bibliophile", earned: userBooks.length >= 10, icon: <Books width={22} height={22} /> },
        { label: "1 000 pages", earned: pages >= 1000, icon: <FileText width={22} height={22} /> },
    ]

    const reminder = user.readingreminders?.[0]
    const reminderText = reminder && reminder.is_active
        ? `${reminder.remind_at.slice(0, 5)} · ${(reminder.days ?? []).map(d => DAYS_FR[d] ?? d).join(", ")}`
        : "Désactivé"

    return (
        <Screen>
            <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 22, paddingBottom: TAB_BAR_SPACE }}>
                    <TitlePage title="Profil" subtitle="Mon compte" />

                    {/* ── Identité ── */}
                    <View style={styles.card}>
                        <View style={{ alignItems: 'center', gap: 4 }}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatar_letter}>{user.name.charAt(0).toUpperCase()}</Text>
                            </View>
                            <Text style={styles.name}>{user.name}</Text>
                            <Text style={styles.email}>{user.email}</Text>
                        </View>
                        <View style={styles.mini_stats}>
                            <MiniStat theme={theme} value={finished} label="Lus" />
                            <View style={styles.mini_divider} />
                            <MiniStat theme={theme} value={reading} label="En cours" />
                            <View style={styles.mini_divider} />
                            <MiniStat theme={theme} value={pages.toLocaleString('fr-FR')} label="Pages" />
                        </View>
                    </View>

                    {/* ── Badges ── */}
                    <View style={{ gap: 12 }}>
                        <Text style={styles.section}>Badges</Text>
                        <View style={styles.badges}>
                            {badges.map(b => (
                                <View key={b.label} style={[styles.badge, !b.earned && { opacity: 0.35 }]}
                                    accessibilityLabel={`${b.label} : ${b.earned ? "obtenu" : "pas encore obtenu"}`}>
                                    <View style={[styles.badge_circle, b.earned && styles.badge_circle_earned]}>{b.icon}</View>
                                    <Text style={styles.badge_label} numberOfLines={2}>{b.label}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* ── Réglages ── */}
                    <View style={{ gap: 12 }}>
                        <Text style={styles.section}>Réglages</Text>
                        <View style={styles.card_list}>
                            <SettingRow theme={theme} icon={<TargetHitAim width={18} height={18} />}
                                label="Objectif annuel" value={`${user.reading_goal} livres`} />
                            <View style={styles.separator} />
                            <SettingRow theme={theme} icon={<Bell width={18} height={18} />}
                                label="Rappel de lecture" value={reminderText} />
                            <View style={styles.separator} />
                            <View style={{ padding: 14, gap: 12 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <IconBox theme={theme}><Moon width={18} height={18} /></IconBox>
                                    <Text style={styles.row_label}>Thème</Text>
                                </View>
                                <ThemeSegmented theme={theme} mode={mode} setMode={setMode} />
                            </View>
                        </View>
                    </View>

                    <Pressable
                        onPress={signOut}
                        accessibilityRole="button"
                        style={({ pressed }) => [styles.logout, pressed && { opacity: 0.7 }]}
                    >
                        <Text style={styles.logout_text}>Se déconnecter</Text>
                    </Pressable>
                </ScrollView>
            </SafeAreaView>
        </Screen>
    )
}

function MiniStat({ theme, value, label }: { theme: AppTheme; value: number | string; label: string }) {
    return (
        <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
            <Text style={{ fontFamily: theme.fonts.playfair.bold, fontSize: theme.fontSizes.lg, color: theme.colors.text.primary }}>{value}</Text>
            <Text style={{ fontFamily: theme.fonts.dmSans.regular, fontSize: theme.fontSizes.xs, color: theme.colors.text.label }}>{label}</Text>
        </View>
    )
}

function IconBox({ theme, children }: { theme: AppTheme; children: React.ReactNode }) {
    return (
        <View style={{
            width: 34, height: 34, borderRadius: theme.radius.md,
            backgroundColor: theme.colors.accent.ghost, alignItems: 'center', justifyContent: 'center',
        }}>{children}</View>
    )
}

function SettingRow({ theme, icon, label, value }: { theme: AppTheme; icon: React.ReactNode; label: string; value: string }) {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
            <IconBox theme={theme}>{icon}</IconBox>
            <Text style={{ flex: 1, fontFamily: theme.fonts.dmSans.medium, fontSize: theme.fontSizes.base, color: theme.colors.text.primary }}>{label}</Text>
            <Text numberOfLines={1} style={{ maxWidth: '45%', fontFamily: theme.fonts.dmSans.regular, fontSize: theme.fontSizes.sm, color: theme.colors.text.label }}>{value}</Text>
        </View>
    )
}

function ThemeSegmented({ theme, mode, setMode }: { theme: AppTheme; mode: ThemeMode; setMode: (m: ThemeMode) => void }) {
    const options: { key: ThemeMode; label: string }[] = [
        { key: 'system', label: 'Auto' },
        { key: 'light', label: 'Clair' },
        { key: 'dark', label: 'Sombre' },
    ]
    return (
        <View style={{
            flexDirection: 'row', padding: 4, gap: 4,
            borderRadius: theme.radius.md, backgroundColor: theme.colors.bg.input,
        }}>
            {options.map(o => {
                const active = o.key === mode
                return (
                    <Pressable key={o.key} onPress={() => setMode(o.key)}
                        accessibilityRole="button" accessibilityState={{ selected: active }}
                        style={{
                            flex: 1, paddingVertical: 9, alignItems: 'center',
                            borderRadius: theme.radius.sm,
                            backgroundColor: active ? theme.colors.accent.default : 'transparent',
                        }}>
                        <Text style={{
                            fontFamily: theme.fonts.dmSans.medium, fontSize: theme.fontSizes.sm,
                            color: active ? theme.colors.text.onAccent : theme.colors.text.secondary,
                        }}>{o.label}</Text>
                    </Pressable>
                )
            })}
        </View>
    )
}

function useStyles(theme: AppTheme) {
    return useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            marginHorizontal: 20,
            marginTop: 15,
        },
        card: {
            backgroundColor: theme.colors.bg.card,
            borderWidth: 1,
            borderColor: theme.colors.border.card,
            borderRadius: theme.radius.lg,
            paddingVertical: 22,
            paddingHorizontal: 16,
            gap: 20,
        },
        avatar: {
            width: 76,
            height: 76,
            borderRadius: theme.radius.full,
            backgroundColor: theme.colors.accent.default,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
            ...theme.shadows.md,
            shadowColor: theme.colors.accent.default,
        },
        avatar_letter: {
            fontFamily: theme.fonts.playfair.bold,
            fontSize: theme.fontSizes['2xl'],
            color: theme.colors.text.onAccent,
        },
        name: {
            fontFamily: theme.fonts.playfair.bold,
            fontSize: theme.fontSizes.lg,
            color: theme.colors.text.primary,
        },
        email: {
            fontFamily: theme.fonts.dmSans.regular,
            fontSize: theme.fontSizes.sm,
            color: theme.colors.text.label,
        },
        mini_stats: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border.separator,
        },
        mini_divider: {
            width: 1,
            height: 28,
            backgroundColor: theme.colors.border.separator,
        },
        section: {
            fontFamily: theme.fonts.dmSans.medium,
            fontSize: theme.fontSizes.xs,
            letterSpacing: 1,
            textTransform: 'uppercase',
            color: theme.colors.text.label,
        },
        badges: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 8,
        },
        badge: {
            flex: 1,
            alignItems: 'center',
            gap: 8,
        },
        badge_circle: {
            width: 56,
            height: 56,
            borderRadius: theme.radius.full,
            backgroundColor: theme.colors.bg.card,
            borderWidth: 1,
            borderColor: theme.colors.border.card,
            alignItems: 'center',
            justifyContent: 'center',
        },
        badge_circle_earned: {
            backgroundColor: theme.colors.accent.ghost,
            borderColor: theme.colors.accent.default,
        },
        badge_label: {
            textAlign: 'center',
            fontFamily: theme.fonts.dmSans.regular,
            fontSize: theme.fontSizes.xs,
            color: theme.colors.text.secondary,
        },
        card_list: {
            backgroundColor: theme.colors.bg.card,
            borderWidth: 1,
            borderColor: theme.colors.border.card,
            borderRadius: theme.radius.lg,
        },
        separator: {
            height: 1,
            marginLeft: 60,
            backgroundColor: theme.colors.border.separator,
        },
        row_label: {
            flex: 1,
            fontFamily: theme.fonts.dmSans.medium,
            fontSize: theme.fontSizes.base,
            color: theme.colors.text.primary,
        },
        logout: {
            paddingVertical: 16,
            borderRadius: theme.radius.lg,
            borderWidth: 1,
            borderColor: theme.colors.status.abandoned,
            backgroundColor: theme.colors.status.abandonedBg,
            alignItems: 'center',
        },
        logout_text: {
            fontFamily: theme.fonts.dmSans.medium,
            fontSize: theme.fontSizes.base,
            color: theme.colors.status.abandoned,
        },
    }), [theme])
}
