import { Stack } from 'expo-router';
import { SessionProvider, useSession } from '@/auth/ctx';
import { SplashScreenController } from '@/auth/splash';
import { ThemeProvider, useThemeContext } from '@/constants/themecontext';
import { StatusBar } from 'expo-status-bar';


export const unstable_settings = {
  anchor: '(tabs)',
};

export default function Root() {
  // Set up the auth context and render your layout inside of it.
  return (
    <SessionProvider>
      <SplashScreenController />
      <StatusBar hidden />
      <RootNavigator />
    </SessionProvider>
  );
}

function RootNavigator() {
  const { session } = useSession();
  const { theme } = useThemeContext()
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

      </Stack>
    </ThemeProvider>

  );
}

// Create a new component that can access the SessionProvider context later.
