import { router, Stack } from 'expo-router';
import { SessionProvider, useSession } from '@/auth/ctx';
import { SplashScreenController } from '@/auth/splash';
import { ThemeProvider, useThemeContext } from '@/constants/themecontext';
import { StatusBar } from 'expo-status-bar';
import { NavigationBar } from 'expo-navigation-bar';
import { ToastProvider } from '@/components/toast/toast_context';
import { Toast } from '@/components/toast/toast';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useEffect } from 'react';
import * as SystemUI from 'expo-system-ui';
import {
  ThemeProvider as NavigationThemeProvider,
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationLightTheme,
} from '@react-navigation/native';


export const unstable_settings = {
  anchor: '(tabs)',
};

export default function Root() {
  // Set up the auth context and render your layout inside of it.
  return (
    <SessionProvider>
      <SplashScreenController />
      <StatusBar hidden />
      {/* remplace "androidNavigationBar" de app.json (supprimé en SDK 58) */}
      <NavigationBar hidden style="light" />
      {/* ✅ ThemeProvider doit ENGLOBER RootNavigator, sinon useThemeContext()
          dans RootNavigator lit la valeur par défaut du contexte */}
      <ThemeProvider>
        <ToastProvider>
          <RootNavigator />
          <Toast />
        </ToastProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}

function RootNavigator() {
  const { session,setSession } = useSession();
  const { theme, isDark } = useThemeContext();

  // ✅ Fond natif de la fenêtre : c'est lui qu'on voit (en noir) pendant les transitions
  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(theme.colors.bg.primary);
  }, [theme]);

  // ✅ Thème de React Navigation : fond des conteneurs de navigation
  const baseNavTheme = isDark ? NavigationDarkTheme : NavigationLightTheme;
  const navigationTheme = {
    ...baseNavTheme,
    colors: {
      ...baseNavTheme.colors,
      background: theme.colors.bg.primary,
      card: theme.colors.bg.nav,
    },
  };
  const { user, isLoading } = useCurrentUser();
  useEffect(() => {
    if (isLoading || !session || !user) return;

    if (!user.email_verified) {
      setSession(null)
      router.replace({
        pathname: '/verify-email',
        params: { email: user.email },
      });
      return;
    }

    if (!user.onboarding_completed) {
      router.replace('/goals');
    }
    // Sinon : l'utilisateur reste où il est (typiquement (tabs))
  }, [user, isLoading, session]);

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <Stack screenOptions={{
        headerStyle: { backgroundColor: theme.colors.bg.nav },
        headerTintColor: theme.colors.text.primary,
        contentStyle: { backgroundColor: theme.colors.bg.primary },
      }}>
        <Stack.Protected guard={!!session}>
          <Stack.Screen name="(tabs)"
            options={{
              headerShown: false,
            }}>
          </Stack.Screen>
        </Stack.Protected>

        <Stack.Protected guard={!session}>
          <Stack.Screen name='login'
            options={{
              headerShown: false,
            }}>
          </Stack.Screen>
          <Stack.Screen name="sign-up"
            options={{
              headerShown: false,
            }}>
          </Stack.Screen>
          <Stack.Screen name="verify-email"
            options={{
              headerShown: false,
            }}>
          </Stack.Screen>

        </Stack.Protected>

        <Stack.Protected guard={!!session}>
          <Stack.Screen name='camera'
            options={{
              headerShown: false,
            }}>
          </Stack.Screen>
        </Stack.Protected>

        <Stack.Protected guard={!!session}>
          <Stack.Screen name='bookresult'
            options={{
              headerShown: false,
            }}>
          </Stack.Screen>
        </Stack.Protected>
        
        <Stack.Protected guard={!!session}>
          <Stack.Screen name='goals'
            options={{
              headerShown: false,
            }}>
          </Stack.Screen>
        </Stack.Protected>
        

      </Stack>
    </NavigationThemeProvider>

  );
}

// Create a new component that can access the SessionProvider context later.
