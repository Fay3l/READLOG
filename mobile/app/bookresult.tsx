import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AppTheme } from "@/constants/theme";
import { useMemo } from "react";
import { router } from "expo-router";
import { useTheme } from "@/constants/themecontext";
import Book from "@/assets/icon/book.svg"
import { useBookResultStore } from "@/types/books";
import { Screen } from "@/components/screen";
import { add_userbook } from "@/fetch/books";
import { useToast } from "@/components/toast/toast_context";

export default function BookResult() {
    const theme = useTheme()
    const styles = useStyles(theme)
    const {show} = useToast()
    const book = useBookResultStore((s) => s.scannedBook)
    if (!book) { router.back(); return null; }
    const addBook = async() => {
        try{
            await add_userbook(book)
            show("Livre ajouté","success")
            router.push('/(tabs)')
        }
        catch(err: any){
            show(`Erreur: ${err}`,'error')
        }
        
    }
    const camera = () => {
        router.push('/camera')
    }
    return (
        <Screen>
            <View style={styles.container}>
                <Text style={styles.text} >Est-ce que ce livre est bien ?</Text>
                <Text style={styles.text} >{book.author}</Text>
                <Text style={styles.text} >{book?.title}</Text>
                {book.cover_url ?
                    <Image width={110} height={165} source={{ uri: book.cover_url }}></Image>
                    :
                    <Book width={70} height={125} />
                }

                <View style={styles.container_buttons} >
                    <TouchableOpacity style={styles.button} onPress={camera}>
                        <Text style={styles.text}>Recommencer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={addBook}>
                        <Text style={styles.text}>Valider</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Screen>
    )
}

function useStyles(theme: AppTheme) {
    return useMemo(() => StyleSheet.create({
        text: {
            fontFamily: theme.fonts.playfair.regular,
            fontSize: theme.fontSizes.md,
            color: theme.colors.text.primary
        },
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 15
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