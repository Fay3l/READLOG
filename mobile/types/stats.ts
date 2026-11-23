export type UserStats = {
    year: number
    total_books: number
    reading_books: number
    finished_books: number
    to_read_books: number
    pages_read: number
    reading_goal: number
    finished_this_year: number
    books_per_month: number[] // 12 valeurs : janvier → décembre
}
