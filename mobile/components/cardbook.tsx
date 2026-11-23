import { useTheme } from "@/constants/themecontext";
import { useMemo } from "react";
import { StyleSheet, View, Text, Pressable, Image } from "react-native";
import * as Progress from 'react-native-progress'
import OpenBook from "@/assets/icon/open-book.svg"
import { TagStatus } from "./tagstatus";
import { GetBook, useBookStore } from "@/types/books";
import { router } from "expo-router";

interface CardBookProps {
    readonly book: GetBook
    readonly page: string
}

export function CardBook({ book, page }: CardBookProps) {
    const theme = useTheme()
    const styles = useStyles()
    const setBook = useBookStore(s => s.setBook)

    // Progression seulement pour un livre de la bibliothèque, en cours, avec un nombre de pages connu
    const showProgress = !!book.id && book.status === "reading" && !!book.page_count
    const progress = showProgress ? Math.min(book.current_page / book.page_count!, 1) : 0

    function handlePress() {
        setBook(book)
        router.push({ pathname: '/bookdetail', params: { page } })
    }

    return (
        <Pressable
            onPress={handlePress}
            style={({ pressed }) => [styles.card, pressed && styles.card_pressed]}
            accessibilityRole="button"
            accessibilityLabel={`${book.title}, ${book.author}`}
        >
            {/* Couverture */}
            {book.cover_url ? (
                <Image source={{ uri: book.cover_url }} style={styles.cover} />
            ) : (
                <View style={[styles.cover, styles.cover_placeholder]}>
                    <OpenBook width={26} height={26} />
                </View>
            )}

            {/* Infos : minWidth 0 + flex 1 => le texte se coupe au lieu de pousser le tag hors de la carte */}
            <View style={styles.infos}>
                <View style={styles.header}>
                    <Text style={styles.title} numberOfLines={2}>{book.title}</Text>
                    {book.status ? (
                        <View style={styles.tag}>
                            <TagStatus status={book.status} is_active={false} />
                        </View>
                    ) : null}
                </View>

                <Text style={styles.author} numberOfLines={1}>{book.author}</Text>
                {book.genres ? <Text style={styles.genre} numberOfLines={1}>{book.genres}</Text> : null}

                {showProgress ? (
                    <View style={styles.progress_row}>
                        <View style={{ flex: 1 }}>
                            <Progress.Bar
                                width={null}
                                height={4}
                                progress={progress}
                                color={theme.colors.accent.default}
                                unfilledColor={theme.colors.border.progress}
                                borderWidth={0}
                                borderRadius={2}
                            />
                        </View>
                        <Text style={styles.progress_text}>{Math.round(progress * 100)} %</Text>
                    </View>
                ) : null}
            </View>

            <Text style={styles.chevron}>›</Text>
        </Pressable>
    )
}

function useStyles() {
    const theme = useTheme()
    return useMemo(() => StyleSheet.create({
        card: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            backgroundColor: theme.colors.bg.card,
            borderRadius: theme.radius.lg,
            borderWidth: 1,
            borderColor: theme.colors.border.card,
            padding: 12,
        },
        card_pressed: {
            opacity: 0.85,
            transform: [{ scale: 0.99 }],
        },
        cover: {
            width: 56,
            height: 84,
            borderRadius: theme.radius.sm,
        },
        cover_placeholder: {
            backgroundColor: theme.colors.accent.ghost,
            borderWidth: 1,
            borderColor: theme.colors.accent.tint,
            justifyContent: 'center',
            alignItems: 'center',
        },
        infos: {
            flex: 1,
            minWidth: 0,
            gap: 4,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 8,
        },
        title: {
            flex: 1,
            fontFamily: theme.fonts.playfair.bold,
            fontSize: theme.fontSizes.md,
            lineHeight: theme.fontSizes.md * 1.25,
            color: theme.colors.text.primary,
        },
        tag: {
            flexShrink: 0, // le tag garde toujours sa taille
            marginTop: 1,
        },
        author: {
            fontFamily: theme.fonts.dmSans.regular,
            fontSize: theme.fontSizes.sm,
            color: theme.colors.text.secondary,
        },
        genre: {
            fontFamily: theme.fonts.dmSans.regular,
            fontSize: theme.fontSizes.xs,
            color: theme.colors.text.label,
        },
        progress_row: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginTop: 6,
        },
        progress_text: {
            fontFamily: theme.fonts.dmSans.medium,
            fontSize: theme.fontSizes.xs,
            color: theme.colors.accent.default,
            minWidth: 34,
            textAlign: 'right',
        },
        chevron: {
            fontSize: 26,
            color: theme.colors.text.hint,
            marginLeft: -4,
        },
    }), [theme])
}
