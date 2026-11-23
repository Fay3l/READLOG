import { use, createContext, useCallback, useEffect, type PropsWithChildren } from 'react';
import { router } from 'expo-router';
import { useStorageState } from './useStorageState'
import api from '@/lib/api';
import { apiErrorMessage } from '@/lib/errors';
import { useUserStore } from '@/types/users';
import { getUser } from '@/fetch/users';
import { get_userbooks } from '@/fetch/books';
import { useUserBookStore } from '@/types/books';

// Résultat d'une action : ok, ou un message d'erreur prêt à afficher
export type AuthResult = { ok: true } | { ok: false; message: string };

type AuthContextType = {
    signUp: (pw: string, name: string, email: string) => Promise<AuthResult>;
    signOut: () => void;
    logIn: (pw: string, email: string) => Promise<void>;
    verifyEmail: (code: string, email: string) => Promise<AuthResult>;
    resendCode: (email: string) => Promise<AuthResult>;
    setSession: (s: string | null) => void;
    session?: string | null;
    isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
    signUp: () => Promise.resolve({ ok: true }),
    signOut: () => null,
    logIn: () => Promise.resolve(),
    verifyEmail: () => Promise.resolve({ ok: true }),
    resendCode: () => Promise.resolve({ ok: true }),
    setSession: () => null,
    session: null,
    isLoading: false,
});

export function useSession() {
    const value = use(AuthContext);
    if (!value) {
        throw new Error('useSession must be wrapped in a <SessionProvider />');
    }
    return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
    const [[isLoading, session], setSession] = useStorageState('session');
    const [, setToken] = useStorageState('token');
    const { setUser } = useUserStore();
    const { setUserBooks } = useUserBookStore();

    const signOut = useCallback(() => {
        setToken(null);
        setSession(null);
        setUser(null);
        setUserBooks(null);
        router.replace('/login');
    }, [setToken, setSession, setUser, setUserBooks]);

    // ✅ Jeton expiré ou invalide pendant l'utilisation → déconnexion automatique.
    // (remplace lib/exceptionapi.ts, qui appelait un hook hors d'un composant et n'était jamais chargé)
    useEffect(() => {
        const id = api.interceptors.response.use(
            (res) => res,
            (err) => {
                const url: string = err.config?.url ?? '';
                // un 401 sur /login veut dire "mauvais mot de passe", pas "session expirée"
                if (err.response?.status === 401 && session && !url.includes('/login')) signOut();
                return Promise.reject(err);
            }
        );
        return () => api.interceptors.response.eject(id);
    }, [session, signOut]);

    const openSession = (token: string) => {
        setToken(token);
        setSession('active');
    };

    return (
        <AuthContext.Provider
            value={{
                signUp: async (pw, name, email) => {
                    try {
                        // ✅ le code de vérification n'est plus renvoyé : il arrive par e-mail
                        await api.post('/signup', { name, password: pw, email });
                        return { ok: true };
                    } catch (err) {
                        return { ok: false, message: apiErrorMessage(err, "Inscription impossible") };
                    }
                },
                signOut,
                logIn: async (pw, email) => {
                    try {
                        // OAuth2 attend un formulaire "username=...&password=...", pas du JSON
                        const formData = new URLSearchParams();
                        formData.append('username', email);
                        formData.append('password', pw);
                        formData.append('grant_type', 'password');
                        const res = await api.post('/login', formData.toString(),
                            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
                        openSession(res.data.access_token);
                        setUser(await getUser());
                        setUserBooks(await get_userbooks());
                        router.replace('/(tabs)');
                    } catch (err) {
                        setSession(null);
                        throw apiErrorMessage(err, 'Connexion impossible');
                    }
                },
                verifyEmail: async (code, email) => {
                    try {
                        // ✅ "params" encode correctement l'e-mail dans l'URL (un "+" ou un "&" cassait la requête)
                        const res = await api.post('/verify-email', null, { params: { email, code } });
                        openSession(res.data.access_token);
                        router.push('/goals');
                        return { ok: true };
                    } catch (err) {
                        // ✅ avant, l'erreur était avalée ici et l'écran affichait "Email vérifié" quand même
                        return { ok: false, message: apiErrorMessage(err, 'Code incorrect ou expiré') };
                    }
                },
                resendCode: async (email) => {
                    try {
                        // ✅ avant : '/api/resend-code' alors que baseURL contient déjà /api → /api/api/... (404)
                        await api.post('/resend-code', null, { params: { email } });
                        return { ok: true };
                    } catch (err) {
                        return { ok: false, message: apiErrorMessage(err, "Impossible d'envoyer le code") };
                    }
                },
                setSession,
                session,
                isLoading,
            }}>
            {children}
        </AuthContext.Provider>
    );
}
