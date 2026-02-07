import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

const ONBOARDING_COMPLETE_KEY = '@hamkke_onboarding_complete';

const SLIDES = [
  {
    id: '1',
    icon: '👋',
    title: '함께크는에 오신 것을\n환영합니다',
    description: '장애 아동의 발달과 일상을\n체계적으로 관리할 수 있는 앱입니다',
  },
  {
    id: '2',
    icon: '📅',
    title: '일정 관리',
    description: '치료 일정, 병원 예약, 교육 일정을\n한눈에 관리하세요\n반복 일정과 알림 기능도 지원합니다',
  },
  {
    id: '3',
    icon: '📊',
    title: '치료 기록',
    description: '언어, 행동, 작업, 놀이 치료 등\n다양한 치료 기록을 남기고\n차트로 발전 상황을 확인하세요',
  },
  {
    id: '4',
    icon: '🎯',
    title: '발달 마일스톤',
    description: '아이의 발달 목표를 설정하고\n달성 여부를 기록하세요\n작은 성장도 소중하게 기록됩니다',
  },
  {
    id: '5',
    icon: '🌈',
    title: '감각 프로필',
    description: '아이의 감각 특성을 파악하고\n민감한 영역과 둔감한 영역을\n시각화하여 관리하세요',
  },
  {
    id: '6',
    icon: '🏫',
    title: '특수학급 검색',
    description: '전국 특수학급 보유 학교를\n시도/시군구별로 쉽게 검색하세요\n복지시설 정보도 찾아볼 수 있습니다',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const { theme } = useTheme();

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToOffset({ offset: nextIndex * width, animated: true });
    } else {
      completeOnboarding();
    }
  };

  const getItemLayout = (_: any, index: number) => ({
    length: width,
    offset: width * index,
    index,
  });

  const handleSkip = () => {
    completeOnboarding();
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to save onboarding status:', error);
      router.replace('/(tabs)');
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem = ({ item }: { item: typeof SLIDES[0] }) => (
    <View style={[styles.slide, { backgroundColor: theme.colors.background }]}>
      <View style={styles.slideContent}>
        <Text style={styles.slideIcon}>{item.icon}</Text>
        <Text style={[styles.slideTitle, { color: theme.colors.text }]}>
          {item.title}
        </Text>
        <Text style={[styles.slideDescription, { color: theme.colors.textSecondary }]}>
          {item.description}
        </Text>
      </View>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.pagination}>
      {SLIDES.map((_, index) => {
        const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });
        return (
          <Animated.View
            key={index}
            style={[
              styles.paginationDot,
              {
                width: dotWidth,
                opacity,
                backgroundColor: theme.colors.primary,
              },
            ]}
          />
        );
      })}
    </View>
  );

  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        {!isLastSlide && (
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={[styles.skipText, { color: theme.colors.textMuted }]}>
              건너뛰기
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={getItemLayout}
        bounces={false}
      />

      {renderPagination()}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {isLastSlide ? '시작하기' : '다음'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    height: 100,
    alignItems: 'flex-end',
  },
  skipButton: {
    padding: 10,
  },
  skipText: {
    fontSize: 16,
  },
  slide: {
    width,
    flex: 1,
  },
  slideContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  slideIcon: {
    fontSize: 80,
    marginBottom: 40,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 38,
  },
  slideDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 26,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  nextButton: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
