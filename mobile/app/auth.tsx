import { Theme } from "@/constants/theme";
import { router } from "expo-router";
import { View,Text } from "react-native";

export default function Auth() {
    const signup = () => {
        router.push('/sign-up')
    }
    const login = () => {
        router.push('/login')
    }
    return (
        <View>
            <View style={[{ padding: 15, margin: 20, borderWidth: 0.3, borderColor: 'black', borderRadius: Theme.radius.lg }]}>
                <Text
                    onPress={() => { login() }}
                >Se connecter</Text>
            </View>
            <View style={[{ padding: 15, margin: 20, borderWidth: 0.3, borderColor: 'black', borderRadius: Theme.radius.lg }]}>
                <Text
                    onPress={() => { signup() }}
                >S'inscrire</Text>
            </View>
        </View>
    )
}