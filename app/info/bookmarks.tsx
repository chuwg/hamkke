import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import type { WelfareAlert } from '../../services/welfareAlertApi';
import { getBookmarks, removeBookmark } from '../../services/bookmarkApi';

export default function BookmarksScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [bookmarks, setBookmarks] = useState<WelfareAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const ds = {
    container: { backgroundColor: theme.colors.background },
    header: { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border },
    headerTitle: { color: theme.colors.text },
    card: { backgroundColor: theme.colors.card },
    title: { color: theme.colors.text },
    meta: { color: theme.colors.textSecondary },
  };

  const loadData = useCallback(async () => {
    const items = await getBookmarks();
    setBookmarks(items);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const openUrl = async (url: string) => {
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      try { await Linking.openURL(url); } catch {}
    }
  };

  const handleRemove = async (id: number) => {
    await removeBookmark(id);
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const getTargetLabel = (target: string) => target === 'child' ? '아동' : '장애아동';

  const renderItem = ({ item }: { item: WelfareAlert }) => (
    <TouchableOpacity style={[styles.card, ds.card]} onPress={() => openUrl(item.source_url)}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={[styles.targetBadge, { backgroundColor: item.target === 'child' ? '#FF9F4320' : '#2563EB20' }]}>
            <Text style={{ fontSize: 11, color: item.target === 'child' ? '#FF9F43' : '#2563EB', fontWeight: '600' }}>
              {getTargetLabel(item.target)}
            </Text>
          </View>
          <Text style={[styles.source, { color: theme.colors.accent }]}>{item.source}</Text>
        </View>
        <TouchableOpacity onPress={() => handleRemove(item.id)} style={styles.removeBtn}>
          <Text style={{ fontSize: 16, color: '#FF6B6B' }}>{'\u2715'}</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.title, ds.title]} numberOfLines={2}>{item.title}</Text>
      <Text style={[styles.date, ds.meta]}>{item.date}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.center, ds.container]}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, ds.container]}>
      <View style={[styles.header, ds.header]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.backBtn, { color: theme.colors.accent }]}>{'\u2190'} 뒤로</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, ds.headerTitle]}>{'\u2605'} 즐겨찾기 ({bookmarks.length})</Text>
          <View style={{ width: 60 }} />
        </View>
      </View>

      <FlatList
        data={bookmarks}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={[styles.emptyText, ds.meta]}>{'\u2606'} 즐겨찾기한 복지 정보가 없습니다.</Text>
            <Text style={[styles.emptySubText, ds.meta]}>알림 목록에서 {'\u2606'} 를 눌러 저장하세요.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  header: { paddingTop: 50, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { fontSize: 16, fontWeight: '500' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  listContent: { padding: 16 },
  card: { borderRadius: 12, padding: 14, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  targetBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  source: { fontSize: 12, fontWeight: '600' },
  date: { fontSize: 12, marginTop: 6 },
  title: { fontSize: 15, fontWeight: '500', lineHeight: 22 },
  removeBtn: { padding: 4 },
  emptyText: { fontSize: 16, marginBottom: 8 },
  emptySubText: { fontSize: 13 },
});
