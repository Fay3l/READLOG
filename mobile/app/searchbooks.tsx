import { Screen } from "@/components/screen";
import { useTheme } from "@/constants/themecontext";
import { AppTheme } from "@/constants/theme";
import { useMemo, useState } from "react";
import { ActivityIndicator, Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Camera from "@/assets/icon/camera.svg"
import Search from "@/assets/icon/search.svg"
import { search_books } from "@/fetch/books";
import { BookResult, toGetBook } from "@/types/books";
import { router } from "expo-router";
import { CardBook } from "@/components/cardbook";
import { BackButton } from "@/components/backbutton";

export default function SearchBooks() {
    const theme = useTheme()
    const styles = useStyles(theme)
    const [search, setSearch] = useState('')
    const [books, setBooks] = useState<BookResult[]>([])
    const [isFocused, setIsFocused] = useState(false)
    const [loading, setLoading] = useState(false)
    // null = pas encore cherché ; sinon le texte de la dernière recherche (pour l'état "aucun résultat")
    const [searched, setSearched] = useState<string | null>(null)

    const runSearch = async () => {
        const query = search.trim()
        if (query.length < 2) return // le backend exige min 2 caractères (sinon 422)
        Keyboard.dismiss()
        setLoading(true)
        // Le backend cherche dans notre base (livres ajoutés à la main) PUIS dans Google Books
        setBooks(await search_books(query))
        setSearched(query)
        setLoading(false)
    }

    // Pré-remplit le formulaire avec ce qui a été cherché : ISBN si ce sont des chiffres, sinon titre
    const addManually = () => {
        const query = searched ?? search.trim()
        const isIsbn = /^[0-9-]{10,17}$/.test(query)
        router.push({ pathname: '/addbook', params: isIsbn ? { isbn: query } : { title: query } })
    }

    return (
        <Screen>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.topbar}>
                    <BackButton />
                </View>

                <View style={styles.header}>
                    <Text style={styles.title}>Recherche</Text>
                    <View style={styles.search_row}>
                        <View style={[styles.field, isFocused && styles.field_focus]}>
                            <Pressable onPress={runSearch} hitSlop={8} accessibilityRole="button" accessibilityLabel="Rechercher">
                                <Search width={18} height={18} color={theme.colors.text.hint} />
                            </Pressable>
                            <TextInput
                                style={styles.input}
                                value={search}
                                onChangeText={setSearch}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                onSubmitEditing={runSearch}
                                returnKeyType="search"
                                placeholder="Titre, auteur ou ISBN"
                                placeholderTextColor={theme.colors.text.hint}
                                autoFocus
                            />
                        </View>
                        <Pressable onPress={() => router.replace('/camera')} accessibilityRole="button"
                            accessibilityLabel="Scanner un code-barres"
                            style={({ pressed }) => [styles.icon_button, pressed && { opacity: 0.7 }]}>
                            <Camera width={22} height={22} color={theme.colors.text.secondary} />
                        </Pressable>
                    </View>
                </View>

                {loading ? (
                    <ActivityIndicator style={{ marginTop: 40 }} color={theme.colors.accent.default} />
                ) : (
                    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.results}>
                        {books.map((x: BookResult) => (
                            <CardBook key={x.google_books_id} book={toGetBook(x)} page="/searchbooks" />
                        ))}

                        {searched !== null && books.length === 0 ? (
                            // ── Aucun résultat : on propose directement l'ajout manuel ──
                            <View style={styles.empty}>
                                <Text style={styles.empty_title}>Aucun livre trouvé</Text>
                                <Text style={styles.empty_text}>
                                    « {searched} » n’est ni dans Google Books ni dans ReadLog.
                                    Tu peux l’ajouter toi-même en quelques secondes.
                                </Text>
                                <Pressable onPress={addManually} accessibilityRole="button"
                                    style={({ pressed }) => [styles.primary, pressed && { opacity: 0.85 }]}>
                                    <Text style={styles.primary_text}>Ajouter ce livre manuellement</Text>
                                </Pressable>
                            </View>
                        ) : null}

                        {books.length > 0 ? (
                            // ── Des résultats, mais peut-être pas le bon livre ──
                            <Pressable onPress={addManually} accessibilityRole="button" hitSlop={8}
                                style={styles.manual_link}>
                                <Text style={styles.manual_link_text}>
                                    Tu ne trouves pas ton livre ? <Text style={styles.link}>Ajoute-le manuellement</Text>
                                </Text>
                            </Pressable>
                        ) : null}
                    </ScrollView>
                )}
            </SafeAreaView>
        </Screen>
    )
}

function useStyles(theme: AppTheme) {
    return useMemo(() => StyleSheet.create({
        topbar: {
            paddingHorizontal: 20,
            paddingVertical: 8,
        },
        header: {
            paddingHorizontal: 20,
            gap: 12,
        },
        title: {
            fontFamily: theme.fonts.playfair.bold,
            fontSize: theme.fontSizes.xl,
            color: theme.colors.text.primary,
        },
        search_row: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
        },
        field: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingHorizontal: 14,
            borderWidth: 1.5,
            borderRadius: theme.radius.lg,
            borderColor: theme.colors.border.card,
            backgroundColor: theme.colors.bg.input,
        },
        field_focus: {
            borderColor: theme.colors.border.focus,
        },
        input: {
            flex: 1,
            paddingVertical: 13,
            fontFamily: theme.fonts.dmSans.regular,
            fontSize: theme.fontSizes.base,
            color: theme.colors.text.primary,
        },
        icon_button: {
            width: 50,
            height: 50,
            borderRadius: theme.radius.full,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colors.accent.ghost,
        },
        results: {
            padding: 20,
            gap: 12,
            paddingBottom: 60,
        },
        empty: {
            alignItems: 'center',
            gap: 10,
            marginTop: 24,
            padding: 20,
            borderRadius: theme.radius.lg,
            borderWidth: 1,
            borderColor: theme.colors.border.card,
            backgroundColor: theme.colors.bg.card,
        },
        empty_title: {
            fontFamily: theme.fonts.playfair.bold,
            fontSize: theme.fontSizes.lg,
            color: theme.colors.text.primary,
        },
        empty_text: {
            textAlign: 'center',
            fontFamily: theme.fonts.dmSans.regular,
            fontSize: theme.fontSizes.sm,
            lineHeight: theme.fontSizes.sm * 1.5,
            color: theme.colors.text.secondary,
        },
        primary: {
            marginTop: 6,
            alignSelf: 'stretch',
            backgroundColor: theme.colors.accent.default,
            borderRadius: theme.radius.lg,
            paddingVertical: 15,
            alignItems: 'center',
        },
        primary_text: {
            fontFamily: theme.fonts.dmSans.medium,
            fontSize: theme.fontSizes.base,
            color: theme.colors.text.onAccent,
        },
        manual_link: {
            alignItems: 'center',
            paddingVertical: 10,
        },
        manual_link_text: {
            fontFamily: theme.fonts.dmSans.regular,
            fontSize: theme.fontSizes.sm,
            color: theme.colors.text.label,
        },
        link: {
            fontFamily: theme.fonts.dmSans.medium,
            color: theme.colors.accent.default,
        },
    }), [theme])
}
