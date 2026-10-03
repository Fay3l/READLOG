import { Screen } from "@/components/screen";
import { useTheme } from "@/constants/themecontext";
import { toBookResult, useBookStore } from "@/types/books";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import OpenBook from "@/assets/icon/open-book.svg"
import { add_userbook, remove_userbook } from "@/fetch/books";
import { useToast } from "@/components/toast/toast_context";

export default function BookDetail() {
    const theme = useTheme()
    const storedBook = useBookStore(s => s.book);
    const book = storedBook;
    const { page } = useLocalSearchParams<{ page: string }>();
    const styles = useStyles()
    const {show} = useToast()
    if (!book) {
        return null;
    }

    const navigate = () => {
        const target = page as Parameters<typeof router.replace>[0];
        router.replace(target)
    }
    const addBook= async()=>{
        const rbook = toBookResult(book)
        const res = await add_userbook(rbook)
        if(res){
            show('Livre ajouté','success')
            router.replace('/(tabs)')
        }
        else show('Livre pas ajouté','error')
        
    }
    const removeBook = async()=>{
        if(!book.id){
            console.log(book.id)
            show('Veuillez réessayez','error')
            return
        }
        const res = await remove_userbook(book.id)
        if(res){
            show('Livre supprimé','success')
            router.replace('/(tabs)')
        }
        else show('Livre pas supprimé','error')
    }
    return (
        <Screen>
            <SafeAreaView style={{ flex: 1, margin: 20 }}>
                <ScrollView style={{ marginBottom: 20 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                        <View>
                            <TouchableOpacity style={styles.button_back} onPress={navigate}>
                                <Text style={styles.button_text_back}>Retour</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ alignItems: 'center', gap: 10, marginTop: 20, justifyContent: 'center' }}>
                        {book.cover_url ?
                            <Image width={100} height={150} source={{ uri: book.cover_url }} ></Image>
                            :
                            <View>
                                <OpenBook width={150} height={150} />
                            </View>
                        }
                        <Text style={{ fontFamily: theme.fonts.playfair.bold, color: theme.colors.text.secondary }}>{book.title}</Text>
                        <Text style={{ fontFamily: theme.fonts.playfair.bold, color: theme.colors.text.secondary }}>{book.author}</Text>
                        <Text style={{ textAlign: 'center', fontFamily: theme.fonts.playfair.regular, color: theme.colors.text.primary }}>{book.publisher}</Text>
                        <Text style={{ textAlign: 'center', fontFamily: theme.fonts.playfair.bold, color: theme.colors.text.hint }}>{book.published_year}</Text>
                        <Text style={{ textAlign: 'center', fontFamily: theme.fonts.playfair.regular, color: theme.colors.text.label }}>Page: {book.page_count}</Text>
                    </View>
                    <View style={{ margin: 10 }}>
                        {book.description ?
                            <Text style={{ textAlign: 'center', fontFamily: theme.fonts.playfair.regular, color: theme.colors.text.muted }}>{book.description}</Text>
                            :
                            <Text style={{ textAlign: 'center', fontFamily: theme.fonts.playfair.regular, color: theme.colors.text.primary }}>Pas de description</Text>
                        }
                    </View>
                    <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 30 }}>
                        {
                            book.id ?
                                <View>
                                    <TouchableOpacity onPress={removeBook}>
                                        <Text style={{ color: theme.colors.status.abandoned }}>Supprimer de la bibliothèque</Text>
                                    </TouchableOpacity>
                                </View>
                                :
                                <View>
                                    <TouchableOpacity onPress={addBook}>
                                        <Text style={{ color: theme.colors.status.finished }}>Ajouter à la bibliothèque</Text>
                                    </TouchableOpacity>
                                </View>
                        }
                    </View>
                </ScrollView>
            </SafeAreaView>
        </Screen>
    )
}

function useStyles() {
    const theme = useTheme()
    return useMemo(() => StyleSheet.create({
        button_back: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 10,
            gap: 3,
            borderRadius: 8,
            borderWidth: 1,
            backgroundColor: theme.colors.bg.banner,
            borderColor: theme.gradients.banner[1],
            paddingVertical: 15
        },
        button_text_back: {
            textAlign: 'center',
            color: theme.colors.text.secondary
        }
    }), [theme])
}