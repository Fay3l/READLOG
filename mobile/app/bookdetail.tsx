import { Screen } from "@/components/screen";
import { useTheme } from "@/constants/themecontext";
import { AppTheme } from "@/constants/theme";
import { GetBook, toBookResult, useBookStore } from "@/types/books";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Progress from 'react-native-progress'
import { add_userbook, remove_userbook, update_userbook } from "@/fetch/books";
import { useToast } from "@/components/toast/toast_context";
import { BookDescription, BookHero } from "@/components/bookhero";

const STATUSES = [
    { key: "to_read", label: "À lire" },
    { key: "reading", label: "En cours" },
    { key: "finished", label: "Terminé" },
]

export default function BookDetail() {
    const theme = useTheme()
    const styles = useStyles(theme)
    const book = useBookStore(s => s.book);
    const setBook = useBookStore(s => s.setBook);
    const { page } = useLocalSearchParams<{ page: string }>();
    const { show } = useToast()
    const [busy, setBusy] = useState(false)
    const [confirmRemove, setConfirmRemove] = useState(false)
    const [pageInput, setPageInput] = useState(String(book?.current_page ?? 0))
    // Quand la page enregistrée change (après une mise à jour), on resynchronise le champ.
    // Ajuster un state pendant le rendu est le modèle recommandé par React plutôt qu'un useEffect.
    const [syncedPage, setSyncedPage] = useState(book?.current_page)
    if (book && book.current_page !== syncedPage) {
        setSyncedPage(book.current_page)
        setPageInput(String(book.current_page))
    }

    if (!book) return null;

    const inLibrary = !!book.id

    const goBack = () => {
        // ✅ l'écran est empilé dans le Stack : on revient simplement en arrière
        if (router.canGoBack()) router.back()
        else router.replace((page || '/(tabs)') as Parameters<typeof router.replace>[0])
    }

    const addBook = async () => {
        setBusy(true)
        const res = await add_userbook(toBookResult(book))
        setBusy(false)
        if (res.ok) {
            show('Livre ajouté', 'success')
            router.replace('/(tabs)')
        } else show(res.message, 'error')
    }

    const removeBook = async () => {
        // 1er appui : demande de confirmation, 2e appui : suppression
        if (!confirmRemove) { setConfirmRemove(true); return }
        setBusy(true)
        const res = await remove_userbook(book.id)
        setBusy(false)
        if (res.ok) {
            show('Livre supprimé', 'success')
            router.replace('/(tabs)')
        } else show(res.message, 'error')
    }

    const update = async (data: { status?: string; current_page?: number }) => {
        setBusy(true)
        const res = await update_userbook(book.id, data)
        setBusy(false)
        if (res.ok && res.book) setBook(res.book as GetBook)
        else if (!res.ok) show(res.message, 'error')
    }

    const savePage = (value: number) => {
        const max = book.page_count ?? Number.MAX_SAFE_INTEGER
        const next = Math.max(0, Math.min(value, max))
        setPageInput(String(next))
        if (next === book.current_page) return
        // terminer automatiquement quand on atteint la dernière page
        const finished = book.page_count && next >= book.page_count
        void update({ current_page: next, ...(finished ? { status: "finished" } : book.status === "to_read" && next > 0 ? { status: "reading" } : {}) })
    }

    const progress = book.page_count ? Math.min(book.current_page / book.page_count, 1) : 0

    return (
        <Screen>
            <SafeAreaView style={{ flex: 1 }}>
                {/* ── Barre du haut ── */}
                <View style={styles.topbar}>
                    <Pressable onPress={goBack} hitSlop={10} accessibilityRole="button" accessibilityLabel="Retour"
                        style={({ pressed }) => [styles.back, pressed && { opacity: 0.7 }]}>
                        <Text style={styles.back_text}>‹  Retour</Text>
                    </Pressable>
                    {busy ? <ActivityIndicator color={theme.colors.accent.default} /> : null}
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled">
                    <BookHero
                        title={book.title}
                        author={book.author}
                        coverUrl={book.cover_url}
                        publishedYear={book.published_year}
                        publisher={book.publisher}
                        pageCount={book.page_count}
                        genre={book.genres}
                    />

                    {inLibrary ? (
                        <View style={styles.card}>
                            <Text style={styles.overline}>Ma lecture</Text>

                            {/* Statut */}
                            <View style={styles.segmented}>
                                {STATUSES.map(s => {
                                    const active = book.status === s.key
                                    return (
                                        <Pressable key={s.key} disabled={busy || active}
                                            onPress={() => update({ status: s.key })}
                                            accessibilityRole="button" accessibilityState={{ selected: active }}
                                            style={[styles.segment, active && styles.segment_active]}>
                                            <Text style={[styles.segment_text, active && styles.segment_text_active]}>{s.label}</Text>
                                        </Pressable>
                                    )
                                })}
                            </View>

                            {/* Progression */}
                            <View style={{ gap: 10 }}>
                                <View style={styles.progress_header}>
                                    <Text style={styles.label}>Page actuelle</Text>
                                    {book.page_count ? <Text style={styles.percent}>{Math.round(progress * 100)} %</Text> : null}
                                </View>
                                {book.page_count ? (
                                    <Progress.Bar width={null} height={6} borderWidth={0} borderRadius={3}
                                        progress={progress} color={theme.colors.accent.default}
                                        unfilledColor={theme.colors.border.progress} />
                                ) : null}
                                <View style={styles.stepper}>
                                    <StepButton theme={theme} label="−10" onPress={() => savePage(book.current_page - 10)} disabled={busy} />
                                    <View style={styles.page_field}>
                                        <TextInput
                                            value={pageInput}
                                            onChangeText={t => setPageInput(t.replace(/[^0-9]/g, ''))}
                                            onEndEditing={() => savePage(parseInt(pageInput || '0', 10))}
                                            onSubmitEditing={() => savePage(parseInt(pageInput || '0', 10))}
                                            keyboardType="number-pad"
                                            returnKeyType="done"
                                            style={styles.page_input}
                                            accessibilityLabel="Page actuelle"
                                        />
                                        {book.page_count ? <Text style={styles.page_total}>/ {book.page_count}</Text> : null}
                                    </View>
                                    <StepButton theme={theme} label="+10" onPress={() => savePage(book.current_page + 10)} disabled={busy} />
                                </View>
                            </View>
                        </View>
                    ) : null}

                    <BookDescription text={book.description} />

                    {/* ── Action principale ── */}
                    {inLibrary ? (
                        <Pressable onPress={removeBook} disabled={busy} accessibilityRole="button"
                            style={({ pressed }) => [styles.remove, confirmRemove && styles.remove_confirm, pressed && { opacity: 0.7 }]}>
                            <Text style={styles.remove_text}>
                                {confirmRemove ? "Confirmer la suppression" : "Retirer de ma bibliothèque"}
                            </Text>
                        </Pressable>
                    ) : (
                        <Pressable onPress={addBook} disabled={busy} accessibilityRole="button"
                            style={({ pressed }) => [styles.primary, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}>
                            <Text style={styles.primary_text}>Ajouter à ma bibliothèque</Text>
                        </Pressable>
                    )}
                </ScrollView>
            </SafeAreaView>
        </Screen>
    )
}

function StepButton({ theme, label, onPress, disabled }: { theme: AppTheme; label: string; onPress: () => void; disabled: boolean }) {
    return (
        <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button"
            accessibilityLabel={`${label} pages`}
            style={({ pressed }) => ({
                width: 56, paddingVertical: 12, alignItems: 'center',
                borderRadius: theme.radius.md, backgroundColor: theme.colors.accent.ghost,
                opacity: pressed ? 0.7 : 1,
            })}>
            <Text style={{ fontFamily: theme.fonts.dmSans.medium, fontSize: theme.fontSizes.base, color: theme.colors.accent.default }}>{label}</Text>
        </Pressable>
    )
}

function useStyles(theme: AppTheme) {
    return useMemo(() => StyleSheet.create({
        topbar: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 8,
        },
        back: {
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: theme.radius.full,
            backgroundColor: theme.colors.accent.ghost,
        },
        back_text: {
            fontFamily: theme.fonts.dmSans.medium,
            fontSize: theme.fontSizes.sm,
            color: theme.colors.text.primary,
        },
        content: {
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 40,
            gap: 26,
        },
        card: {
            backgroundColor: theme.colors.bg.card,
            borderWidth: 1,
            borderColor: theme.colors.border.card,
            borderRadius: theme.radius.lg,
            padding: 16,
            gap: 18,
        },
        overline: {
            fontFamily: theme.fonts.dmSans.medium,
            fontSize: theme.fontSizes.xs,
            letterSpacing: 1,
            textTransform: 'uppercase',
            color: theme.colors.text.label,
        },
        segmented: {
            flexDirection: 'row',
            padding: 4,
            gap: 4,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.bg.input,
        },
        segment: {
            flex: 1,
            paddingVertical: 10,
            alignItems: 'center',
            borderRadius: theme.radius.sm,
        },
        segment_active: {
            backgroundColor: theme.colors.accent.default,
        },
        segment_text: {
            fontFamily: theme.fonts.dmSans.medium,
            fontSize: theme.fontSizes.sm,
            color: theme.colors.text.secondary,
        },
        segment_text_active: {
            color: theme.colors.text.onAccent,
        },
        progress_header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'baseline',
        },
        label: {
            fontFamily: theme.fonts.dmSans.medium,
            fontSize: theme.fontSizes.sm,
            color: theme.colors.text.secondary,
        },
        percent: {
            fontFamily: theme.fonts.dmSans.medium,
            fontSize: theme.fontSizes.sm,
            color: theme.colors.accent.default,
        },
        stepper: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
        },
        page_field: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            borderRadius: theme.radius.md,
            borderWidth: 1,
            borderColor: theme.colors.border.inactive,
            backgroundColor: theme.colors.bg.input,
            paddingHorizontal: 12,
        },
        page_input: {
            width: 64,
            paddingVertical: 10,
            textAlign: 'center',
            fontFamily: theme.fonts.playfair.bold,
            fontSize: theme.fontSizes.lg,
            color: theme.colors.text.primary,
        },
        page_total: {
            flexShrink: 0,
            fontFamily: theme.fonts.dmSans.regular,
            fontSize: theme.fontSizes.base,
            color: theme.colors.text.label,
        },
        primary: {
            backgroundColor: theme.colors.accent.default,
            borderRadius: theme.radius.lg,
            paddingVertical: 17,
            alignItems: 'center',
        },
        primary_text: {
            fontFamily: theme.fonts.dmSans.medium,
            fontSize: theme.fontSizes.md,
            color: theme.colors.text.onAccent,
        },
        remove: {
            borderRadius: theme.radius.lg,
            paddingVertical: 15,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.colors.border.inactive,
        },
        remove_confirm: {
            borderColor: theme.colors.status.abandoned,
            backgroundColor: theme.colors.status.abandonedBg,
        },
        remove_text: {
            fontFamily: theme.fonts.dmSans.medium,
            fontSize: theme.fontSizes.base,
            color: theme.colors.status.abandoned,
        },
    }), [theme])
}
