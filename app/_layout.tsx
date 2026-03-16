import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChildProvider } from '../contexts/ChildContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { notificationService } from '../services/notifications';

const ONBOARDING_COMPLETE_KEY = '@hamkke_onboarding_complete';

function RootLayoutNav() {
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  // Check onboarding status on mount
  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  // Request notification permission
  useEffect(() => {
    if (Platform.OS !== 'web') {
      notificationService.requestPermission();
    }
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
      setOnboardingComplete(value === 'true');
    } catch (error) {
      setOnboardingComplete(false);
    } finally {
      setIsReady(true);
    }
  };

  useEffect(() => {
    if (!isReady || onboardingComplete === null) return;

    const inOnboarding = segments[0] === 'onboarding';
    const inTabs = segments[0] === '(tabs)';
    const inNestedRoutes = ['child', 'schedule', 'therapy', 'sensory', 'milestone', 'info'].includes(segments[0] as string);

    // Show onboarding for first-time users
    if (!onboardingComplete && !inOnboarding) {
      router.replace('/onboarding');
      return;
    }

    // After onboarding completion, go to tabs
    if (onboardingComplete && inOnboarding) {
      router.replace('/(tabs)');
      return;
    }

    // Redirect root to tabs if onboarding is complete
    if (onboardingComplete && !inTabs && !inNestedRoutes && segments.length === 0) {
      router.replace('/(tabs)');
    }
  }, [isReady, onboardingComplete, segments]);

  // Re-check onboarding status when coming back from onboarding
  useEffect(() => {
    if (segments[0] === '(tabs)' && !onboardingComplete) {
      checkOnboardingStatus();
    }
  }, [segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="child" />
      <Stack.Screen name="schedule" />
      <Stack.Screen name="therapy" />
      <Stack.Screen name="sensory" />
      <Stack.Screen name="milestone" />
      <Stack.Screen name="info" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ChildProvider>
          <RootLayoutNav />
        </ChildProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
