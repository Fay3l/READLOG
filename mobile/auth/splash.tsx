import { SplashScreen } from 'expo-router';
import { useSession } from './ctx';
import { useFonts, PlayfairDisplay_400Regular, PlayfairDisplay_700Bold, PlayfairDisplay_400Regular_Italic } from '@expo-google-fonts/playfair-display';
import { DMSans_300Light, DMSans_400Regular, DMSans_500Medium } from '@expo-google-fonts/dm-sans';
import { useEffect } from 'react';


SplashScreen.preventAutoHideAsync();

export function SplashScreenController() {
  const { isLoading } = useSession();
  const [loaded, error] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular_Italic,
    // ✅ utilisées partout via theme.fonts.dmSans, mais jamais chargées jusque-là
    DMSans_300Light,
    DMSans_400Regular,
    DMSans_500Medium,
  });

  // ✅ On garde le splash tant que les polices ET la session (token) ne sont pas prêtes :
  // sinon on voit brièvement la page d'accueil avant d'être redirigé vers la bibliothèque.
  useEffect(() => {
    if ((loaded || error) && !isLoading) SplashScreen.hideAsync();
  }, [loaded, error, isLoading]);

  return null;
}
