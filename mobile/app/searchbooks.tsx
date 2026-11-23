import { Screen } from "@/components/screen";
import { useTheme } from "@/constants/themecontext";
import { useMemo, useState } from "react";
import { Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Camera from "@/assets/icon/camera.svg"
import Search from "@/assets/icon/search.svg"
import { search_books } from "@/fetch/books";
import { BookResult, toGetBook } from "@/types/books";
import { router } from "expo-router";
import { CardBook } from "@/components/cardbook";

export default function SearchBooks() {
    const theme = useTheme()
    const styles = useStyles()
    const [search, setSearch] = useState('')
    const [books, setBooks] = useState<BookResult[]>([])
    const [isFocused, setIsFocused] = useState(false)
    const [loading, setLoading] = useState(false)
    const searchbooks = async () => {
        if (search.trim().length < 2) return // le backend exige min 2 caractères (sinon 422)
        Keyboard.dismiss()
        setLoading(true)
        const res = await search_books(search)
        if (res) {
            setBooks(res)
        }
        setLoading(false)
    }
    const camera = () => {
        router.replace('/camera')
    }


    return (
        <Screen>
            <SafeAreaView style={{ flex: 1, margin: 20 }}>
                <Text style={[{ margin: 5 }, styles.title]}>Recherche</Text>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
                    <View style={{ flex: 1 }}>
                        <View style={[{ alignItems: 'center', flexDirection: 'row' }, styles.text_input, isFocused && styles.text_input_focus]}>
                            <TextInput
                                style={styles.input}
                                value={search}
                                onChangeText={setSearch}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                onSubmitEditing={searchbooks}
                                returnKeyType="search"
                                placeholder="Titre, auteur ou ISBN"
                                placeholderTextColor={theme.colors.text.muted}
                                autoFocus
                            />
                        </View>
                    </View>
                    <View>
                        <View style={styles.button}>
                            <TouchableOpacity onPress={searchbooks}>
                                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                    <Search width={22} height={22} color={theme.colors.text.secondary} />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.button}>
                        <TouchableOpacity onPress={camera}>
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <Camera width={22} height={22} color={theme.colors.text.secondary} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ flex: 1, marginTop: 5 }}>{
                    loading ?
                        <View style={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                            <Text style={styles.title}>Chargement...</Text>
                        </View>
                        : (
                            <ScrollView keyboardShouldPersistTaps="handled">
                                <View style={{ marginBottom: 80, marginTop: 10 }}>
                                    {books.map((x: BookResult) => (
                                        <View style={{ margin: 5 }} key={x.google_books_id}>
                                            <CardBook book={toGetBook(x)} page="/searchbooks" />
                                        </View>
                                    ))}
                                </View>
                            </ScrollView>
                        )
                }</View>
            </SafeAreaView>
        </Screen>
    )
}

function useStyles() {
    const theme = useTheme()
    return useMemo(() => StyleSheet.create({
        button: {
            backgroundColor: theme.colors.bg.banner,
            padding: 15,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: theme.radius.full,
        },
        button_text: {
            fontFamily: theme.fonts.playfair.regular,
            fontSize: theme.fontSizes.md,
            color: theme.colors.text.secondary,
            textAlign: 'center'
        },
        button_search: {
            padding: 10,
            backgroundColor: theme.colors.bg.banner,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: theme.radius.full,
        },
        text_input: {
            padding: 2,
            borderWidth: 2,
            borderRadius: 15,
            borderColor: theme.colors.border.card,
            fontFamily: theme.fonts.dmSans.regular,
            color: theme.colors.text.primary
        },
        input: {
            flex: 1,
            paddingHorizontal: 10,
            paddingVertical: 8,
            fontFamily: theme.fonts.dmSans.regular,
            color: theme.colors.text.primary,
        },
        text_input_focus: {
            borderColor: theme.colors.border.focus,
        },
        title: {
            fontFamily: theme.fonts.playfair.bold,
            fontSize: theme.fontSizes.md,
            color: theme.colors.text.secondary,
        },
    }), [theme])
}