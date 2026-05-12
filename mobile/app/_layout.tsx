import { Stack } from 'expo-router';
import { SessionProvider,useSession } from '@/auth/ctx';
import { SplashScreenController } from '@/auth/splash';

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

  return <Stack>
    <Stack.Protected guard={!!session}>
      <Stack.Screen name="(tabs)"
        options={{
          headerShown: false,
        }}>
      </Stack.Screen>
    </Stack.Protected>

    <Stack.Protected guard={!session}>
      <Stack.Screen name="sign-in"
        options={{
          headerShown: false,
        }}>
      </Stack.Screen>
    </Stack.Protected>


  </Stack>;
}

// Create a new component that can access the SessionProvider context later.
