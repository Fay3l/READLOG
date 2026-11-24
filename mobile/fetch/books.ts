import api from "@/lib/api";
import { apiErrorMessage } from "@/lib/errors";
import { BookResult, GetBook, useUserBookStore } from "@/types/books";

// Résultat commun des actions : { ok: true } ou { ok: false, message } prêt à afficher dans un toast
type ActionResult = { ok: true } | { ok: false; message: string };

// Recharge la bibliothèque dans le store après une modification
async function refreshLibrary(): Promise<GetBook[]> {
  const books = await get_userbooks();
  useUserBookStore.getState().setUserBooks(books);
  return books;
}

export async function search_books(search: string): Promise<BookResult[]> {
  try {
    const response = await api.get<BookResult[]>("/books/search", { params: { q: search } });
    return response.data;
  } catch {
    return []; // 404 = aucun résultat
  }
}

export async function get_userbooks(): Promise<GetBook[]> {
  try {
    // ⚠️ pas de "/" final : "users/books/" provoquait une redirection 307
    const response = await api.get<GetBook[]>('/users/books');
    return Array.isArray(response.data) ? response.data : [];
  } catch {
    return [];
  }
}

export async function add_userbook(book: BookResult): Promise<ActionResult> {
  try {
    await api.post('/books/add', null, { params: { google_books_id: book.google_books_id } });
    await refreshLibrary();
    return { ok: true };
  } catch (err) {
    return { ok: false, message: apiErrorMessage(err, 'Livre pas ajouté') };
  }
}

export async function remove_userbook(book_id: string): Promise<ActionResult> {
  try {
    await api.delete(`/users/book/${book_id}`);
    await refreshLibrary();
    return { ok: true };
  } catch (err) {
    return { ok: false, message: apiErrorMessage(err, 'Livre pas supprimé') };
  }
}

export async function update_userbook(book_id: string, data: { status?: string; current_page?: number }) {
  try {
    await api.patch(`/users/book/${book_id}`, data);
    const books = await refreshLibrary();
    return { ok: true as const, book: books.find(b => b.id === book_id) ?? null };
  } catch (err) {
    return { ok: false as const, book: null, message: apiErrorMessage(err, 'Mise à jour impossible') };
  }
}

export type ManualBook = {
  title: string
  author: string
  isbn?: string
  page_count?: number
  published_year?: string
  publisher?: string
  genre?: string
  description?: string
  status: 'to_read' | 'reading' | 'finished'
}

// Livre absent de Google Books : saisi à la main, il est enregistré dans la table books
export async function create_manual_book(book: ManualBook): Promise<ActionResult> {
  try {
    await api.post('/books/manual', book);
    await refreshLibrary();
    return { ok: true };
  } catch (err) {
    return { ok: false, message: apiErrorMessage(err, 'Livre pas ajouté') };
  }
}
