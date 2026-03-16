import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { WelfareAlert, fetchWelfareAlerts } from '../../services/welfareAlertApi';

const INFO_CATEGORIES = [
  {
    id: 'alerts',
    title: '장애아동 복지 알림',
    icon: '🔔',
    description: '장애아동 복지 새 소식 실시간 알림',
    color: '#2563EB',
    route: '/info/alerts',
  },
  {
    id: 'child-alerts',
    title: '아동 복지 알림',
    icon: '👶',
    description: '일반 아동 수당, 보육, 교육, 돌봄 정보',
    color: '#FF9F43',
    route: '/info/child-alerts',
  },
  {
    id: 'bookmarks',
    title: '즐겨찾기',
    icon: '\u2b50',
    description: '저장한 복지 정보 모아보기',
    color: '#FFD700',
    route: '/info/bookmarks',
  },
  {
    id: 'school',
    title: '학교 정보',
    icon: '🏫',
    description: '특수학급, 통합학급, 특수학교 검색',
    color: '#4ECDC4',
    route: '/info/school',
  },
  {
    id: 'welfare',
    title: '복지시설',
    icon: '🏛️',
    description: '복지관, 치료센터, 발달센터 찾기',
    color: '#FF6B6B',
    route: '/info/welfare',
  },
  {
    id: 'support',
    title: '지원 서비스',
    icon: '💰',
    description: '바우처, 지원금, 활동지원 안내',
    color: '#95E1D3',
    route: '/info/support',
  },
  {
    id: 'education',
    title: '교육/진학',
    icon: '📚',
    description: '입학, 전학, 진학 가이드',
    color: '#F3A683',
    route: '/info/education',
  },
];

const QUICK_LINKS = [
  { title: '복지로', url: 'https://www.bokjiro.go.kr', icon: '🌐' },
  { title: '학교알리미', url: 'https://www.schoolinfo.go.kr', icon: '🏫' },
  { title: '국립특수교육원', url: 'https://www.nise.go.kr', icon: '📖' },
  { title: '장애인권익옹호기관', url: 'https://www.naapd.or.kr', icon: '⚖️' },
];


export default function InfoScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [recentAlerts, setRecentAlerts] = useState<WelfareAlert[]>([]);

  const loadRecentAlerts = async () => {
    try {
      const posts = await fetchWelfareAlerts(5);
      setRecentAlerts(posts);
    } catch {}
  };

  useEffect(() => { loadRecentAlerts(); }, []);

  const ds = {
    container: { backgroundColor: theme.colors.background },
    infoBox: { backgroundColor: theme.colors.accentLight },
    infoTitle: { color: theme.colors.accent },
    infoText: { color: theme.colors.accent },
    sectionTitle: { color: theme.colors.text },
    categoryCard: { backgroundColor: theme.colors.card },
    categoryTitle: { color: theme.colors.text },
    categoryDescription: { color: theme.colors.textSecondary },
    categoryArrow: { color: theme.colors.textMuted },
    quickLinkCard: { backgroundColor: theme.colors.card },
    quickLinkTitle: { color: theme.colors.text },
    updateCard: { backgroundColor: theme.colors.card },
    updateText: { color: theme.colors.text },
    updateDate: { color: theme.colors.textMuted },
    updateItemBorder: { borderBottomColor: theme.colors.border },
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecentAlerts();
    setRefreshing(false);
  };

  const handleCategoryPress = (route: string) => {
    router.push(route as any);
  };

  const handleQuickLinkPress = async (url: string) => {
    // 웹에서는 새 창으로, 앱에서는 시스템 브라우저로
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      try {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        }
      } catch (error) {
      }
    }
  };

  return (
    <ScrollView
      style={[styles.container, ds.container]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.accent} />
      }
    >
      {/* 안내 메시지 */}
      <View style={[styles.infoBox, ds.infoBox]}>
        <Text style={styles.infoIcon}>💡</Text>
        <View style={styles.infoContent}>
          <Text style={[styles.infoTitle, ds.infoTitle]}>정보를 찾고 계신가요?</Text>
          <Text style={[styles.infoText, ds.infoText]}>
            아래 카테고리에서 필요한 정보를 찾아보세요.{'\n'}
            공공데이터 API를 통해 실시간 정보를 제공합니다.
          </Text>
        </View>
      </View>

      {/* 카테고리 그리드 */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, ds.sectionTitle]}>카테고리</Text>
        <View style={styles.categoryGrid}>
          {INFO_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryCard, ds.categoryCard, { borderLeftColor: category.color }]}
              onPress={() => handleCategoryPress(category.route)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <View style={styles.categoryContent}>
                <Text style={[styles.categoryTitle, ds.categoryTitle]}>{category.title}</Text>
                <Text style={[styles.categoryDescription, ds.categoryDescription]}>{category.description}</Text>
              </View>
              <Text style={[styles.categoryArrow, ds.categoryArrow]}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 빠른 링크 */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, ds.sectionTitle]}>유용한 사이트</Text>
        <View style={styles.quickLinksGrid}>
          {QUICK_LINKS.map((link, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.quickLinkCard, ds.quickLinkCard]}
              onPress={() => handleQuickLinkPress(link.url)}
            >
              <Text style={styles.quickLinkIcon}>{link.icon}</Text>
              <Text style={[styles.quickLinkTitle, ds.quickLinkTitle]}>{link.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 최근 복지 알림 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, ds.sectionTitle]}>최근 복지 알림</Text>
          <TouchableOpacity onPress={() => handleCategoryPress('/info/alerts')}>
            <Text style={{ color: theme.colors.accent, fontSize: 14 }}>전체보기 ›</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.updateCard, ds.updateCard]}>
          {recentAlerts.length > 0 ? recentAlerts.map((alert) => (
            <TouchableOpacity
              key={alert.id}
              style={[styles.updateItem, ds.updateItemBorder]}
              onPress={() => handleQuickLinkPress(alert.source_url)}
            >
              <Text style={[styles.updateDate, ds.updateDate]}>{alert.date?.slice(5)}</Text>
              <Text style={[styles.updateText, ds.updateText]} numberOfLines={1}>{alert.title}</Text>
              <Text style={[styles.updateArrow, ds.categoryArrow]}>›</Text>
            </TouchableOpacity>
          )) : (
            <Text style={[{ padding: 16, textAlign: 'center', fontSize: 14 }, ds.updateDate]}>
              알림을 불러오는 중...
            </Text>
          )}
        </View>
      </View>

      {/* 하단 여백 */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryGrid: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  categoryIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 13,
    color: '#666',
  },
  categoryArrow: {
    fontSize: 24,
    color: '#ccc',
  },
  quickLinksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  quickLinkCard: {
    width: '47%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickLinkIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  quickLinkTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  updateCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
  },
  updateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  updateBadge: {
    backgroundColor: '#FF6B6B',
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  updateDate: {
    fontSize: 13,
    color: '#999',
    width: 50,
    marginRight: 8,
  },
  updateText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  updateArrow: {
    fontSize: 18,
    color: '#ccc',
    marginLeft: 8,
  },
});
