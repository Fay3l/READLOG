import api from "@/lib/api";
import { BookResult, GetBook } from "@/types/books";




export async function search_books(
  search: string
): Promise<BookResult[] | null> {
  try {
    const response = await api.get<BookResult[]>(
      "/books/search",
      {
        params: {
          q: search,
        },
      }
    );
    
    return response.data;
  } catch (error) {
    return []
  }
}

export async function get_books() {
  try {
    const response = await api.get<GetBook[]>('/books/')
    return response.data
  }
  catch (error) {
    return []
  }
}

export async function add_book(gb_id:string){
  try {
    const res = await api.post(`/books/add?google_books_id=${gb_id}`)
    if(res.status == 200) await get_books()
  }
  catch (error){
    throw error
  }
}