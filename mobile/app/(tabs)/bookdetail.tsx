import { Screen } from "@/components/screen";
import { useTheme } from "@/constants/themecontext";
import { useBookStore } from "@/types/books";
import { router } from "expo-router";
import { useMemo } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import OpenBook from "@/assets/icon/open-book.svg"
import { ButtonSecondary } from "@/components/buttons/buttonsecondary";

export default function BookDetail() {
    const theme = useTheme()
    const book = useBookStore(s => s.book);

    if (!book) {
        return null;
    }

    return (
        <Screen>
            <SafeAreaView style={{ flex: 1, margin: 20 }}>
                <View style={{flexDirection:'row',}}>
                  <ButtonSecondary title='Retour' onPress={()=>router.push('/(tabs)')}></ButtonSecondary>  
                </View>
                <View style={{ alignItems: 'center', gap:10, marginTop:20 }}>
                    {book.cover_url ?
                        <Image width={100} height={150} source={{ uri: book.cover_url }} ></Image>
                        :
                        <View>
                            <OpenBook width={150} height={150} />
                        </View>
                    }
                    <Text style={{ fontFamily: theme.fonts.playfair.bold, color: theme.colors.text.secondary }}>{book.title}</Text>
                    <Text style={{ fontFamily: theme.fonts.playfair.bold, color: theme.colors.text.secondary }}>{book.author}</Text>
                </View>
                <View style={{margin:10}}>
                    <Text style={{textAlign:'center',fontFamily: theme.fonts.playfair.regular, color: theme.colors.text.muted}}>{book.description}</Text>
                </View>
            </SafeAreaView>
        </Screen>
    )
}

function useStyles() {
    const theme = useTheme()
    return useMemo(() => StyleSheet.create({

    }), [theme])
}