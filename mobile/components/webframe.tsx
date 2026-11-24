import type { PropsWithChildren } from "react";

// Sur téléphone, l'app occupe tout l'écran : rien à faire.
// La version web (webframe.web.tsx) centre l'app dans une colonne sur les grands écrans.
export function WebFrame({ children }: PropsWithChildren) {
    return children
}
