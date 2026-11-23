import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppTheme } from "@/constants/theme";
import { useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import { useTheme } from "@/constants/themecontext";
import { useBookResultStore } from "@/types/books";
import { Screen } from "@/components/screen";
import { add_userbook } from "@/fetch/books";
import { useToast } from "@/components/toast/toast_context";
import { BookDescription, BookHero } from "@/components/bookhero";
import CheckMark from "@/assets/icon/check-mark.svg"

// Écran affiché après un scan de code-barres : on confirme le livre trouvé avant de l'ajouter.
export default function BookResult() {
    const theme = useTheme()
    const styles = useStyles(theme)
    const { show } = useToast()
    const book = useBookResultStore((s) => s.scannedBook)
    const [busy, setBusy] = useState(false)

    // ✅ pas de navigation pendant le rendu : on le fait dans un effet
    useEffect(() => {
        if (!book) router.back()
    }, [book])
    if (!book) return null;

    const addBook = async () => {
        setBusy(true)
        // add_userbook ne lève jamais d'erreur : il renvoie { ok, message }
        const res = await add_userbook(book)
        setBusy(false)
        if (res.ok) {
            show("Livre ajouté", "success")
            router.replace('/(tabs)')
        } else {
            show(res.message ?? "Livre pas ajouté", 'error')
        }
    }

    return (
        <Screen>
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.found}>
                        <CheckMark width={16} height={16} />
                        <Text style={styles.found_text}>Livre trouvé</Text>
                    </View>

                    <BookHero
                        title={book.title}
                        author={book.author}
                        coverUrl={book.cover_url}
                        publishedYear={book.published_year}
                        publisher={book.publisher}
                        pageCount={book.page_count}
                        genre={book.genre}
                    />

                    <Text style={styles.question}>C'est bien ce livre ?</Text>

                    <BookDescription text={book.description} />
                </ScrollView>

                {/* Actions fixées en bas, toujours visibles */}
                <View style={styles.actions}>
                    <Pressable onPress={addBook} disabled={busy} accessibilityRole="button"
                        style={({ pressed }) => [styles.primary, pressed && styles.pressed]}>
                        {busy
                            ? <ActivityIndicator color={theme.colors.text.onAccent} />
                            : <Text style={styles.primary_text}>Oui, l'ajouter à ma bibliothèque</Text>}
                    </Pressable>
                    <Pressable onPress={() => router.replace('/camera')} disabled={busy} accessibilityRole="button"
                        style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
                        <Text style={styles.secondary_text}>Non, scanner à nouveau</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        </Screen>
    )
}

function useStyles(theme: AppTheme) {
    return useMemo(() => StyleSheet.create({
        content: {
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 24,
            gap: 22,
        },
        found: {
            alignSelf: 'center',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: theme.radius.full,
            backgroundColor: theme.colors.status.finishedBg,
        },
        found_text: {
            fontFamily: theme.fonts.dmSans.medium,
            fontSize: theme.fontSizes.sm,
            color: theme.colors.status.finished,
        },
        question: {
            textAlign: 'center',
            fontFamily: theme.fonts.playfair.italic,
            fontSize: theme.fontSizes.lg,
            color: theme.colors.accent.default,
        },
        actions: {
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 12,
            gap: 10,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border.separator,
            backgroundColor: theme.colors.bg.primary,
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
        secondary: {
            borderRadius: theme.radius.lg,
            paddingVertical: 15,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.colors.border.inactive,
        },
        secondary_text: {
            fontFamily: theme.fonts.dmSans.medium,
            fontSize: theme.fontSizes.base,
            color: theme.colors.text.primary,
        },
        pressed: {
            opacity: 0.85,
            transform: [{ scale: 0.98 }],
        },
    }), [theme])
}
