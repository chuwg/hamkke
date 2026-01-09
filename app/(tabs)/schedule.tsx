import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import { useChild } from '../../contexts/ChildContext';
import { schedulesApi } from '../../services/database';
import { Schedule, RecurrenceRule } from '../../types';
import { calendarService } from '../../services/calendar';

// 반복 일정을 확장하는 헬퍼 함수
function expandRecurringSchedules(schedules: Schedule[], startDate: Date, endDate: Date): Schedule[] {
  const expanded: Schedule[] = [];

  schedules.forEach(schedule => {
    if (!schedule.is_recurring || !schedule.recurrence_rule) {
      // 일반 일정은 그대로 추가
      expanded.push(schedule);
      return;
    }

    try {
      const rule: RecurrenceRule = JSON.parse(schedule.recurrence_rule);
      if (rule.type !== 'weekly') return;

      const scheduleDate = new Date(schedule.start_time.split('T')[0]);
      const ruleEndDate = rule.endDate ? new Date(rule.endDate) : endDate;

      // 시작 날짜부터 종료 날짜까지 반복
      const current = new Date(Math.max(scheduleDate.getTime(), startDate.getTime()));
      while (current <= Math.min(ruleEndDate, endDate)) {
        const dayOfWeek = current.getDay(); // 0=일요일, 6=토요일

        if (rule.days.includes(dayOfWeek)) {
          // 해당 요일에 일정 추가
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

export default function ScheduleScreen() {
  const { selectedChild } = useChild();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedDate, setSelectedDate] = useState('');
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

  const handleAddSchedule = () => {
    if (!selectedChild) {
      if (typeof window !== 'undefined') {
        window.alert('먼저 프로필 탭에서 자녀를 선택해주세요.');
      }
      return;
    }
    // 달력에서 선택한 날짜가 있으면 파라미터로 전달
    if (selectedDate) {
      router.push(`/schedule/add?date=${selectedDate}`);
    } else {
      router.push('/schedule/add');
    }
  };

  const handleEditSchedule = (scheduleId: string) => {
    router.push(`/schedule/edit/${scheduleId}`);
  };

  const handleDeleteSchedule = async (scheduleId: string, title: string, calendarEventId?: string) => {
    if (typeof window !== 'undefined' && window.confirm) {
      const confirmed = window.confirm(`"${title}" 일정을 삭제하시겠습니까?`);

      if (confirmed) {
        try {
          // 네이티브 캘린더 이벤트 삭제 (모바일만)
          if (Platform.OS !== 'web' && calendarEventId) {
            await calendarService.deleteEvent(calendarEventId);
          }

          await schedulesApi.delete(scheduleId);
          await loadSchedules();
        } catch (error) {
          console.error('Delete error:', error);
          window.alert('삭제 중 오류가 발생했습니다.');
        }
      }
    }
  };

  const formatDateTime = (dateString: string) => {
    // ISO 문자열을 직접 파싱 (timezone 변환 없이)
    const parts = dateString.split('T');
    if (parts.length < 2) return dateString;

    const datePart = parts[0]; // YYYY-MM-DD
    const timePart = parts[1].split('+')[0].split('-')[0].split('Z')[0]; // HH:MM:SS

    const [year, month, day] = datePart.split('-');
    const [hour, minute] = timePart.split(':');

    return `${parseInt(month)}월 ${parseInt(day)}일 ${hour}:${minute}`;
  };

  const formatDate = (dateString: string) => {
    // ISO 문자열에서 날짜 부분만 파싱
    const datePart = dateString.split('T')[0]; // YYYY-MM-DD
    const [year, month, day] = datePart.split('-');

    return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
  };

  // 반복 일정 확장 (현재 달 ± 3개월)
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);
  const endDate = new Date(today.getFullYear(), today.getMonth() + 4, 0);
  const expandedSchedules = expandRecurringSchedules(schedules, startDate, endDate);

  // 달력에 표시할 마킹된 날짜 생성
  const getMarkedDates = () => {
    const marked: any = {};

    expandedSchedules.forEach(schedule => {
      // ISO 문자열에서 날짜 부분만 추출 (timezone 변환 없이)
      const date = schedule.start_time.split('T')[0];
      if (!marked[date]) {
        marked[date] = { marked: true, dotColor: '#007AFF' };
      }
    });

    // 선택된 날짜 표시
    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: '#007AFF',
      };
    }

    return marked;
  };

  // 날짜 필터링 (모든 뷰 모드에서 적용)
  const filteredSchedules = expandedSchedules.filter(schedule => {
    if (!selectedDate) return true;
    const scheduleDate = schedule.start_time.split('T')[0];
    return scheduleDate === selectedDate;
  });

  if (!selectedChild) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>프로필 탭에서 자녀를 선택해주세요</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>일정 관리</Text>
          <Text style={styles.subtitle}>{selectedChild.name}의 일정</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddSchedule}>
          <Text style={styles.addButtonText}>+ 추가</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'calendar' && styles.toggleButtonActive]}
          onPress={() => setViewMode('calendar')}
        >
          <Text style={[styles.toggleButtonText, viewMode === 'calendar' && styles.toggleButtonTextActive]}>
            달력
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
          onPress={() => setViewMode('list')}
        >
          <Text style={[styles.toggleButtonText, viewMode === 'list' && styles.toggleButtonTextActive]}>
            목록
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      ) : schedules.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>등록된 일정이 없습니다</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={handleAddSchedule}>
            <Text style={styles.emptyButtonText}>첫 일정 추가하기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {viewMode === 'calendar' && (
            <Calendar
              markedDates={getMarkedDates()}
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
              }}
              theme={{
                selectedDayBackgroundColor: '#007AFF',
                todayTextColor: '#007AFF',
                dotColor: '#007AFF',
                arrowColor: '#007AFF',
              }}
            />
          )}

          {selectedDate && (
            <View style={styles.dateHeader}>
              <Text style={styles.dateHeaderText}>
                {formatDate(selectedDate)}
              </Text>
              <TouchableOpacity onPress={() => setSelectedDate('')}>
                <Text style={styles.clearDateText}>전체 보기</Text>
              </TouchableOpacity>
            </View>
          )}

          <FlatList
          data={filteredSchedules}
          keyExtractor={(item, index) => `${item.id}-${item.start_time}-${index}`}
          renderItem={({ item }) => (
            <View style={styles.scheduleCard}>
              <View style={styles.scheduleHeader}>
                <View style={styles.scheduleMain}>
                  <Text style={styles.scheduleTitle}>{item.title}</Text>
                  <Text style={styles.scheduleDate}>
                    {formatDate(item.start_time)}
                  </Text>
                  <Text style={styles.scheduleTime}>
                    {formatDateTime(item.start_time)} - {formatDateTime(item.end_time)}
                  </Text>
                  {item.description && (
                    <Text style={styles.scheduleDescription}>{item.description}</Text>
                  )}
                  {item.reminder_minutes && (
                    <Text style={styles.scheduleReminder}>
                      ⏰ {item.reminder_minutes}분 전 알림
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.scheduleActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEditSchedule(item.id)}
                >
                  <Text style={styles.actionButtonText}>수정</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteSchedule(item.id, item.title, item.calendar_event_id)}
                >
                  <Text style={[styles.actionButtonText, styles.deleteButtonText]}>삭제</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={{ padding: 20 }}
        />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  scheduleCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scheduleMain: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  scheduleDate: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 4,
  },
  scheduleTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  scheduleDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  scheduleReminder: {
    fontSize: 12,
    color: '#FF9500',
  },
  scheduleActions: {
    flexDirection: 'row',
    marginTop: 12,
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
  viewToggle: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 10,
    gap: 10,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 15,
    paddingBottom: 10,
    backgroundColor: '#f8f8f8',
  },
  dateHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  clearDateText: {
    fontSize: 14,
    color: '#007AFF',
  },
});
