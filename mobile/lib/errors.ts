// Transforme une erreur axios en message lisible pour l'utilisateur.
//
// FastAPI renvoie deux formes d'erreur :
//  - { detail: "message" }            → erreur métier (401, 409, 429...)
//  - { detail: [{ loc, msg, ... }] }  → 422, validation Pydantic (champ invalide)

const FIELD_MESSAGES: Record<string, string> = {
    password: 'Le mot de passe doit contenir au moins 8 caractères',
    email: 'Adresse e-mail invalide',
    name: 'Le nom doit contenir entre 2 et 30 caractères',
    code: 'Code invalide',
    title: 'Le titre est obligatoire',
    author: "L'auteur est obligatoire",
    isbn: "L'ISBN doit contenir 10 ou 13 chiffres",
    page_count: 'Nombre de pages invalide',
    published_year: "L'année doit avoir 4 chiffres",
}

export function apiErrorMessage(err: any, fallback = 'Une erreur est survenue'): string {
    if (!err?.response) return 'Impossible de joindre le serveur, vérifie ta connexion'

    const detail = err.response.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail) && detail.length > 0) {
        const field = detail[0]?.loc?.at(-1)
        return FIELD_MESSAGES[field] ?? 'Certaines informations sont invalides'
    }
    return fallback
}
