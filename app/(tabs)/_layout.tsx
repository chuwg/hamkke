import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        headerShown: true,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          headerTitle: '함께크는',
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: '일정',
          headerTitle: '일정 관리',
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: '기록',
          headerTitle: '치료 기록',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '프로필',
          headerTitle: '아이 프로필',
        }}
      />
    </Tabs>
  );
}
