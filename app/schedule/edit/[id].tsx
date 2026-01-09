import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useChild } from '../../../contexts/ChildContext';
import { schedulesApi } from '../../../services/database';
import { Schedule, RecurrenceRule } from '../../../types';
import { formatTimeString, isValidTime, toLocalISOString } from '../../../utils/dateFormat';
import { calendarService } from '../../../services/calendar';

export default function EditScheduleScreen() {
  const { id } = useLocalSearchParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [showRecurrenceEndDatePicker, setShowRecurrenceEndDatePicker] = useState(false);
  const [calendarEventId, setCalendarEventId] = useState<string | undefined>(undefined);
  const { selectedChild } = useChild();
  const router = useRouter();

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const toggleDay = (dayIndex: number) => {
    setSelectedDays(prev => {
      if (prev.includes(dayIndex)) {
        return prev.filter(d => d !== dayIndex);
      } else {
        return [...prev, dayIndex].sort();
      }
    });
  };

  const handleRecurrenceEndDateChange = (event: any, selectedDate?: Date) => {
    setShowRecurrenceEndDatePicker(false);
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      setRecurrenceEndDate(dateString);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, [id]);

  const loadSchedule = async () => {
    if (!selectedChild) return;

    try {
      const schedules = await schedulesApi.getByChildId(selectedChild.id);
      const schedule = schedules.find(s => s.id === id);

      if (schedule) {
        setTitle(schedule.title);
        setDescription(schedule.description || '');

        console.log('=== DB에서 불러온 값 ===');
        console.log('start_time:', schedule.start_time);
        console.log('end_time:', schedule.end_time);

        // ISO 문자열을 직접 파싱 (timezone 변환 없이)
        // 형식: "2024-01-01T10:00:00+09:00" 또는 "2024-01-01T10:00:00"
        const startParts = schedule.start_time.split('T');
        const endParts = schedule.end_time.split('T');

        // 날짜 (YYYY-MM-DD)
        setStartDate(startParts[0]);

        // 시간 (HH:MM) - timezone 정보 제거
        const startTimePart = startParts[1].split('+')[0].split('-')[0].split('Z')[0];
        const endTimePart = endParts[1].split('+')[0].split('-')[0].split('Z')[0];

        console.log('파싱된 날짜:', startParts[0]);
        console.log('파싱된 시작 시간:', startTimePart.substring(0, 5));
        console.log('파싱된 종료 시간:', endTimePart.substring(0, 5));

        setStartTime(startTimePart.substring(0, 5)); // HH:MM만 추출
        setEndTime(endTimePart.substring(0, 5)); // HH:MM만 추출

        if (schedule.reminder_minutes) {
          setReminderMinutes(String(schedule.reminder_minutes));
        }

        // 캘린더 이벤트 ID 저장
        if (schedule.calendar_event_id) {
          setCalendarEventId(schedule.calendar_event_id);
        }

        // 반복 규칙 파싱
        if (schedule.is_recurring && schedule.recurrence_rule) {
          try {
            const rule: RecurrenceRule = JSON.parse(schedule.recurrence_rule);
            setIsRecurring(true);
            setSelectedDays(rule.days);
            setRecurrenceEndDate(rule.endDate || '');
          } catch (error) {
            console.error('Failed to parse recurrence rule:', error);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load schedule:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      setStartDate(dateString);
    }
  };

  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      const hours = String(selectedTime.getHours()).padStart(2, '0');
      const minutes = String(selectedTime.getMinutes()).padStart(2, '0');
      setStartTime(`${hours}:${minutes}`);
    }
  };

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      const hours = String(selectedTime.getHours()).padStart(2, '0');
      const minutes = String(selectedTime.getMinutes()).padStart(2, '0');
      setEndTime(`${hours}:${minutes}`);
    }
  };

  const getTimeDate = (timeString: string) => {
    const today = new Date();
    if (timeString) {
      const [hours, minutes] = timeString.split(':');
      today.setHours(parseInt(hours) || 0);
      today.setMinutes(parseInt(minutes) || 0);
    }
    return today;
  };

  const getDate = (dateString: string) => {
    if (dateString) {
      return new Date(dateString + 'T00:00:00');
    }
    return new Date();
  };

  const handleSave = async () => {
    if (!title || !startDate || !startTime || !endTime) {
      Alert.alert('오류', '제목, 날짜, 시작 시간, 종료 시간은 필수 항목입니다.');
      return;
    }

    // 날짜 형식 확인 및 변환 (YYYYMMDD -> YYYY-MM-DD)
    let formattedDate = startDate;
    if (startDate && !startDate.includes('-')) {
      // YYYYMMDD 형식인 경우 YYYY-MM-DD로 변환
      if (startDate.length === 8) {
        formattedDate = `${startDate.substring(0, 4)}-${startDate.substring(4, 6)}-${startDate.substring(6, 8)}`;
      }
    }

    // 로컬 시간으로 ISO 문자열 생성
    const startDateTime = toLocalISOString(formattedDate, startTime);
    const endDateTime = toLocalISOString(formattedDate, endTime);

    // 시간 검증
    if (new Date(endDateTime) <= new Date(startDateTime)) {
      Alert.alert('오류', '종료 시간은 시작 시간보다 나중이어야 합니다.');
      return;
    }

    // 반복 일정 검증
    if (isRecurring && selectedDays.length === 0) {
      Alert.alert('오류', '반복할 요일을 하나 이상 선택해주세요.');
      return;
    }

    // 반복 규칙 생성
    let recurrenceRule: string | undefined = undefined;
    if (isRecurring) {
      const rule: RecurrenceRule = {
        type: 'weekly',
        days: selectedDays,
        endDate: recurrenceEndDate || undefined,
      };
      recurrenceRule = JSON.stringify(rule);
    }

    setLoading(true);
    try {
      // 네이티브 캘린더 이벤트 업데이트 (모바일만)
      let newCalendarEventId = calendarEventId;
      if (Platform.OS !== 'web') {
        if (calendarEventId) {
          // 기존 이벤트 업데이트
          const updated = await calendarService.updateEvent(calendarEventId, {
            title,
            startDate: new Date(startDateTime),
            endDate: new Date(endDateTime),
            notes: description || undefined,
            alarmOffset: reminderMinutes ? -parseInt(reminderMinutes) : undefined,
          });

          if (!updated) {
            // 업데이트 실패 시 새로 생성 (이벤트가 삭제되었을 수 있음)
            newCalendarEventId = await calendarService.createEvent({
              title,
              startDate: new Date(startDateTime),
              endDate: new Date(endDateTime),
              notes: description || undefined,
              alarmOffset: reminderMinutes ? -parseInt(reminderMinutes) : undefined,
            }) || undefined;
          }
        } else {
          // 캘린더 이벤트 ID가 없으면 새로 생성
          newCalendarEventId = await calendarService.createEvent({
            title,
            startDate: new Date(startDateTime),
            endDate: new Date(endDateTime),
            notes: description || undefined,
            alarmOffset: reminderMinutes ? -parseInt(reminderMinutes) : undefined,
          }) || undefined;
        }
      }

      await schedulesApi.update(id as string, {
        title,
        description: description || undefined,
        start_time: startDateTime,
        end_time: endDateTime,
        is_recurring: isRecurring,
        recurrence_rule: recurrenceRule,
        reminder_minutes: reminderMinutes ? parseInt(reminderMinutes) : undefined,
        calendar_event_id: newCalendarEventId,
      });

      router.replace('/(tabs)/schedule');
    } catch (error) {
      Alert.alert('오류', '일정 수정 중 오류가 발생했습니다.');
      console.error(error);
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/schedule')}>
          <Text style={styles.cancelButton}>취소</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>일정 수정</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>제목 *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="예: 언어 치료"
            editable={!loading}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>날짜 *</Text>
          {Platform.OS === 'web' ? (
            <TextInput
              style={styles.input}
              value={startDate}
              onChangeText={setStartDate}
              placeholder="YYYY-MM-DD"
              editable={!loading}
              // @ts-ignore - web only property
              type="date"
            />
          ) : (
            <>
              <TouchableOpacity
                style={styles.input}
                onPress={() => !loading && setShowDatePicker(true)}
                disabled={loading}
              >
                <Text style={startDate ? styles.inputText : styles.placeholderText}>
                  {startDate || 'YYYY-MM-DD (예: 2024-01-15)'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={getDate(startDate)}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                />
              )}
            </>
          )}
          <Text style={styles.hint}>날짜를 선택하세요</Text>
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>시작 시간 *</Text>
            {Platform.OS === 'web' ? (
              <TextInput
                style={styles.input}
                value={startTime}
                onChangeText={setStartTime}
                placeholder="HH:MM"
                editable={!loading}
                // @ts-ignore - web only property
                type="time"
              />
            ) : (
              <>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => !loading && setShowStartTimePicker(true)}
                  disabled={loading}
                >
                  <Text style={startTime ? styles.inputText : styles.placeholderText}>
                    {startTime || '시간 선택'}
                  </Text>
                </TouchableOpacity>
                {showStartTimePicker && (
                  <DateTimePicker
                    value={getTimeDate(startTime)}
                    mode="time"
                    is24Hour={true}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleStartTimeChange}
                  />
                )}
              </>
            )}
            <Text style={styles.hint}>시간을 선택하세요</Text>
          </View>

          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>종료 시간 *</Text>
            {Platform.OS === 'web' ? (
              <TextInput
                style={styles.input}
                value={endTime}
                onChangeText={setEndTime}
                placeholder="HH:MM"
                editable={!loading}
                // @ts-ignore - web only property
                type="time"
              />
            ) : (
              <>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => !loading && setShowEndTimePicker(true)}
                  disabled={loading}
                >
                  <Text style={endTime ? styles.inputText : styles.placeholderText}>
                    {endTime || '시간 선택'}
                  </Text>
                </TouchableOpacity>
                {showEndTimePicker && (
                  <DateTimePicker
                    value={getTimeDate(endTime)}
                    mode="time"
                    is24Hour={true}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleEndTimeChange}
                  />
                )}
              </>
            )}
            <Text style={styles.hint}>시간을 선택하세요</Text>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>설명</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="일정에 대한 추가 설명 (선택사항)"
            multiline
            numberOfLines={4}
            editable={!loading}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>알림 (분 전)</Text>
          <TextInput
            style={styles.input}
            value={reminderMinutes}
            onChangeText={setReminderMinutes}
            placeholder="예: 30 (30분 전 알림)"
            keyboardType="numeric"
            editable={!loading}
          />
          <Text style={styles.hint}>예: 30 (30분 전), 60 (1시간 전)</Text>
        </View>

        <View style={styles.formGroup}>
          <View style={styles.checkboxRow}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => !loading && setIsRecurring(!isRecurring)}
              disabled={loading}
            >
              <View style={[styles.checkboxBox, isRecurring && styles.checkboxBoxChecked]}>
                {isRecurring && <Text style={styles.checkboxCheck}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>매주 반복</Text>
            </TouchableOpacity>
          </View>

          {isRecurring && (
            <>
              <Text style={[styles.label, { marginTop: 15 }]}>반복할 요일</Text>
              <View style={styles.daysContainer}>
                {weekDays.map((day, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayButton,
                      selectedDays.includes(index) && styles.dayButtonSelected,
                    ]}
                    onPress={() => !loading && toggleDay(index)}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.dayButtonText,
                        selectedDays.includes(index) && styles.dayButtonTextSelected,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { marginTop: 15 }]}>반복 종료 날짜 (선택사항)</Text>
              {Platform.OS === 'web' ? (
                <TextInput
                  style={styles.input}
                  value={recurrenceEndDate}
                  onChangeText={setRecurrenceEndDate}
                  placeholder="YYYY-MM-DD"
                  editable={!loading}
                  // @ts-ignore - web only property
                  type="date"
                />
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.input}
                    onPress={() => !loading && setShowRecurrenceEndDatePicker(true)}
                    disabled={loading}
                  >
                    <Text style={recurrenceEndDate ? styles.inputText : styles.placeholderText}>
                      {recurrenceEndDate || '날짜 선택 (선택사항)'}
                    </Text>
                  </TouchableOpacity>
                  {showRecurrenceEndDatePicker && (
                    <DateTimePicker
                      value={getDate(recurrenceEndDate)}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={handleRecurrenceEndDateChange}
                    />
                  )}
                </>
              )}
              <Text style={styles.hint}>비워두면 무기한 반복됩니다</Text>
            </>
          )}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>저장</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
  cancelButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    justifyContent: 'center',
  },
  inputText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  textArea: {
    height: 100,
    paddingTop: 15,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonDisabled: {
    backgroundColor: '#999',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxBoxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkboxCheck: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  dayButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  dayButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  dayButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  dayButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
});
