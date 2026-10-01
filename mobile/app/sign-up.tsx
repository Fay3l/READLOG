import { router } from 'expo-router';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useSession } from '@/auth/ctx';
import React from 'react';
import { Label } from '@/components/label';
import { ButtonPrimary } from '@/components/buttons/buttonprimary';
import { Screen } from '@/components/screen';
import { useTheme } from '@/constants/themecontext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StepDots } from '@/components/stepdots';
import { useToast } from '@/components/toast/toast_context';

export default function SignUp() {
    const { signUp: signup } = useSession();
    const [name, setName] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [email, setEmail] = React.useState('')
    const theme = useTheme()
    const {show} = useToast()
    const logIn = () => {
        router.push('/login')
    }
    return (
        <Screen>
            <SafeAreaView style={{ flex: 1, margin: 20, gap: 15 }}>
                <View>
                    <StepDots current={0} total={3}></StepDots>
                </View>
                <View style={{ gap: 5 }}>
                    <Text style={{ fontSize: theme.fontSizes.xl, color: theme.colors.text.primary, fontFamily: theme.fonts.playfair.regular }}>Crée ton compte</Text>
                    <Text style={{ color: theme.colors.text.secondary, fontSize: theme.fontSizes.sm }}>Etape 1 sur 3 - Tes infos</Text>
                </View>
                <Label name='Nom' value={name} setValue={setName}></Label>
                <Label name='E-mail' value={email} setValue={setEmail}></Label>
                <Label name='Mot de passe' value={password} setValue={setPassword}></Label>
                <ButtonPrimary style={{ marginTop: 15 }} title='Continuer →' onPress={() => {
                    void (async () => {
                        console.log(name, password, email)
                        const response = await signup(password, name, email);
                        if (response) {
                            show(`Compte Inscrit Code:${response}`, 'success')
                            router.push({
                                pathname: '/verify-email',
                                params: { email: email },
                            })
                        }
                        // Navigate after signing in. You may want to tweak this to ensure sign-in is successful before navigating.
                    })();
                }}></ButtonPrimary>
                <View style={{ position: 'absolute', bottom: '7%', left: '20%', right: '20%' }}>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ color: theme.colors.text.secondary, fontSize: theme.fontSizes.md }}>Déjà inscrit ? <Text onPress={logIn} style={{ color: theme.gradients.premium[0] }}>Se connecter</Text></Text>
                    </View>
                </View>
            </SafeAreaView>
        </Screen>

    );
}
