import { useMemo, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "@/components/screen";
import { BackButton } from "@/components/backbutton";
import { FormField } from "@/components/formfield";
import { useToast } from "@/components/toast/toast_context";
import { useTheme } from "@/constants/themecontext";
import { AppTheme } from "@/constants/theme";
import { create_manual_book, ManualBook } from "@/fetch/books";

const STATUSES: { key: ManualBook['status']; label: string }[] = [
    { key: "to_read", label: "À lire" },
    { key: "reading", label: "En cours" },
    { key: "finished", label: "Terminé" },
]

// Ajout manuel d'un livre que Google Books ne connaît pas.
// Peut être ouvert avec un ISBN (après un scan) ou un titre (après une recherche) déjà remplis.
export default function AddBook() {
    const theme = useTheme()
    const styles = useStyles(theme)
    const { show } = useToast()
    const params = useLocalSearchParams<{ isbn?: string; title?: string }>()

    const [title, setTitle] = useState(params.title ?? "")
    const [author, setAuthor] = useState("")
    const [isbn, setIsbn] = useState(params.isbn ?? "")
    const [pages, setPages] = useState("")
    const [year, setYear] = useState("")
    const [publisher, setPublisher] = useState("")
    const [genre, setGenre] = useState("")
    const [description, setDescription] = useState("")
    const [status, setStatus] = useState<ManualBook['status']>("to_read")
    const [busy, setBusy] = useState(false)

    const canSubmit = title.trim().length > 0 && author.trim().length > 0 && !busy

    const submit = async () => {
        if (!canSubmit) return
        setBusy(true)
        // Les champs vides ne sont pas envoyés (le backend les enregistre à null)
        const res = await create_manual_book({
            title: title.trim(),
            author: author.trim(),
            isbn: isbn.trim() || undefined,
            page_count: pages ? parseInt(pages, 10) : undefined,
            published_year: year || undefined,
            publisher: publisher.trim() || undefined,
            genre: genre.trim() || undefined,
            description: description.trim() || undefined,
            status,
        })
        setBusy(false)
        if (res.ok) {
            show("Livre ajouté à ta bibliothèque", "success")
            router.replace('/(tabs)')
        } else {
            show(res.message, "error")
        }
    }

    return (
        <Screen>
            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <View style={styles.topbar}>
                        <BackButton fallback="/searchbooks" />
                    </View>

                    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}>
                        <View style={{ gap: 6 }}>
                            <Text style={styles.title}>Ajouter un livre</Text>
                            <Text style={styles.subtitle}>
                                Ce livre est introuvable dans Google Books ? Renseigne-le : il sera ajouté à ta
                                bibliothèque et trouvable par la recherche.
                            </Text>
                        </View>

                        <FormField label="Titre" required value={title} onChangeText={setTitle}
                            placeholder="Le Petit Prince" autoCapitalize="sentences" />
                        <FormField label="Auteur" required value={author} onChangeText={setAuthor}
                            placeholder="Antoine de Saint-Exupéry" autoCapitalize="words" />
                        <FormField label="ISBN" value={isbn} onChangeText={setIsbn} keyboardType="number-pad"
                            placeholder="978…" hint="10 ou 13 chiffres, au dos du livre sous le code-barres" />

                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <FormField label="Pages" value={pages} keyboardType="number-pad" placeholder="250"
                                    onChangeText={t => setPages(t.replace(/[^0-9]/g, ''))} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <FormField label="Année" value={year} keyboardType="number-pad" placeholder="2024"
                                    maxLength={4} onChangeText={t => setYear(t.replace(/[^0-9]/g, ''))} />
                            </View>
                        </View>

                        <FormField label="Éditeur" value={publisher} onChangeText={setPublisher} placeholder="Gallimard" />
                        <FormField label="Genre" value={genre} onChangeText={setGenre} placeholder="Roman, BD, Essai…" />
                        <FormField label="Résumé" value={description} onChangeText={setDescription} multiline
                            placeholder="Quelques lignes sur le livre (optionnel)" />

                        <View style={{ gap: 8 }}>
                            <Text style={styles.label}>Statut</Text>
                            <View style={styles.segmented}>
                                {STATUSES.map(s => {
                                    const active = status === s.key
                                    return (
                                        <Pressable key={s.key} onPress={() => setStatus(s.key)}
                                            accessibilityRole="button" accessibilityState={{ selected: active }}
                                            style={[styles.segment, active && styles.segment_active]}>
                                            <Text style={[styles.segment_text, active && styles.segment_text_active]}>{s.label}</Text>
                                        </Pressable>
                                    )
                                })}
                            </View>
                        </View>

                        <Pressable onPress={submit} disabled={!canSubmit} accessibilityRole="button"
                            style={({ pressed }) => [styles.primary, !canSubmit && { opacity: 0.45 }, pressed && { opacity: 0.85 }]}>
                            {busy
                                ? <ActivityIndicator color={theme.colors.text.onAccent} />
                                : <Text style={styles.primary_text}>Ajouter à ma bibliothèque</Text>}
                        </Pressable>
                    </ScrollView>
                </KeyboardAvoidingView>
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
        content: {
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: 40,
            gap: 18,
        },
        title: {
            fontFamily: theme.fonts.playfair.bold,
            fontSize: theme.fontSizes.xl,
            color: theme.colors.text.primary,
        },
        subtitle: {
            fontFamily: theme.fonts.dmSans.regular,
            fontSize: theme.fontSizes.sm,
            lineHeight: theme.fontSizes.sm * 1.5,
            color: theme.colors.text.secondary,
        },
        row: {
            flexDirection: 'row',
            gap: 12,
        },
        label: {
            fontFamily: theme.fonts.dmSans.medium,
            fontSize: theme.fontSizes.sm,
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
        primary: {
            marginTop: 6,
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
    }), [theme])
}
