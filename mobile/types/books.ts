import { create } from "zustand"

export type BookResult = {
    google_books_id: string
    title: string
    author: string
    cover_url: string | null
    description: string | null
    page_count: number | null
    isbn: string | null
    published_year: string | null
    publisher: string | null
    genre: string | null
}

export type GetBook = {
    id: string;
    google_books_id: string;
    isbn: string;
    title: string;
    author: string;
    cover_url: string;
    description: string;
    publisher: string;
    published_year: number;
    status:string;
    current_page:number;
    genres: string;
    page_count: number;
    created_at: string;
}

type BookStore = {
    scannedBook: BookResult | null
    setScannedBook: (book: BookResult | null) => void
}

export const useBookResultStore = create<BookStore>((set) => ({
    scannedBook: null,
    setScannedBook: (book) => set({ scannedBook: book }),
}))

type UserBooksStore = {
    userBooks: GetBook[] | null
    setUserBooks: (userbook: GetBook[] | null) => void
}

export const useUserBookStore = create<UserBooksStore>((set) => ({
    userBooks: null,
    setUserBooks: (userbooks) => set({ userBooks: userbooks })
}))

type SingleBookStore = {
    book: GetBook |null
    setBook:(book:GetBook| null) => void
}

export const useBookStore = create<SingleBookStore>((set) => ({
    book: null,
    setBook: (ubooks:GetBook| null) => set({ book: ubooks })
}))