import { useSession } from "@/auth/ctx";
import { Label } from "@/components/label";
import { router } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

export default function LogIn() {
    const { logIn: login } = useSession();
    const [password, setPassword] = React.useState('')
    const [email, setEmail] = React.useState('')
    return (
        <View style={{ flex: 1, justifyContent: 'center', margin: 20, gap: 10 }}>
            <Label name='password' value={password} setValue={setPassword}></Label>
            <Label name='email' value={email} setValue={setEmail}></Label>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Text>"password:"{password}" email:"{email}"</Text>
            </View>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Text
                    onPress={() => {
                        console.log(password, email)
                        login(password, email);
                        // Navigate after signing in. You may want to tweak this to ensure sign-in is successful before navigating.
                        router.replace("/(tabs)");
                    }}>
                    Sign Up
                </Text>
            </View>
        </View>
    );
}

