import { use, createContext, type PropsWithChildren } from 'react';
import { router } from 'expo-router';
import axios, { HttpStatusCode } from 'axios'
import { useStorageState } from './useStorageState'
import api from '@/lib/api';
import * as SecureStore from 'expo-secure-store';
import { useToast } from '@/components/toast/toast_context';






const AuthContext = createContext<{
    signUp: (pw: string, user: string, email: string) => void;
    signOut: () => void;
    logIn: (pw: string, email: string) => void;
    setSession:(s:string | null)=>void;
    session?: string | null;
    isLoading: boolean;
    token?: string | null;
}>({
    signUp: () => null,
    signOut: () => null,
    logIn: () => null,
    setSession: () => null,
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

export async function SignOut() {
    const [, setSession] = useStorageState('session');
    await SecureStore.deleteItemAsync("token");
    setSession(null);
}

export function SetSessionNull(){
    const [, setSession] = useStorageState('session');
    setSession(null);
}

export function SessionProvider({ children }: PropsWithChildren) {
    const [[isLoading, session], setSession] = useStorageState('session');
    const [[, token], setToken] = useStorageState('token');
    const { show } = useToast();
    
    return (
        <AuthContext.Provider
            value={{
                signUp: (pw: string, name: string, email: string) => {
                    api.post('/signup',
                        {
                            name: name,
                            password: pw,
                            email: email
                        }
                    )
                        .then((response) => {
                            if (response.status == 200) {
                                console.log(response.data)
                                show(response.data.code, 'success')
                                router.push({
                                    pathname: '/verify-email',
                                    params: { email: email },
                                })
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
                            '/login',
                            formData.toString(), // ← string encodée "username=...&password=..."
                            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
                        );
                        if (res.status === HttpStatusCode.Ok && res.data.access_token) {
                            const token = res.data.access_token; // ← string propre sans guillemets
                            setToken(token);
                            setSession('xx');
                            router.replace('/(tabs)');
                        }
                    } catch (err: any) {
                        setSession(null)
                        console.error('STATUS :', err.response?.status);
                        console.error('DETAIL :', err.response?.data?.detail);
                    }
                },
                setSession:(s) => {
                    setSession(s)
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

