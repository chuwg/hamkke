import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ChildProvider } from '../contexts/ChildContext';
import { ThemeProvider } from '../contexts/ThemeContext';

const ONBOARDING_COMPLETE_KEY = '@hamkke_onboarding_complete';

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  // Check onboarding status on mount
  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
      setOnboardingComplete(value === 'true');
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
    } finally {
      setOnboardingChecked(true);
    }
  };

  useEffect(() => {
    if (loading || !onboardingChecked) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';

    // Show onboarding for first-time users
    if (!onboardingComplete && !inOnboarding) {
      router.replace('/onboarding');
      return;
    }

    // After onboarding, handle auth navigation
    if (onboardingComplete || inOnboarding) {
      if (!user && !inAuthGroup && !inOnboarding) {
        router.replace('/(auth)/login');
      } else if (user && inAuthGroup) {
        router.replace('/(tabs)');
      }
    }
  }, [user, segments, loading, onboardingChecked, onboardingComplete]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
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
