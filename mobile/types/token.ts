export type Token = {
    access_token: string;
    token_type: string;
}

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

type SessionStore = {
  session: string | null;
  setSession: (session: string | null) => void;
  signOut: () => Promise<void>;
};

export const useSessionStore = create<SessionStore>((set) => ({
  session: null,
  setSession: (session) => set({ session }),
  signOut: async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('session');
    set({ session: null });
  },
}));