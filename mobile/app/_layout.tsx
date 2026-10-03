import { router, Stack } from 'expo-router';
import { SessionProvider, useSession } from '@/auth/ctx';
import { SplashScreenController } from '@/auth/splash';
import { ThemeProvider, useThemeContext } from '@/constants/themecontext';
import { StatusBar } from 'expo-status-bar';
import { ToastProvider } from '@/components/toast/toast_context';
import { Toast } from '@/components/toast/toast';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useEffect } from 'react';


export const unstable_settings = {
  anchor: '(tabs)',
};

export default function Root() {
  // Set up the auth context and render your layout inside of it.
  return (
    <SessionProvider>
      <SplashScreenController />
      <StatusBar hidden />
      <ToastProvider>
        <RootNavigator />
        <Toast />
      </ToastProvider>
    </SessionProvider>
  );
}

function RootNavigator() {
  const { session,setSession } = useSession();
  const { theme } = useThemeContext();
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
    <ThemeProvider>
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
    </ThemeProvider>

  );
}

// Create a new component that can access the SessionProvider context later.
