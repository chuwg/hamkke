import { Stack } from 'expo-router';

export default function ChildLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="add" />
      <Stack.Screen name="edit/[id]" />
    </Stack>
  );
}
