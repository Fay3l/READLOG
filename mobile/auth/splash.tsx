import { SplashScreen } from 'expo-router';
import { useSession } from './ctx';
import { useFonts, PlayfairDisplay_400Regular, PlayfairDisplay_700Bold, PlayfairDisplay_400Regular_Italic } from '@expo-google-fonts/playfair-display';
import { useEffect } from 'react';


SplashScreen.preventAutoHideAsync();

export function SplashScreenController() {
  const { isLoading } = useSession();
  const [loaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular_Italic,
  });

  useEffect(() => {
    if (loaded || !isLoading) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;
}