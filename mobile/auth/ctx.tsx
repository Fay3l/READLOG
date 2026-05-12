import { use, createContext, type PropsWithChildren } from 'react';
import axios, { HttpStatusCode } from 'axios'
import { useStorageState } from './useStorageState'

const API_URL = "http://localhost:8000"

const AuthContext = createContext<{
    signIn: (pw: string, user: string, email: string) => void;
    signOut: () => void;
    session?: string | null;
    isLoading: boolean;
}>({
    signIn: () => null,
    signOut: () => null,
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
                signIn: (pw: string, name: string, email: string) => {
                    axios.post(API_URL + '/api/signup',
                        {
                            name,
                            password: pw,
                            email
                        },
                        {
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            }
                        }
                    )
                        .then(function (response) {
                            if (HttpStatusCode.Accepted) {
                                setSession(response.data);
                            }
                        })
                    
                },
                signOut: () => {
                    setSession(null);
                },
                session,
                isLoading,
            }}>
            {children}
        </AuthContext.Provider>
    );
}
