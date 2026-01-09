import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useChild } from '../../contexts/ChildContext';
import { schedulesApi } from '../../services/database';
import { Schedule, RecurrenceRule } from '../../types';

// 반복 일정을 확장하는 헬퍼 함수
function expandRecurringSchedules(schedules: Schedule[], startDate: Date, endDate: Date): Schedule[] {
  const expanded: Schedule[] = [];

  schedules.forEach(schedule => {
    if (!schedule.is_recurring || !schedule.recurrence_rule) {
      expanded.push(schedule);
      return;
    }

    try {
      const rule: RecurrenceRule = JSON.parse(schedule.recurrence_rule);
      if (rule.type !== 'weekly') return;

      const scheduleDate = new Date(schedule.start_time.split('T')[0]);
      const ruleEndDate = rule.endDate ? new Date(rule.endDate) : endDate;

      const current = new Date(Math.max(scheduleDate.getTime(), startDate.getTime()));
      while (current.getTime() <= Math.min(ruleEndDate.getTime(), endDate.getTime())) {
        const dayOfWeek = current.getDay();

        if (rule.days.includes(dayOfWeek)) {
          const dateStr = current.toISOString().split('T')[0];
          const timePart = schedule.start_time.split('T')[1];
          const endTimePart = schedule.end_time.split('T')[1];

          expanded.push({
            ...schedule,
            start_time: `${dateStr}T${timePart}`,
            end_time: `${dateStr}T${endTimePart}`,
          });
        }

        current.setDate(current.getDate() + 1);
      }
    } catch (error) {
      console.error('Failed to parse recurrence rule:', error);
      expanded.push(schedule);
    }
  });

  return expanded;
}

export default function HomeScreen() {
  const { selectedChild } = useChild();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (selectedChild) {
      loadSchedules();
    } else {
      setSchedules([]);
    }
  }, [selectedChild]);

  const loadSchedules = async () => {
    if (!selectedChild) return;

    setLoading(true);
    try {
      const data = await schedulesApi.getByChildId(selectedChild.id);
      setSchedules(data);
    } catch (error) {
      console.error('Failed to load schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSchedules();
    setRefreshing(false);
  };

  const formatTime = (dateString: string) => {
    const parts = dateString.split('T');
    if (parts.length < 2) return '';
    const timePart = parts[1].split('+')[0].split('-')[0].split('Z')[0];
    const [hour, minute] = timePart.split(':');
    return `${hour}:${minute}`;
  };

  const formatDate = (dateString: string) => {
    const datePart = dateString.split('T')[0];
    const [year, month, day] = datePart.split('-');
    return `${parseInt(month)}월 ${parseInt(day)}일`;
  };

  const getDayName = (dateString: string) => {
    const date = new Date(dateString.split('T')[0]);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[date.getDay()];
  };

  // 오늘 날짜
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // 다음 7일
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  // 반복 일정 확장
  const expandedSchedules = expandRecurringSchedules(schedules, today, nextWeek);

  // 오늘의 일정
  const todaySchedules = expandedSchedules
    .filter(s => s.start_time.split('T')[0] === todayStr)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  // 다가오는 일정 (오늘 제외, 다음 7일)
  const upcomingSchedules = expandedSchedules
    .filter(s => {
      const scheduleDate = s.start_time.split('T')[0];
      return scheduleDate > todayStr && scheduleDate <= nextWeek.toISOString().split('T')[0];
    })
    .sort((a, b) => a.start_time.localeCompare(b.start_time))
    .slice(0, 5); // 최대 5개만 표시

  // 이번 주 일정 수
  const thisWeekCount = expandedSchedules.filter(s => {
    const scheduleDate = new Date(s.start_time.split('T')[0]);
    return scheduleDate >= today && scheduleDate <= nextWeek;
  }).length;

  if (!selectedChild) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>환영합니다! 👋</Text>
          <Text style={styles.emptyText}>
            프로필 탭에서 자녀를 선택하거나{'\n'}
            새로운 자녀 프로필을 추가해주세요
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push('/profile')}
          >
            <Text style={styles.emptyButtonText}>프로필 설정하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>안녕하세요 👋</Text>
          <Text style={styles.childName}>{selectedChild.name}의 하루</Text>
        </View>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{formatDate(todayStr)}</Text>
          <Text style={styles.dayText}>{getDayName(todayStr)}요일</Text>
        </View>
      </View>

      {/* 통계 카드 */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{todaySchedules.length}</Text>
          <Text style={styles.statLabel}>오늘 일정</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{thisWeekCount}</Text>
          <Text style={styles.statLabel}>이번 주</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{upcomingSchedules.length}</Text>
          <Text style={styles.statLabel}>다가오는 일정</Text>
        </View>
      </View>

      {/* 빠른 액션 */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/schedule/add')}
        >
          <Text style={styles.actionIcon}>📅</Text>
          <Text style={styles.actionText}>일정 추가</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/records')}
        >
          <Text style={styles.actionIcon}>💊</Text>
          <Text style={styles.actionText}>치료 기록</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/milestone/list')}
        >
          <Text style={styles.actionIcon}>🎯</Text>
          <Text style={styles.actionText}>마일스톤</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/sensory/list')}
        >
          <Text style={styles.actionIcon}>🌈</Text>
          <Text style={styles.actionText}>감각 평가</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/schedule')}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionText}>전체 일정</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Text style={styles.actionIcon}>👤</Text>
          <Text style={styles.actionText}>프로필</Text>
        </TouchableOpacity>
      </View>

      {/* 오늘의 일정 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>오늘의 일정</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#007AFF" style={{ marginTop: 10 }} />
        ) : todaySchedules.length === 0 ? (
          <View style={styles.emptySection}>
            <Text style={styles.emptySectionText}>오늘은 등록된 일정이 없습니다</Text>
          </View>
        ) : (
          todaySchedules.map((schedule, index) => (
            <TouchableOpacity
              key={`${schedule.id}-${schedule.start_time}-${index}`}
              style={styles.scheduleCard}
              onPress={() => router.push(`/schedule/edit/${schedule.id}`)}
            >
              <View style={styles.scheduleTime}>
                <Text style={styles.scheduleTimeText}>{formatTime(schedule.start_time)}</Text>
              </View>
              <View style={styles.scheduleContent}>
                <Text style={styles.scheduleTitle}>{schedule.title}</Text>
                {schedule.description && (
                  <Text style={styles.scheduleDescription} numberOfLines={1}>
                    {schedule.description}
                  </Text>
                )}
                {schedule.reminder_minutes && (
                  <Text style={styles.scheduleReminder}>
                    ⏰ {schedule.reminder_minutes}분 전 알림
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* 다가오는 일정 */}
      {upcomingSchedules.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>다가오는 일정</Text>
          {upcomingSchedules.map((schedule, index) => (
            <TouchableOpacity
              key={`${schedule.id}-${schedule.start_time}-${index}`}
              style={styles.upcomingCard}
              onPress={() => router.push(`/schedule/edit/${schedule.id}`)}
            >
              <View style={styles.upcomingDate}>
                <Text style={styles.upcomingDateText}>
                  {formatDate(schedule.start_time)}
                </Text>
                <Text style={styles.upcomingDayText}>
                  {getDayName(schedule.start_time)}
                </Text>
              </View>
              <View style={styles.upcomingContent}>
                <Text style={styles.upcomingTitle}>{schedule.title}</Text>
                <Text style={styles.upcomingTime}>{formatTime(schedule.start_time)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  greeting: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  childName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dayText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flexBasis: '48%',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  emptySection: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptySectionText: {
    fontSize: 14,
    color: '#999',
  },
  scheduleCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  scheduleTime: {
    marginRight: 16,
    paddingTop: 2,
  },
  scheduleTimeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  scheduleDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  scheduleReminder: {
    fontSize: 12,
    color: '#FF9500',
  },
  upcomingCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  upcomingDate: {
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  upcomingDateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  upcomingDayText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  upcomingContent: {
    flex: 1,
    justifyContent: 'center',
  },
  upcomingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  upcomingTime: {
    fontSize: 14,
    color: '#007AFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
