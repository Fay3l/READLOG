import { create } from 'zustand';
import { GetQuote } from './quotes';
import { GetReadingNote } from './reading_notes';
import { GetReadingReminder } from './reading_reminders';



type GetUserBook = {
    id: string;
    started_at: string;
    finished_at: string;
    status: string;
    cover_url:string;
    personal_note: string;
    rating: number;
    current_page: number;
    updated_at:string ;
    created_at: string;
    user_id: string;
    book_id: string;
    quotes: GetQuote[]
    reading_notes: GetReadingNote[]
}

export type GetUser = {
    name: string;
    email: string;
    avatar_url: string | null;
    reading_goal: number;
    userbooks: GetUserBook[];
    readingreminders: GetReadingReminder[];
};

type UserStore = {
  user:      GetUser | null;
  isLoading: boolean;
  setUser:   (user: GetUser) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserStore>((set) => ({
  user:      null,
  isLoading: false,
  setUser:   (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));