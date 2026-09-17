import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AppTheme } from "@/constants/theme";
import { useMemo } from "react";
import { router } from "expo-router";
import { useTheme } from "@/constants/themecontext";
import Book from "@/assets/icon/book.svg"
import { useBookStore } from "@/types/books";

export default function BookResult() {
    const theme = useTheme()
    const styles = useStyles(theme)
    const book = useBookStore((s) => s.scannedBook)
    if (!book) { router.back(); return null; }
    console.log("3 - BOOK RESULT :", book);
    const index = () => {
        router.push('/(tabs)')
    }
    const camera = () => {
        router.push('/camera')
    }
    return (
        <View style={styles.container}>
            <Text style={styles.text} >It is the correct book ?</Text>
            <Text style={styles.text} >{book.author}</Text>
            <Text style={styles.text} >{book?.title}</Text>
            {book.cover_url ?
                <Image width={110} height={165} source={{ uri: book.cover_url }}></Image>
            :
                <Book width={70} height={125}/>
            }
            
            <View style={styles.container_buttons} >
                <TouchableOpacity style={styles.button} onPress={camera}>
                    <Text style={styles.text}>Retry</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={index}>
                    <Text style={styles.text}>Valid</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

function useStyles(theme: AppTheme) {
    return useMemo(() => StyleSheet.create({
        text: {
            fontFamily: theme.fonts.playfair.regular,
            fontSize: theme.fontSizes.md
        },
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            gap:15
        },
        button: {
            backgroundColor: theme.colors.bg.banner,
            padding: 10,
            margin: 10,
            borderRadius: theme.radius.lg,
        },
        button_text: {
            fontFamily: theme.fonts.playfair.regular,
            fontSize: theme.fontSizes.md,
            color: theme.colors.text.secondary,
        },
        container_buttons: {
            flexDirection: "row",
            alignItems: "center",
            gap: 10
        }
    }), [theme])
}