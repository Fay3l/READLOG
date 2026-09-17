import {create} from "zustand"

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

type BookStore = {
    scannedBook: BookResult | null
    setScannedBook: (book: BookResult | null) => void
}

export const useBookStore = create<BookStore>((set) => ({
  scannedBook:    null,
  setScannedBook: (book) => set({ scannedBook: book }),
}))