import axios from "axios"
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

const API_URL = process.env['API_URL'] || "http://192.168.1.155:8000/books"

export async function search_books(
  search: string
): Promise<BookResult[] | null> {
  try {
    const response = await axios.get<BookResult[]>(
      API_URL + "/search",
      {
        params: {
          q: search,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }

    throw error;
  }
}