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
import { useTheme } from '../../contexts/ThemeContext';
import { schedulesApi, therapyRecordsApi, milestonesApi } from '../../services/localStorage';
import { Schedule, RecurrenceRule, TherapyRecord, Milestone } from '../../types';
import { formatDateShort, formatTimeFromISO, getDayName } from '../../utils/dateFormat';

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
      expanded.push(schedule);
    }
  });

  return expanded;
}

export default function HomeScreen() {
  const { selectedChild } = useChild();
  const { theme } = useTheme();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [therapyRecords, setTherapyRecords] = useState<TherapyRecord[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const dynamicStyles = {
    container: { backgroundColor: theme.colors.background },
    header: { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border },
    greeting: { color: theme.colors.textSecondary },
    childName: { color: theme.colors.text },
    dateText: { color: theme.colors.text },
    dayText: { color: theme.colors.textSecondary },
    statCard: { backgroundColor: theme.colors.card },
    statNumber: { color: theme.colors.accent },
    statLabel: { color: theme.colors.textSecondary },
    actionButton: { backgroundColor: theme.colors.primary },
    sectionTitle: { color: theme.colors.text },
    emptySection: { backgroundColor: theme.colors.card },
    emptySectionText: { color: theme.colors.textMuted },
    scheduleCard: { backgroundColor: theme.colors.card },
    scheduleTimeText: { color: theme.colors.accent },
    scheduleTitle: { color: theme.colors.text },
    scheduleDescription: { color: theme.colors.textSecondary },
    upcomingCard: { backgroundColor: theme.colors.card },
    upcomingDateText: { color: theme.colors.text },
    upcomingDayText: { color: theme.colors.textSecondary },
    upcomingTitle: { color: theme.colors.text },
    upcomingTime: { color: theme.colors.accent },
    emptyTitle: { color: theme.colors.text },
    emptyText: { color: theme.colors.textSecondary },
    emptyButton: { backgroundColor: theme.colors.accent },
  };

  useEffect(() => {
    if (selectedChild) {
      loadData();
    } else {
      setSchedules([]);
      setTherapyRecords([]);
      setMilestones([]);
    }
  }, [selectedChild]);

  const loadData = async () => {
    if (!selectedChild) return;

    setLoading(true);
    try {
      const [scheduleData, therapyData, milestoneData] = await Promise.all([
        schedulesApi.getByChildId(selectedChild.id),
        therapyRecordsApi.getByChildId(selectedChild.id),
        milestonesApi.getByChildId(selectedChild.id),
      ]);
      setSchedules(scheduleData);
      setTherapyRecords(therapyData);
      setMilestones(milestoneData);
    } catch (error) {
      // load failure handled by UI state
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatTime = formatTimeFromISO;
  const formatDate = formatDateShort;

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

  // 치료 기록 요약
  const lastTherapy = therapyRecords.length > 0
    ? therapyRecords.sort((a, b) => b.date.localeCompare(a.date))[0]
    : null;

  const thisMonthTherapyHours = therapyRecords
    .filter(r => {
      const month = r.date.substring(0, 7);
      const currentMonth = todayStr.substring(0, 7);
      return month === currentMonth;
    })
    .reduce((sum, r) => sum + r.duration_minutes, 0);

  // 자녀 나이 계산
  const getChildAge = () => {
    if (!selectedChild?.birth_date) return '';
    const birth = new Date(selectedChild.birth_date);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    if (months < 0) { years--; months += 12; }
    if (now.getDate() < birth.getDate()) months--;
    if (months < 0) { years--; months += 12; }
    if (years > 0) return `${years}세 ${months}개월`;
    return `${months}개월`;
  };

  // 마일스톤 진행률
  const totalMilestones = milestones.length;
  const achievedMilestones = milestones.filter(m => m.achieved).length;
  const milestonePercent = totalMilestones > 0 ? Math.round((achievedMilestones / totalMilestones) * 100) : 0;

  if (!selectedChild) {
    return (
      <View style={[styles.container, dynamicStyles.container]}>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, dynamicStyles.emptyTitle]}>환영합니다! 👋</Text>
          <Text style={[styles.emptyText, dynamicStyles.emptyText]}>
            프로필 탭에서 자녀를 선택하거나{'\n'}
            새로운 자녀 프로필을 추가해주세요
          </Text>
          <TouchableOpacity
            style={[styles.emptyButton, dynamicStyles.emptyButton]}
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
      style={[styles.container, dynamicStyles.container]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
      }
    >
      {/* 헤더 */}
      <View style={[styles.header, dynamicStyles.header]}>
        <View>
          <Text style={[styles.greeting, dynamicStyles.greeting]}>안녕하세요 👋</Text>
          <Text style={[styles.childName, dynamicStyles.childName]}>{selectedChild.name}의 하루</Text>
          {getChildAge() ? (
            <Text style={[styles.childAge, dynamicStyles.dayText]}>{getChildAge()}</Text>
          ) : null}
        </View>
        <View style={styles.dateContainer}>
          <Text style={[styles.dateText, dynamicStyles.dateText]}>{formatDate(todayStr)}</Text>
          <Text style={[styles.dayText, dynamicStyles.dayText]}>{getDayName(todayStr)}요일</Text>
        </View>
      </View>

      {/* 통계 카드 */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, dynamicStyles.statCard]}>
          <Text style={[styles.statNumber, dynamicStyles.statNumber]}>{todaySchedules.length}</Text>
          <Text style={[styles.statLabel, dynamicStyles.statLabel]}>오늘 일정</Text>
        </View>
        <View style={[styles.statCard, dynamicStyles.statCard]}>
          <Text style={[styles.statNumber, dynamicStyles.statNumber]}>{thisWeekCount}</Text>
          <Text style={[styles.statLabel, dynamicStyles.statLabel]}>이번 주</Text>
        </View>
        <View style={[styles.statCard, dynamicStyles.statCard]}>
          <Text style={[styles.statNumber, dynamicStyles.statNumber]}>{upcomingSchedules.length}</Text>
          <Text style={[styles.statLabel, dynamicStyles.statLabel]}>다가오는 일정</Text>
        </View>
      </View>

      {/* 활동 요약 */}
      {(therapyRecords.length > 0 || milestones.length > 0) && (
        <View style={styles.summarySection}>
          {lastTherapy && (
            <TouchableOpacity
              style={[styles.summaryCard, dynamicStyles.statCard]}
              onPress={() => router.push('/(tabs)/records')}
            >
              <Text style={styles.summaryIcon}>💊</Text>
              <View style={styles.summaryContent}>
                <Text style={[styles.summaryLabel, dynamicStyles.statLabel]}>마지막 치료</Text>
                <Text style={[styles.summaryValue, dynamicStyles.statNumber]}>
                  {formatDate(lastTherapy.date)}
                </Text>
                <Text style={[styles.summarySubtext, dynamicStyles.statLabel]}>
                  {lastTherapy.therapy_type} · {lastTherapy.duration_minutes}분
                </Text>
              </View>
            </TouchableOpacity>
          )}
          {thisMonthTherapyHours > 0 && (
            <TouchableOpacity
              style={[styles.summaryCard, dynamicStyles.statCard]}
              onPress={() => router.push('/(tabs)/records')}
            >
              <Text style={styles.summaryIcon}>⏱️</Text>
              <View style={styles.summaryContent}>
                <Text style={[styles.summaryLabel, dynamicStyles.statLabel]}>이번 달 치료</Text>
                <Text style={[styles.summaryValue, dynamicStyles.statNumber]}>
                  {Math.floor(thisMonthTherapyHours / 60)}시간 {thisMonthTherapyHours % 60}분
                </Text>
              </View>
            </TouchableOpacity>
          )}
          {totalMilestones > 0 && (
            <TouchableOpacity
              style={[styles.summaryCard, dynamicStyles.statCard]}
              onPress={() => router.push('/milestone/list')}
            >
              <Text style={styles.summaryIcon}>🎯</Text>
              <View style={styles.summaryContent}>
                <Text style={[styles.summaryLabel, dynamicStyles.statLabel]}>마일스톤 달성</Text>
                <Text style={[styles.summaryValue, dynamicStyles.statNumber]}>
                  {milestonePercent}%
                </Text>
                <Text style={[styles.summarySubtext, dynamicStyles.statLabel]}>
                  {achievedMilestones}/{totalMilestones} 완료
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* 빠른 액션 */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.actionButton, dynamicStyles.actionButton]}
          onPress={() => router.push('/schedule/add')}
        >
          <Text style={styles.actionIcon}>📅</Text>
          <Text style={styles.actionText}>일정 추가</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, dynamicStyles.actionButton]}
          onPress={() => router.push('/(tabs)/records')}
        >
          <Text style={styles.actionIcon}>💊</Text>
          <Text style={styles.actionText}>치료 기록</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, dynamicStyles.actionButton]}
          onPress={() => router.push('/milestone/list')}
        >
          <Text style={styles.actionIcon}>🎯</Text>
          <Text style={styles.actionText}>마일스톤</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, dynamicStyles.actionButton]}
          onPress={() => router.push('/sensory/list')}
        >
          <Text style={styles.actionIcon}>🌈</Text>
          <Text style={styles.actionText}>감각 평가</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, dynamicStyles.actionButton]}
          onPress={() => router.push('/(tabs)/schedule')}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionText}>전체 일정</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, dynamicStyles.actionButton]}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Text style={styles.actionIcon}>👤</Text>
          <Text style={styles.actionText}>프로필</Text>
        </TouchableOpacity>
      </View>

      {/* 오늘의 일정 */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>오늘의 일정</Text>
        {loading ? (
          <ActivityIndicator size="small" color={theme.colors.accent} style={{ marginTop: 10 }} />
        ) : todaySchedules.length === 0 ? (
          <TouchableOpacity
            style={[styles.emptySection, dynamicStyles.emptySection]}
            onPress={() => router.push('/schedule/add')}
          >
            <Text style={[styles.emptySectionText, dynamicStyles.emptySectionText]}>오늘은 여유로운 하루예요</Text>
            <Text style={[styles.emptySectionHint, { color: theme.colors.accent }]}>+ 일정 추가하기</Text>
          </TouchableOpacity>
        ) : (
          todaySchedules.map((schedule, index) => (
            <TouchableOpacity
              key={`${schedule.id}-${schedule.start_time}-${index}`}
              style={[styles.scheduleCard, dynamicStyles.scheduleCard]}
              onPress={() => router.push(`/schedule/edit/${schedule.id}`)}
            >
              <View style={styles.scheduleTime}>
                <Text style={[styles.scheduleTimeText, dynamicStyles.scheduleTimeText]}>{formatTime(schedule.start_time)}</Text>
              </View>
              <View style={styles.scheduleContent}>
                <Text style={[styles.scheduleTitle, dynamicStyles.scheduleTitle]}>{schedule.title}</Text>
                {schedule.description && (
                  <Text style={[styles.scheduleDescription, dynamicStyles.scheduleDescription]} numberOfLines={1}>
                    {schedule.description}
                  </Text>
                )}
                {schedule.reminder_minutes && (
                  <Text style={[styles.scheduleReminder, { color: theme.colors.warning }]}>
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
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>다가오는 일정</Text>
          {upcomingSchedules.map((schedule, index) => (
            <TouchableOpacity
              key={`${schedule.id}-${schedule.start_time}-${index}`}
              style={[styles.upcomingCard, dynamicStyles.upcomingCard]}
              onPress={() => router.push(`/schedule/edit/${schedule.id}`)}
            >
              <View style={styles.upcomingDate}>
                <Text style={[styles.upcomingDateText, dynamicStyles.upcomingDateText]}>
                  {formatDate(schedule.start_time)}
                </Text>
                <Text style={[styles.upcomingDayText, dynamicStyles.upcomingDayText]}>
                  {getDayName(schedule.start_time)}
                </Text>
              </View>
              <View style={styles.upcomingContent}>
                <Text style={[styles.upcomingTitle, dynamicStyles.upcomingTitle]}>{schedule.title}</Text>
                <Text style={[styles.upcomingTime, dynamicStyles.upcomingTime]}>{formatTime(schedule.start_time)}</Text>
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
  childAge: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
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
  summarySection: {
    paddingHorizontal: 20,
    marginBottom: 8,
    gap: 10,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  summaryIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  summarySubtext: {
    fontSize: 12,
    marginTop: 2,
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
  emptySectionHint: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
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
