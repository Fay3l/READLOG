import { useTheme } from "@/constants/themecontext"
import { ActivityIndicator, Text, View } from "react-native";

// Version web de AnimateBook (Metro choisit ce fichier automatiquement sur le web).
// lottie-react-native a besoin de @lottiefiles/dotlottie-react + d'un fichier WASM sur le web :
// un simple indicateur suffit ici, l'animation reste sur iOS / Android.
export function AnimateBook() {
    const theme = useTheme()
    return (
        <View style={{ margin: 100, top: '30%', alignItems: 'center', gap: 16 }}>
            <Text style={{ color: theme.colors.text.primary, fontFamily: theme.fonts.dmSans.medium }}>Un petit instant ...</Text>
            <ActivityIndicator size="large" color={theme.colors.accent.default} />
        </View>
    )
}
