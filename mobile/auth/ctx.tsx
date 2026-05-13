import { use, createContext, type PropsWithChildren } from 'react';
import { router } from 'expo-router';
import axios, { HttpStatusCode } from 'axios'
import { useStorageState } from './useStorageState'

const API_URL = "http://192.168.1.155:8000"

const AuthContext = createContext<{
    signUp: (pw: string, user: string, email: string) => void;
    signOut: () => void;
    logIn: (pw: string, email: string) => void;
    session?: string | null;
    isLoading: boolean;
}>({
    signUp: () => null,
    signOut: () => null,
    logIn: () => null,
    session: null,
    isLoading: false,
});

// Use this hook to access the user info.
export function useSession() {
    const value = use(AuthContext);
    if (!value) {
        throw new Error('useSession must be wrapped in a <SessionProvider />');
    }

    return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
    const [[isLoading, session], setSession] = useStorageState('session');

    return (
        <AuthContext.Provider
            value={{
                signUp: (pw: string, name: string, email: string) => {
                    axios.post(API_URL + '/api/signup',
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
                    setSession(null);
                },
                logIn: (pw, email) => {
                    axios
                        .post(API_URL + '/api/login', {
                            username: email,
                            password: pw,
                        }, {
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            }
                        })
                        .then(function (response) {
                            if (HttpStatusCode.Accepted) {
                                console.log(response)
                                setSession('xx');
                            }
                        })
                },
                session,
                isLoading,
            }}>
            {children}
        </AuthContext.Provider>
    );
}
