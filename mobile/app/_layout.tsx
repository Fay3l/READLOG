import { Stack } from 'expo-router';
import { SessionProvider, useSession } from '@/auth/ctx';
import { SplashScreenController } from '@/auth/splash';
import { ThemeProvider } from '@/constants/themecontext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function Root() {
  // Set up the auth context and render your layout inside of it.
  return (
    <SessionProvider>
      <SplashScreenController />
      <RootNavigator />
    </SessionProvider>
  );
}

function RootNavigator() {
  const { session } = useSession();

  return (
    <ThemeProvider>
      <Stack>
        <Stack.Protected guard={!!session}>
          <Stack.Screen name="(tabs)"
            options={{
              headerShown: false,
            }}>
          </Stack.Screen>
        </Stack.Protected>

        <Stack.Protected guard={!session}>
          <Stack.Screen name="auth"
            options={{
              headerShown: false,
            }}>
          </Stack.Screen>
        </Stack.Protected>

        <Stack.Protected guard={!session}>
          <Stack.Screen name="sign-up"
            options={{
              headerShown: true,
            }}>
          </Stack.Screen>
        </Stack.Protected>

        <Stack.Protected guard={!session}>
          <Stack.Screen name='login'
            options={{
              headerShown: true,
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
