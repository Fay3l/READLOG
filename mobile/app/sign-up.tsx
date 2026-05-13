import { router } from 'expo-router';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useSession } from '@/auth/ctx';
import React from 'react';
import { Theme } from '@/constants/theme';
import { Label } from '@/components/label';

export default function SignUp() {
    const { signUp: signup } = useSession();
    const [name, setName] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [email, setEmail] = React.useState('')
    return (
        <View style={{ flex: 1, justifyContent: 'center', margin: 20, gap: 10 }}>
            <Label name='name' value={name} setValue={setName}></Label>
            <Label name='password' value={password} setValue={setPassword}></Label>
            <Label name='email' value={email} setValue={setEmail}></Label>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Text> "name:"{name}" password:"{password}" email:"{email}"</Text>
            </View>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Text
                    onPress={() => {
                        console.log(name,password,email)
                        signup(password, name, email);
                        // Navigate after signing in. You may want to tweak this to ensure sign-in is successful before navigating.
                        router.replace("/(tabs)");
                    }}>
                    Sign Up
                </Text>
            </View>
        </View>
    );
}
