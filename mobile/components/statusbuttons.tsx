import { useTheme } from "@/constants/themecontext"
import { useMemo, useState } from "react"
import { StyleSheet, View, Text, TouchableOpacity } from "react-native"

interface StatusButtonProps {
    focus: string;
    onPress: ()=> void;
}

export function StatusButton() {
    const status = ["all","reading","finished","to_read"]
    const [state,setState] = useState("all")
    const theme = useTheme()
    const styles = useStyles()
    return (
        <View style={{ flexDirection: 'row', gap: 5 }}>
            <View>
                <TouchableOpacity style={[styles.button, { backgroundColor: state == "all" ? theme.colors.accent.default: theme.colors.bg.banner }]} onPress={()=>setState(status[0])}>
                    <Text style={styles.button_text}>Tous</Text>
                </TouchableOpacity>
            </View>
            <View >
                <TouchableOpacity style={[styles.button, { backgroundColor: state === "reading" ? theme.gradients.premium[0] : theme.colors.bg.banner }]} onPress={()=>setState(status[1])}>
                    <Text style={styles.button_text}>En cours</Text>
                </TouchableOpacity>
            </View>
            <View >
                <TouchableOpacity style={[styles.button, { backgroundColor: state === "finished" ? theme.gradients.premium[0] : theme.colors.bg.banner }]} onPress={()=>setState(status[2])}>
                    <Text style={styles.button_text}>Terminé</Text>
                </TouchableOpacity>
            </View>
            <View >
                <TouchableOpacity style={[styles.button, { backgroundColor: state === "to_read" ? theme.gradients.premium[0] : theme.colors.bg.banner }]} onPress={()=>setState(status[3])}>
                    <Text style={styles.button_text}>A lire</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

function useStyles() {
    const theme = useTheme()
    return useMemo(() => StyleSheet.create({
        button: {
            padding: 10,
            borderRadius: theme.radius.full,
        },
        button_text: {
            fontFamily: theme.fonts.dmSans.medium,
            fontSize: theme.fontSizes.sm,
            color: theme.colors.text.primary,
            textAlign: 'center'
        },
    }), [theme])
}