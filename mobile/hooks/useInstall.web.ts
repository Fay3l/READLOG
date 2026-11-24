import { useCallback, useEffect, useState } from 'react'

// Traduction React du composable Vue useInstall :
//   ref / shallowRef   → useState
//   computed           → valeur calculée à chaque rendu
//   onMounted/Unmounted → useEffect + sa fonction de nettoyage

// Événement envoyé par Chrome / Edge (Android, ordinateur) quand l'app peut s'installer.
// Il n'existe pas dans les types TypeScript standard, on le décrit ici.
interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// Lu une seule fois au démarrage (l'app web n'est pas rendue côté serveur : window existe déjà)
function detectEnvironment() {
    const ua = navigator.userAgent
    return {
        isIos: /iphone|ipad|ipod/i.test(ua)
            || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1), // iPad récent (se présente comme un Mac)
        isAndroid: /android/i.test(ua),
        isInstalled: window.matchMedia('(display-mode: standalone)').matches
            || (navigator as Navigator & { standalone?: boolean }).standalone === true, // propriété propre à Safari iOS
        isSecure: window.isSecureContext,
    }
}

export function useInstall() {
    const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
    // Fonction passée à useState : exécutée au premier rendu seulement (pas besoin d'un useEffect)
    const [env, setEnv] = useState(detectEnvironment)

    useEffect(() => {
        const onBeforeInstall = (e: Event) => {
            e.preventDefault() // on garde l'invite pour notre propre bouton
            setDeferred(e as BeforeInstallPromptEvent)
        }
        const onInstalled = () => {
            setEnv(prev => ({ ...prev, isInstalled: true }))
            setDeferred(null)
        }
        window.addEventListener('beforeinstallprompt', onBeforeInstall)
        window.addEventListener('appinstalled', onInstalled)
        return () => {
            window.removeEventListener('beforeinstallprompt', onBeforeInstall)
            window.removeEventListener('appinstalled', onInstalled)
        }
    }, [])

    const install = useCallback(async (): Promise<boolean> => {
        if (!deferred) return false
        await deferred.prompt()
        const { outcome } = await deferred.userChoice
        setDeferred(null) // l'événement ne peut servir qu'une fois
        return outcome === 'accepted'
    }, [deferred])

    return { canPrompt: deferred !== null, ...env, install }
}
