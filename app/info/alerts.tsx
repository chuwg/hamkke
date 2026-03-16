import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Linking,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import {
  WelfareAlert,
  fetchWelfareAlerts,
  searchWelfareAlerts,
  fetchWelfareStats,
} from '../../services/welfareAlertApi';
import { getBookmarkIds, toggleBookmark } from '../../services/bookmarkApi';

const CATEGORIES = ['전체', '지원금/바우처', '특수교육', '재활/치료', '돌봄/활동지원', '장애인복지', '채용/공고'];

export default function AlertsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [alerts, setAlerts] = useState<WelfareAlert[]>([]);
  const [filtered, setFiltered] = useState<WelfareAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('전체');
  const [totalCount, setTotalCount] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());

  const ds = {
    container: { backgroundColor: theme.colors.background },
    header: { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border },
    headerTitle: { color: theme.colors.text },
    searchInput: { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border },
    card: { backgroundColor: theme.colors.card },
    title: { color: theme.colors.text },
    meta: { color: theme.colors.textSecondary },
    statCard: { backgroundColor: theme.colors.card },
    statNum: { color: theme.colors.accent },
    statLabel: { color: theme.colors.textSecondary },
  };

  const loadData = useCallback(async () => {
    try {
      const [posts, stats, bmIds] = await Promise.all([
        fetchWelfareAlerts(100, 0, 'disability'),
        fetchWelfareStats('disability'),
        getBookmarkIds(),
      ]);
      setAlerts(posts);
      setTotalCount(stats.total);
      setTodayCount(stats.today);
      setBookmarkedIds(bmIds);
      applyFilter(posts, selectedCat, search);
    } catch (error) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const applyFilter = (data: WelfareAlert[], cat: string, keyword: string) => {
    let result = data;
    if (cat !== '전체') {
      result = result.filter((a) => a.category === cat);
    }
    if (keyword.trim()) {
      const kw = keyword.toLowerCase();
      result = result.filter((a) => a.title.toLowerCase().includes(kw) || (a.summary || '').toLowerCase().includes(kw));
    }
    setFiltered(result);
  };

  const handleSearch = async (text: string) => {
    setSearch(text);
    if (text.trim().length >= 2) {
      try {
        const results = await searchWelfareAlerts(text.trim(), 50, 'disability');
        setFiltered(selectedCat === '전체' ? results : results.filter((a) => a.category === selectedCat));
      } catch {
        applyFilter(alerts, selectedCat, text);
      }
    } else {
      applyFilter(alerts, selectedCat, text);
    }
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCat(cat);
    applyFilter(alerts, cat, search);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const openUrl = async (url: string) => {
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      try {
        await Linking.openURL(url);
      } catch {}
    }
  };

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      '지원금/바우처': '#4ECDC4',
      '특수교육': '#FF6B6B',
      '재활/치료': '#95E1D3',
      '돌봄/활동지원': '#F3A683',
      '장애인복지': '#786FA6',
      '채용/공고': '#F8A5C2',
      '일반': '#AAAAAA',
    };
    return colors[cat] || '#AAAAAA';
  };

  const handleBookmark = async (item: WelfareAlert) => {
    const added = await toggleBookmark(item);
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (added) next.add(item.id); else next.delete(item.id);
      return next;
    });
  };

  const renderAlert = ({ item }: { item: WelfareAlert }) => (
    <TouchableOpacity style={[styles.card, ds.card]} onPress={() => openUrl(item.source_url)}>
      <View style={styles.cardHeader}>
        <Text style={[styles.source, { color: theme.colors.accent }]}>{item.source}</Text>
        <View style={styles.cardHeaderRight}>
          <Text style={[styles.date, ds.meta]}>{item.date}</Text>
          <TouchableOpacity onPress={() => handleBookmark(item)} style={styles.bookmarkBtn}>
            <Text style={{ fontSize: 18 }}>{bookmarkedIds.has(item.id) ? '\u2605' : '\u2606'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={[styles.title, ds.title]} numberOfLines={2}>{item.title}</Text>
      {item.summary ? <Text style={[styles.summary, ds.meta]} numberOfLines={2}>{item.summary}</Text> : null}
      <View style={styles.cardFooter}>
        <View style={[styles.badge, { backgroundColor: getCategoryColor(item.category) + '20' }]}>
          <Text style={[styles.badgeText, { color: getCategoryColor(item.category) }]}>{item.category || '일반'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.center, ds.container]}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
        <Text style={[styles.loadingText, ds.meta]}>복지 알림을 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, ds.container]}>
      {/* 헤더 */}
      <View style={[styles.header, ds.header]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.backBtn, { color: theme.colors.accent }]}>← 뒤로</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, ds.headerTitle]}>복지 알림</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* 통계 */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, ds.statCard]}>
            <Text style={[styles.statNum, ds.statNum]}>{totalCount}</Text>
            <Text style={[styles.statLabel, ds.statLabel]}>전체</Text>
          </View>
          <View style={[styles.statCard, ds.statCard]}>
            <Text style={[styles.statNum, ds.statNum]}>{todayCount}</Text>
            <Text style={[styles.statLabel, ds.statLabel]}>오늘</Text>
          </View>
          <View style={[styles.statCard, ds.statCard]}>
            <Text style={[styles.statNum, ds.statNum]}>{filtered.length}</Text>
            <Text style={[styles.statLabel, ds.statLabel]}>검색결과</Text>
          </View>
        </View>

        {/* 검색 */}
        <TextInput
          style={[styles.searchInput, ds.searchInput]}
          placeholder="검색어 입력 (장애, 바우처, 치료...)"
          placeholderTextColor={theme.colors.textMuted}
          value={search}
          onChangeText={handleSearch}
        />

        {/* 카테고리 필터 */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          style={styles.catList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.catBtn,
                selectedCat === item && { backgroundColor: theme.colors.accent },
                selectedCat !== item && { backgroundColor: theme.colors.background, borderColor: theme.colors.border, borderWidth: 1 },
              ]}
              onPress={() => handleCategoryChange(item)}
            >
              <Text style={[
                styles.catBtnText,
                selectedCat === item ? { color: '#fff' } : { color: theme.colors.textSecondary },
              ]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* 게시물 목록 */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderAlert}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.accent} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={[styles.emptyText, ds.meta]}>검색 결과가 없습니다.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 12, fontSize: 14 },
  emptyText: { fontSize: 15 },
  header: { paddingTop: 50, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  backBtn: { fontSize: 16, fontWeight: '500' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statCard: { flex: 1, alignItems: 'center', padding: 10, borderRadius: 10 },
  statNum: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 11, marginTop: 2 },
  searchInput: { height: 42, borderRadius: 10, paddingHorizontal: 14, fontSize: 14, borderWidth: 1, marginBottom: 10 },
  catList: { marginBottom: 4 },
  catBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18, marginRight: 8 },
  catBtnText: { fontSize: 13, fontWeight: '500' },
  listContent: { padding: 16 },
  card: { borderRadius: 12, padding: 14, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bookmarkBtn: { padding: 2 },
  source: { fontSize: 12, fontWeight: '600' },
  date: { fontSize: 12 },
  title: { fontSize: 15, fontWeight: '500', lineHeight: 22 },
  summary: { fontSize: 13, lineHeight: 18, marginTop: 6 },
  cardFooter: { marginTop: 8 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '600' },
});
