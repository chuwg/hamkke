import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';

const NAV_ITEMS = [
  { path: '/(tabs)', label: '홈', icon: '🏠' },
  { path: '/(tabs)/schedule', label: '일정', icon: '📅' },
  { path: '/(tabs)/records', label: '기록', icon: '📊' },
  { path: '/(tabs)/info', label: '정보', icon: '📚' },
  { path: '/(tabs)/profile', label: '프로필', icon: '👤' },
];

export default function FooterNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();

  const isActive = (path: string) => {
    if (path === '/(tabs)') {
      return pathname === '/' || pathname === '/(tabs)';
    }
    return pathname.startsWith(path);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.tabBar, borderTopColor: theme.colors.tabBarBorder }]}>
      {NAV_ITEMS.map((item) => (
        <TouchableOpacity
          key={item.path}
          style={styles.navItem}
          onPress={() => router.push(item.path as any)}
        >
          <Text style={styles.navIcon}>{item.icon}</Text>
          <Text style={[
            styles.navLabel,
            { color: theme.colors.tabInactive },
            isActive(item.path) && { color: theme.colors.tabActive, fontWeight: '600' }
          ]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 11,
    color: '#999',
  },
});
