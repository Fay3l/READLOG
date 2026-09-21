import { useTheme } from "@/constants/themecontext"
import { useMemo } from "react"
import { StyleSheet, TouchableOpacity, View, Text } from "react-native"


interface ButtonSecondaryProps{
    title:string,
    onPress: ()=> void | undefined
}

export function ButtonSecondary({onPress,title}:ButtonSecondaryProps) {
    const styles = useStyles()
    return (
        <View>
            <TouchableOpacity style={styles.button_secondary} onPress={onPress}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={styles.button_secondary_text}>{title}</Text>
                </View>
            </TouchableOpacity>
        </View>

    )
}

function useStyles() {
    const theme = useTheme()
    return useMemo(() => StyleSheet.create({
        button_secondary: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 3,
            borderRadius: 8,
            borderWidth: 1,
            backgroundColor: theme.colors.bg.banner,
            borderColor: theme.gradients.banner[1],
            paddingVertical: 15
        },
        button_secondary_text: {
            textAlign: 'center',
            color: theme.colors.text.secondary
        }
    }), [theme])
}