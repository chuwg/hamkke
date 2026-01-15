import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ChildProvider } from '../contexts/ChildContext';
import { ThemeProvider } from '../contexts/ThemeContext';

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // 로그인하지 않았으면 로그인 화면으로
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // 로그인했으면 메인 화면으로
      router.replace('/(tabs)');
    }
  }, [user, segments, loading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <ChildProvider>
            <RootLayoutNav />
          </ChildProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
