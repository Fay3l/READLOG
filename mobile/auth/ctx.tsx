import { use, createContext, type PropsWithChildren } from 'react';
import { router } from 'expo-router';
import axios, { HttpStatusCode } from 'axios'
import { useStorageState } from './useStorageState'
import api from '@/lib/api';
import * as SecureStore from 'expo-secure-store';




const API_URL = "http://192.168.1.155:8000"

const AuthContext = createContext<{
    signUp: (pw: string, user: string, email: string) => void;
    signOut: () => void;
    logIn: (pw: string, email: string) => void;
    session?: string | null;
    isLoading: boolean;
    token?: string | null;
}>({
    signUp: () => null,
    signOut: () => null,
    logIn: () => null,
    session: null,
    isLoading: false,
    token: null,
});

// Use this hook to access the user info.
export function useSession() {
    const value = use(AuthContext);
    if (!value) {
        throw new Error('useSession must be wrapped in a <SessionProvider />');
    }

    return value;
}

let globalSignOut: (() => void) | null = null;

export function SessionProvider({ children }: PropsWithChildren) {
    const [[isLoading, session], setSession] = useStorageState('session');
    const [[, token], setToken] = useStorageState('token');

    const signOut = () => {
    setToken(null);
    setSession(null);
    };
    globalSignOut = signOut;
    return (
        <AuthContext.Provider
            value={{
                signUp: (pw: string, name: string, email: string) => {
                    api.post('/api/signup',
                        {
                            name: name,
                            password: pw,
                            email: email
                        }
                    )
                        .then((response) => {
                            if (response.status == 200) {
                                router.push('/login')
                            }

                        })

                },
                signOut: () => {
                    setToken(null);
                    setSession(null);
                    router.replace('/login');
                },
                logIn: async (pw, email) => {
                    try {
                        const formData = new URLSearchParams();
                        formData.append('username', email);
                        formData.append('password', pw);
                        formData.append('grant_type', 'password');

                        const res = await api.post(
                            '/api/login',
                            formData.toString(), // ← string encodée "username=...&password=..."
                            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
                        );
                        if (res.status === HttpStatusCode.Ok && res.data.access_token ) {
                            const token = res.data.access_token; // ← string propre sans guillemets
                            setToken(token);
                            setSession('xx');
                            router.replace('/(tabs)');
                        }
                        else{
                            signOut()
                        }
                    } catch (err: any) {
                        setSession(null)
                        console.error('STATUS :', err.response?.status);
                        console.error('DETAIL :', err.response?.data?.detail);
                    }
                },
                session,
                isLoading,
                token,
            }}>
            {children}
        </AuthContext.Provider>
    );
}

export function triggerSignOut() {
  globalSignOut?.();
}