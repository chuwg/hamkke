import { Stack } from 'expo-router';

export default function TherapyLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="add" />
      <Stack.Screen name="edit/[id]" />
    </Stack>
  );
}
