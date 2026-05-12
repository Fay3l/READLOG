import { router } from 'expo-router';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useSession } from '@/auth/ctx';
import React from 'react';
import { Theme } from '@/constants/theme';

export default function SignIn() {
    const { signIn } = useSession();
    const [name, setName] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [email, setEmail] = React.useState('')
    return (
        <View style={{ flex: 1, justifyContent: 'center', margin: 20, gap: 10 }}>
            <TextInput onChangeText={setName} value={name} style={styles.text_input}></TextInput>
            <TextInput onChangeText={setPassword} value={password} style={styles.text_input}></TextInput>
            <TextInput onChangeText={setEmail} value={email} style={styles.text_input}></TextInput>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Text> "name:"+{name}+" password:"+{password}+" email:"+{email}</Text>
            </View>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Text
                    onPress={() => {
                        signIn(password, name, email);
                        // Navigate after signing in. You may want to tweak this to ensure sign-in is successful before navigating.
                        // router.replace("(tabs)");
                    }}>
                    Sign In
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    text_input: {
        borderColor: 'black',
        borderWidth: 0.7,
        borderRadius: Theme.radius.lg,
        padding: 5
    },
})