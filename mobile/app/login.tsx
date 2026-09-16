import { useSession } from "@/auth/ctx";
import { Label } from "@/components/label";
import { useTheme } from "@/constants/themecontext";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Screen } from "@/components/screen";
import GoogleIcon from "@/assets/icon/google-icon.svg"
import AppleIcon from "@/assets/icon/apple-logo.svg"
import { SafeAreaView } from "react-native-safe-area-context";

export default function LogIn() {
    const { logIn: login } = useSession();
    const [password, setPassword] = React.useState('')
    const [email, setEmail] = React.useState('')
    const styles = useStyles()
    const theme = useTheme()
    const signUp = ()=>{
        router.push("/sign-up")
    }
    return (
        <Screen>
            <SafeAreaView style={styles.container}>
                <View style={{alignItems:'center',gap:3,marginBottom:15}}>
                    <Text style={{fontSize:theme.fontSizes["2xl"], color: theme.colors.text.primary, fontFamily: theme.fonts.playfair.regular}}>ReadLog</Text>
                    <Text style={{ color: theme.colors.text.secondary, fontSize: theme.fontSizes.sm }}>Tes lectures, ton histoire</Text>
                </View>
                <View style={{ gap: 4,marginBottom:13 }}>
                    <Text style={{ fontSize: theme.fontSizes.xl, color: theme.colors.text.primary, fontFamily: theme.fonts.playfair.regular }}>Connexion</Text>
                    <Text style={{ color: theme.colors.text.secondary, fontSize: theme.fontSizes.sm }}>Retrouve ta bibliothèque</Text>
                </View>
                <Label name='E-mail' value={email} setValue={setEmail}></Label>
                <Label name='Mot de passe' value={password} setValue={setPassword}></Label>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: theme.gradients.premium[0] }}>Mot de passe oublié ?</Text>
                </View>
                <View>
                    <TouchableOpacity style={styles.button_style} onPress={() => {
                        console.log(password, email)
                        login(password, email);
                        // Navigate after signing in. You may want to tweak this to ensure sign-in is successful before navigating.
                        router.replace("/(tabs)");
                    }}>
                        <Text style={styles.button_text}>
                            Se connecter
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, }}>
                    <View style={{ flex: 1, height: 1, backgroundColor:theme.colors.text.hint }} />
                    <View style={{ alignItems: 'stretch' }}>
                        <Text style={{ textAlign: 'center', color:theme.colors.text.hint }}>ou continuer avec</Text>
                    </View>
                    <View style={{ flex: 1, height: 1, backgroundColor:theme.colors.text.hint }} />
                </View>
                <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'center' }}>
                    <TouchableOpacity style={styles.button_secondary}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, justifyContent: 'center' }}>
                            <GoogleIcon width={20} height={20}></GoogleIcon>
                            <Text style={styles.button_secondary_text}>Google</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button_secondary}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, justifyContent: 'center' }}>
                            <AppleIcon width={20} height={20} fill={theme.colors.text.primary}></AppleIcon>
                            <Text style={styles.button_secondary_text}>Apple</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={{position:'absolute', bottom:'7%',left:'20%',right:'20%'}}>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ color: theme.colors.text.secondary, fontSize: theme.fontSizes.md }}>Pas de compte ? <Text onPress={signUp} style={{ color: theme.gradients.premium[0] }}>S'inscrire</Text></Text>
                    </View>
                </View>
            </SafeAreaView>
        </Screen>
    );
}

function useStyles() {
    const theme = useTheme()
    return useMemo(() => StyleSheet.create({
        label: {
            padding: 5,
            borderColor: theme.colors.border.focus,
        },
        container: {
            flex: 1,
            margin: 20,
            gap: 15,
            backgroundColor: theme.colors.bg.primary
        },
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
        apple_icon: {
            color: theme.colors.text.primary
        },
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
            color: theme.colors.text.hint
        }
    }), [theme])
}