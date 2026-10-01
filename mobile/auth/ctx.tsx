import { use, createContext, type PropsWithChildren } from 'react';
import { router } from 'expo-router';
import axios, { HttpStatusCode } from 'axios'
import { useStorageState } from './useStorageState'
import api from '@/lib/api';
import * as SecureStore from 'expo-secure-store';
import { useUserStore } from '@/types/users';
import { getUser } from '@/fetch/users';
import { get_books } from '@/fetch/books';
import { useUserBookStore } from '@/types/books';


const AuthContext = createContext<{
    signUp: (pw: string, user: string, email: string) => Promise<string | null>;
    signOut: () => void;
    logIn: (pw: string, email: string) => void;
    verifyemail: (code: string, email: string) => void;
    setSession: (s: string | null) => void;
    session?: string | null;
    isLoading: boolean;
    token?: string | null;
}>({
    signUp: () => Promise.resolve(null),
    signOut: () => null,
    logIn: () => null,
    setSession: () => null,
    verifyemail: () => null,
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


export function SessionProvider({ children }: PropsWithChildren) {
    const [[isLoading, session], setSession] = useStorageState('session');
    const [[, token], setToken] = useStorageState('token');
    const { setUser } = useUserStore();
    const { setUserBooks } = useUserBookStore();
    return (
        <AuthContext.Provider
            value={{
                signUp: async (pw: string, name: string, email: string) => {
                    try {
                        const res = await api.post('/signup',
                            {
                                name: name,
                                password: pw,
                                email: email
                            }
                        )
                        if(!res.data.code)return null;
                        return res.data.code ?? "Compte inscrit"
                    }
                    catch{
                        return null
                    }
                    
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
                            const user = await getUser()
                            setUser(user)
                            const books = await get_books()
                            setUserBooks(books)
                            router.replace('/(tabs)');
                        }
                    } catch (err: any) {
                        setSession(null)
                        throw err.response?.data?.detail
                    }
                },
                verifyemail: async (code, email) => {
                    try {
                        console.log(code)
                        const res = await api.post(`/verify-email/?email=${email}&code=${code}`);
                        if (res.data.access_token) {
                            setToken(res.data.access_token)
                            setSession('xx')

                            router.push('/goals');
                        }

                    } catch (err: any) {
                        console.log(err)
                    }
                },
                setSession: (s) => {
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

