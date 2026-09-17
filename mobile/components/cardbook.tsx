import { useTheme } from "@/constants/themecontext";
import { useMemo } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import * as Progress from 'react-native-progress'
import OpenBook from "@/assets/icon/open-book.svg"
import { TagStatus } from "./tagstatus";
import { GetUserBook } from "@/types/users";


interface CardBookProps{
    book: GetUserBook
}

export function CardBook(book:CardBookProps) {
    const theme = useTheme()
    const styles = useStyles()
    return (
        <View style={styles.card}>
            <TouchableOpacity>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                    <View style={styles.card_book}>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <OpenBook width={25} height={25} />
                        </View>
                    </View>
                    <View style={{ flex: 10, gap: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <View style={{ gap: 3 }}>
                                        <Text style={styles.title_text}>L'étranger</Text>
                                        <Text style={styles.author_text}>Albert Camus</Text>
                                        <Text style={styles.category_text}>Philosophie</Text>
                                    </View>
                                    <View>
                                        <TagStatus/>
                                    </View>
                                </View>
                            </View>

                        </View>

                        <View>
                            <Progress.Bar width={null} progress={0.36} color={theme.gradients.progressBar[0]} />
                        </View>
                    </View>
                    <View >
                        <Text> {'>'} </Text>
                    </View>
                </View>

            </TouchableOpacity>
        </View>
    )
}

function useStyles() {
    const theme = useTheme()
    return useMemo(() => StyleSheet.create({
        card: {
            backgroundColor: theme.colors.bg.card,
            borderRadius: theme.radius.lg,
            borderWidth: 1,
            borderColor: theme.colors.accent.ghost,
            paddingHorizontal: 10,
            paddingVertical:20
        },
        card_book: {
            flex: 2.5,
            backgroundColor: theme.colors.status.finished,
            opacity:0.85,
            borderRadius: theme.radius.lg,
            height: '100%',
        },
        title_text:{
            fontFamily: theme.fonts.playfair.bold,
            fontSize:theme.fontSizes.lg,
            color:theme.colors.text.primary
        },
        author_text:{
            fontFamily: theme.fonts.dmSans.regular,
            fontSize:theme.fontSizes.md,
            color:theme.colors.text.hint
        },
        category_text:{
            fontFamily: theme.fonts.dmSans.regular,
            fontSize:theme.fontSizes.sm,
            color:theme.colors.text.muted
        }
    }), [theme])
}