import { useTheme } from "@/constants/themecontext"
import { useMemo } from "react"
import { StyleSheet, TouchableOpacity, View, Text } from "react-native"

interface ButtonPrimaryProps{
    title:string,
    onPress: ()=> void | undefined,
    style: {} | null
}

export function ButtonPrimary({title,onPress,style}:ButtonPrimaryProps) {
    const styles = useStyles()
    return (
        <View style={style}>
            <TouchableOpacity style={styles.button_style} onPress={onPress}>
                <Text style={styles.button_text}>
                    {title}
                </Text>
            </TouchableOpacity>
        </View>
    )
}

function useStyles() {
    const theme = useTheme()
    return useMemo(() => StyleSheet.create({
        button_style: {
            backgroundColor: theme.gradients.premium[0],
            paddingHorizontal: 80,
            paddingVertical: 20,
            borderRadius: 20,
        },
        button_text: {
            textAlign: 'center',
            fontFamily: theme.fonts.dmSans.regular,
            fontWeight: "bold",
            fontSize: theme.fontSizes.md,
            color: theme.colors.bg.primary
        },
    }), [theme])
}