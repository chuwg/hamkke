import { Stack } from 'expo-router';

export default function InfoLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="school" />
      <Stack.Screen name="welfare" />
      <Stack.Screen name="support" />
      <Stack.Screen name="education" />
    </Stack>
  );
}
