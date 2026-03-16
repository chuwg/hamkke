import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 테마 색상 정의 - 따뜻한 민트 (Warm Mint)
export const lightTheme = {
  mode: 'light' as const,
  colors: {
    // 기본 배경
    background: '#F7FFF7',
    surface: '#FFFFFF',
    card: '#FFFFFF',

    // 텍스트
    text: '#2C3E50',
    textSecondary: '#5D6D7E',
    textMuted: '#95A5A6',

    // 브랜드 색상 (민트)
    primary: '#4ECDC4',
    primaryLight: '#E0F7F5',
    primaryDark: '#3AAFA9',

    // 액센트 (코랄 핑크)
    accent: '#FF6B6B',
    accentLight: '#FFE8E8',

    // 세컨더리 (따뜻한 노랑)
    secondary: '#FFE66D',
    secondaryLight: '#FFF9E0',

    // 상태 색상
    success: '#4ECDC4',
    warning: '#FFE66D',
    error: '#FF6B6B',
    info: '#74B9FF',

    // 경계선
    border: '#E8F5F3',
    borderLight: '#F0FAF8',

    // 기타
    shadow: '#2C3E50',
    overlay: 'rgba(44, 62, 80, 0.5)',

    // 네비게이션
    tabBar: '#FFFFFF',
    tabBarBorder: '#E8F5F3',
    tabActive: '#4ECDC4',
    tabInactive: '#95A5A6',
  },
};

export const darkTheme = {
  mode: 'dark' as const,
  colors: {
    // 기본 배경
    background: '#1A2634',
    surface: '#243447',
    card: '#2C3E50',

    // 텍스트
    text: '#FFFFFF',
    textSecondary: '#B8C5D0',
    textMuted: '#7F8C9A',

    // 브랜드 색상 (민트)
    primary: '#5DDBCD',
    primaryLight: '#2A4A48',
    primaryDark: '#4ECDC4',

    // 액센트 (코랄 핑크)
    accent: '#FF8585',
    accentLight: '#3D2A2A',

    // 세컨더리 (따뜻한 노랑)
    secondary: '#FFEB8A',
    secondaryLight: '#3D3A2A',

    // 상태 색상
    success: '#5DDBCD',
    warning: '#FFEB8A',
    error: '#FF8585',
    info: '#74B9FF',

    // 경계선
    border: '#3D5066',
    borderLight: '#344455',

    // 기타
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.7)',

    // 네비게이션
    tabBar: '#243447',
    tabBarBorder: '#3D5066',
    tabActive: '#5DDBCD',
    tabInactive: '#7F8C9A',
  },
};

export type Theme = typeof lightTheme | typeof darkTheme;
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
  // 시스템 테마 변경 실시간 감지를 위한 state
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark' | null>(
    Appearance.getColorScheme()
  );

  // 저장된 테마 설정 불러오기
  useEffect(() => {
    loadThemeMode();
  }, []);

  // 시스템 테마 변경 리스너
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme);
    });
    return () => subscription.remove();
  }, []);

  const loadThemeMode = async () => {
    try {
      const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
        setThemeModeState(savedMode as ThemeMode);
      }
    } catch (error) {
      // theme load failure - use default
    } finally {
      setIsLoaded(true);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      // theme save failure - silently ignore
    }
  };

  // 실제 적용될 테마 결정 (systemTheme 우선, fallback으로 systemColorScheme)
  const currentSystemTheme = systemTheme ?? systemColorScheme;
  const isDark = themeMode === 'system'
    ? currentSystemTheme === 'dark'
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
