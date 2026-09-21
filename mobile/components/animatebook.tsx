import { useTheme } from "@/constants/themecontext"
import { Text, View } from "react-native";
import LottieView from 'lottie-react-native';

export function AnimateBook() {

    const theme = useTheme()

    return (
        <View style={{ margin: 100, top: '30%', alignItems: 'center',gap:10 }} >

            <Text style={{ color: theme.colors.text.primary, fontFamily: theme.fonts.dmSans.medium, fontWeight: "bold" }}>Juste un petit instant ...</Text>
            <LottieView
                source={require('@/assets/animations/book.json')} // ← besoin du JSON, pas du SVG
                autoPlay
                loop
                style={{ width: 250, height: 250 }}
            />
        </View>
    )
}