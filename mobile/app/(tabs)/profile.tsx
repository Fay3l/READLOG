import { Theme } from "@/constants/theme";
import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
    return (<SafeAreaView>
        <Text>Mon compte</Text>

    </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    primary_text: {
        color: Theme.colors.text.primary,
        fontFamily: Theme.fonts.playfair.regular,
    },
    secondary_text: {
        color: Theme.colors.text.secondary,
        fontFamily: Theme.fonts.playfair.regular,
    }
})