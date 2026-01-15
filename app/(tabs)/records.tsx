import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useChild } from '../../contexts/ChildContext';
import { useTheme } from '../../contexts/ThemeContext';
import { therapyRecordsApi } from '../../services/database';
import { TherapyRecord } from '../../types';
import BarChart from '../../components/BarChart';
import PieChart from '../../components/PieChart';

export default function RecordsScreen() {
  const { selectedChild } = useChild();
  const { theme } = useTheme();
  const [records, setRecords] = useState<TherapyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const ds = {
    container: { backgroundColor: theme.colors.background },
    header: { borderBottomColor: theme.colors.border },
    title: { color: theme.colors.text },
    subtitle: { color: theme.colors.textMuted },
    statCard: { backgroundColor: theme.colors.card },
    statNumber: { color: theme.colors.accent },
    statLabel: { color: theme.colors.textSecondary },
    chartSection: { backgroundColor: theme.colors.card },
    chartTitle: { color: theme.colors.text },
    listTitle: { color: theme.colors.text },
    emptyText: { color: theme.colors.textMuted },
    recordCard: { backgroundColor: theme.colors.card },
    recordDate: { color: theme.colors.textSecondary },
    recordInfoLabel: { color: theme.colors.textMuted },
    recordInfoValue: { color: theme.colors.text },
    recordNotes: { color: theme.colors.textSecondary },
    recordActions: { borderTopColor: theme.colors.border },
  };

  useEffect(() => {
    if (selectedChild) {
      loadRecords();
    } else {
      setRecords([]);
    }
  }, [selectedChild]);

  const loadRecords = async () => {
    if (!selectedChild) return;

    setLoading(true);
    try {
      const data = await therapyRecordsApi.getByChildId(selectedChild.id);
      setRecords(data);
    } catch (error) {
      console.error('Failed to load therapy records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = () => {
    if (!selectedChild) {
      if (typeof window !== 'undefined') {
        window.alert('먼저 프로필 탭에서 자녀를 선택해주세요.');
      }
      return;
    }
    router.push('/therapy/add');
  };

  const handleEditRecord = (recordId: string) => {
    router.push(`/therapy/edit/${recordId}`);
  };

  const handleDeleteRecord = async (recordId: string, therapyType: string) => {
    if (typeof window !== 'undefined' && window.confirm) {
      const confirmed = window.confirm(`"${therapyType}" 기록을 삭제하시겠습니까?`);

      if (confirmed) {
        try {
          await therapyRecordsApi.delete(recordId);
          await loadRecords();
        } catch (error) {
          console.error('Delete error:', error);
          window.alert('삭제 중 오류가 발생했습니다.');
        }
      }
    }
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
  };

  const getTherapyTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      '언어치료': '#FF6B6B',
      '작업치료': '#4ECDC4',
      '행동치료': '#95E1D3',
      '음악치료': '#F3A683',
      '미술치료': '#786FA6',
      '감각통합치료': '#F8B500',
      '물리치료': '#63C7FF',
    };
    return colors[type] || '#007AFF';
  };

  // 통계 계산
  const totalSessions = records.length;
  const totalHours = Math.floor(records.reduce((sum, r) => sum + r.duration_minutes, 0) / 60);
  const thisMonthRecords = records.filter(r => {
    const recordDate = new Date(r.date);
    const now = new Date();
    return recordDate.getMonth() === now.getMonth() &&
           recordDate.getFullYear() === now.getFullYear();
  }).length;

  // 월별 치료 횟수 (최근 6개월)
  const getMonthlyData = () => {
    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    const now = new Date();
    const data = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.getMonth();
      const year = date.getFullYear();

      const count = records.filter(r => {
        const recordDate = new Date(r.date);
        return recordDate.getMonth() === month && recordDate.getFullYear() === year;
      }).length;

      data.push({
        label: monthNames[month],
        value: count,
      });
    }

    return data;
  };

  // 치료 유형별 횟수
  const getTherapyTypeData = () => {
    const typeCount: { [key: string]: number } = {};

    records.forEach(r => {
      if (typeCount[r.therapy_type]) {
        typeCount[r.therapy_type]++;
      } else {
        typeCount[r.therapy_type] = 1;
      }
    });

    return Object.entries(typeCount).map(([label, value]) => ({
      label,
      value,
      color: getTherapyTypeColor(label),
    }));
  };

  const monthlyData = getMonthlyData();
  const therapyTypeData = getTherapyTypeData();

  if (!selectedChild) {
    return (
      <View style={[styles.container, ds.container]}>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, ds.emptyText]}>프로필 탭에서 자녀를 선택해주세요</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, ds.container]}>
      <View style={[styles.header, ds.header]}>
        <View>
          <Text style={[styles.title, ds.title]}>치료 기록</Text>
          <Text style={[styles.subtitle, ds.subtitle]}>{selectedChild.name}의 치료 기록</Text>
        </View>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.colors.accent }]} onPress={handleAddRecord}>
          <Text style={styles.addButtonText}>+ 추가</Text>
        </TouchableOpacity>
      </View>

      {/* 통계 카드 */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, ds.statCard]}>
          <Text style={[styles.statNumber, ds.statNumber]}>{totalSessions}</Text>
          <Text style={[styles.statLabel, ds.statLabel]}>총 세션</Text>
        </View>
        <View style={[styles.statCard, ds.statCard]}>
          <Text style={[styles.statNumber, ds.statNumber]}>{totalHours}h</Text>
          <Text style={[styles.statLabel, ds.statLabel]}>총 시간</Text>
        </View>
        <View style={[styles.statCard, ds.statCard]}>
          <Text style={[styles.statNumber, ds.statNumber]}>{thisMonthRecords}</Text>
          <Text style={[styles.statLabel, ds.statLabel]}>이번 달</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.accent} style={{ marginTop: 20 }} />
      ) : records.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, ds.emptyText]}>등록된 치료 기록이 없습니다</Text>
          <TouchableOpacity style={[styles.emptyButton, { backgroundColor: theme.colors.accent }]} onPress={handleAddRecord}>
            <Text style={styles.emptyButtonText}>첫 기록 추가하기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View style={styles.chartsContainer}>
              {/* 월별 치료 횟수 차트 */}
              <View style={[styles.chartSection, ds.chartSection]}>
                <Text style={[styles.chartTitle, ds.chartTitle]}>월별 치료 횟수</Text>
                <BarChart data={monthlyData} width={340} height={180} />
              </View>

              {/* 치료 유형별 비율 차트 */}
              {therapyTypeData.length > 0 && (
                <View style={[styles.chartSection, ds.chartSection]}>
                  <Text style={[styles.chartTitle, ds.chartTitle]}>치료 유형별 비율</Text>
                  <PieChart data={therapyTypeData} size={180} />
                </View>
              )}

              <Text style={[styles.listTitle, ds.listTitle]}>치료 기록 목록</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.recordCard, ds.recordCard]}>
              <View style={styles.recordHeader}>
                <View
                  style={[
                    styles.therapyTypeBadge,
                    { backgroundColor: getTherapyTypeColor(item.therapy_type) },
                  ]}
                >
                  <Text style={styles.therapyTypeText}>{item.therapy_type}</Text>
                </View>
                <Text style={[styles.recordDate, ds.recordDate]}>{formatDate(item.date)}</Text>
              </View>

              <View style={styles.recordContent}>
                <View style={styles.recordInfo}>
                  <Text style={[styles.recordInfoLabel, ds.recordInfoLabel]}>치료 시간</Text>
                  <Text style={[styles.recordInfoValue, ds.recordInfoValue]}>{item.duration_minutes}분</Text>
                </View>
                {item.therapist_name && (
                  <View style={styles.recordInfo}>
                    <Text style={[styles.recordInfoLabel, ds.recordInfoLabel]}>치료사</Text>
                    <Text style={[styles.recordInfoValue, ds.recordInfoValue]}>{item.therapist_name}</Text>
                  </View>
                )}
              </View>

              {item.notes && (
                <Text style={[styles.recordNotes, ds.recordNotes]} numberOfLines={2}>
                  {item.notes}
                </Text>
              )}

              <View style={[styles.recordActions, ds.recordActions]}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.colors.accent }]}
                  onPress={() => handleEditRecord(item.id)}
                >
                  <Text style={styles.actionButtonText}>수정</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteRecord(item.id, item.therapy_type)}
                >
                  <Text style={[styles.actionButtonText, styles.deleteButtonText]}>삭제</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={{ padding: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chartsContainer: {
    marginBottom: 20,
  },
  chartSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  recordCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  therapyTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  therapyTypeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  recordDate: {
    fontSize: 14,
    color: '#666',
  },
  recordContent: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  recordInfo: {
    flex: 1,
  },
  recordInfoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  recordInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  recordNotes: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  recordActions: {
    flexDirection: 'row',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#007AFF',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
  },
  deleteButtonText: {
    color: '#fff',
  },
});
