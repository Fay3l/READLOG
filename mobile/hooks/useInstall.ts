// Version iOS / Android de l'app (native) : rien à installer, elle l'est déjà.
// La vraie logique est dans useInstall.web.ts (Metro choisit ce fichier sur le web).
export function useInstall() {
    return {
        canPrompt: false,
        isIos: false,
        isAndroid: false,
        isInstalled: true,
        isSecure: true,
        install: async () => false,
    }
}
