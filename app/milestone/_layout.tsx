import { Stack } from 'expo-router';

export default function MilestoneLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="add" />
      <Stack.Screen name="list" />
      <Stack.Screen name="edit/[id]" />
    </Stack>
  );
}
