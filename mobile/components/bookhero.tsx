import { useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import OpenBook from "@/assets/icon/open-book.svg"
import { useTheme } from "@/constants/themecontext";
import { AppTheme } from "@/constants/theme";

interface BookHeroProps {
    readonly title: string
    readonly author: string
    readonly coverUrl: string | null
    readonly publishedYear?: string | null
    readonly publisher?: string | null
    readonly pageCount?: number | null
    readonly genre?: string | null
}

// En-tête commun à la fiche d'un livre et au résultat d'un scan :
// couverture, titre, auteur et métadonnées.
export function BookHero({ title, author, coverUrl, publishedYear, publisher, pageCount, genre }: BookHeroProps) {
    const theme = useTheme()
    const styles = useStyles(theme)
    const meta = [publishedYear, pageCount ? `${pageCount} pages` : null, publisher].filter(Boolean).join("  ·  ")

    return (
        <View style={styles.hero}>
            <View style={styles.cover_shadow}>
                {coverUrl ? (
                    <Image source={{ uri: coverUrl }} style={styles.cover} />
                ) : (
                    <View style={[styles.cover, styles.cover_placeholder]}>
                        <OpenBook width={56} height={56} />
                    </View>
                )}
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.author}>{author}</Text>
            {meta ? <Text style={styles.meta}>{meta}</Text> : null}
            {genre ? (
                <View style={styles.genre}>
                    <Text style={styles.genre_text}>{genre}</Text>
                </View>
            ) : null}
        </View>
    )
}

// Résumé repliable. Google Books renvoie parfois du HTML (<p>, <br>, <b>) : on le nettoie.
export function BookDescription({ text }: { text: string | null }) {
    const theme = useTheme()
    const styles = useStyles(theme)
    const [expanded, setExpanded] = useState(false)
    const clean = (text ?? "")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n\n")
        .replace(/<[^>]+>/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim()

    return (
        <View style={styles.section}>
            <Text style={styles.overline}>Résumé</Text>
            {clean ? (
                <>
                    <Text style={styles.description} numberOfLines={expanded ? undefined : 6}>{clean}</Text>
                    {clean.length > 280 ? (
                        <Pressable onPress={() => setExpanded(v => !v)} hitSlop={8}>
                            <Text style={styles.more}>{expanded ? "Réduire" : "Lire la suite"}</Text>
                        </Pressable>
                    ) : null}
                </>
            ) : (
                <Text style={styles.description_empty}>Pas de résumé disponible pour ce livre.</Text>
            )}
        </View>
    )
}

function useStyles(theme: AppTheme) {
    return useMemo(() => StyleSheet.create({
        hero: {
            alignItems: 'center',
            gap: 6,
        },
        cover_shadow: {
            borderRadius: theme.radius.md,
            marginBottom: 14,
            ...theme.shadows.lg,
        },
        cover: {
            width: 130,
            height: 195,
            borderRadius: theme.radius.md,
        },
        cover_placeholder: {
            backgroundColor: theme.colors.bg.card,
            borderWidth: 1,
            borderColor: theme.colors.accent.tint,
            alignItems: 'center',
            justifyContent: 'center',
        },
        title: {
            textAlign: 'center',
            fontFamily: theme.fonts.playfair.bold,
            fontSize: theme.fontSizes.xl,
            lineHeight: theme.fontSizes.xl * 1.25,
            color: theme.colors.text.primary,
        },
        author: {
            textAlign: 'center',
            fontFamily: theme.fonts.dmSans.regular,
            fontSize: theme.fontSizes.base,
            color: theme.colors.text.secondary,
        },
        meta: {
            textAlign: 'center',
            fontFamily: theme.fonts.dmSans.regular,
            fontSize: theme.fontSizes.sm,
            color: theme.colors.text.label,
            marginTop: 2,
        },
        genre: {
            marginTop: 8,
            paddingHorizontal: 12,
            paddingVertical: 5,
            borderRadius: theme.radius.full,
            backgroundColor: theme.colors.accent.ghost,
        },
        genre_text: {
            fontFamily: theme.fonts.dmSans.medium,
            fontSize: theme.fontSizes.xs,
            color: theme.colors.accent.default,
        },
        section: {
            gap: 10,
        },
        overline: {
            fontFamily: theme.fonts.dmSans.medium,
            fontSize: theme.fontSizes.xs,
            letterSpacing: 1,
            textTransform: 'uppercase',
            color: theme.colors.text.label,
        },
        description: {
            fontFamily: theme.fonts.dmSans.regular,
            fontSize: theme.fontSizes.base,
            lineHeight: theme.fontSizes.base * 1.6,
            color: theme.colors.text.secondary,
        },
        description_empty: {
            fontFamily: theme.fonts.dmSans.regular,
            fontSize: theme.fontSizes.sm,
            color: theme.colors.text.hint,
        },
        more: {
            fontFamily: theme.fonts.dmSans.medium,
            fontSize: theme.fontSizes.sm,
            color: theme.colors.accent.default,
        },
    }), [theme])
}
