import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 테마 색상 정의
export const lightTheme = {
  mode: 'light' as const,
  colors: {
    // 기본 배경
    background: '#F8F9FA',
    surface: '#FFFFFF',
    card: '#FFFFFF',

    // 텍스트
    text: '#1a1a1a',
    textSecondary: '#666666',
    textMuted: '#999999',

    // 브랜드 색상
    primary: '#4CAF50',
    primaryLight: '#E8F5E9',
    primaryDark: '#2E7D32',

    // 액센트
    accent: '#007AFF',
    accentLight: '#E3F2FD',

    // 상태 색상
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',

    // 경계선
    border: '#E0E0E0',
    borderLight: '#F0F0F0',

    // 기타
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.5)',

    // 네비게이션
    tabBar: '#FFFFFF',
    tabBarBorder: '#E0E0E0',
    tabActive: '#4CAF50',
    tabInactive: '#999999',
  },
};

export const darkTheme = {
  mode: 'dark' as const,
  colors: {
    // 기본 배경
    background: '#121212',
    surface: '#1E1E1E',
    card: '#2C2C2C',

    // 텍스트
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textMuted: '#808080',

    // 브랜드 색상
    primary: '#66BB6A',
    primaryLight: '#1B3D1F',
    primaryDark: '#81C784',

    // 액센트
    accent: '#64B5F6',
    accentLight: '#1A2733',

    // 상태 색상
    success: '#66BB6A',
    warning: '#FFB74D',
    error: '#EF5350',
    info: '#64B5F6',

    // 경계선
    border: '#404040',
    borderLight: '#333333',

    // 기타
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.7)',

    // 네비게이션
    tabBar: '#1E1E1E',
    tabBarBorder: '#333333',
    tabActive: '#66BB6A',
    tabInactive: '#808080',
  },
};

export type Theme = typeof lightTheme;
export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@hamkke_theme_mode';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  // 저장된 테마 설정 불러오기
  useEffect(() => {
    loadThemeMode();
  }, []);

  const loadThemeMode = async () => {
    try {
      const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
        setThemeModeState(savedMode as ThemeMode);
      }
    } catch (error) {
      console.error('테마 설정 로드 실패:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('테마 설정 저장 실패:', error);
    }
  };

  // 실제 적용될 테마 결정
  const isDark = themeMode === 'system'
    ? systemColorScheme === 'dark'
    : themeMode === 'dark';

  const theme = isDark ? darkTheme : lightTheme;

  if (!isLoaded) {
    return null; // 또는 로딩 스피너
  }

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
