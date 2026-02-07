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
  SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useChild } from '../../contexts/ChildContext';
import { useTheme } from '../../contexts/ThemeContext';
import { schedulesApi } from '../../services/localStorage';
import { formatTimeString, isValidTime, toLocalISOString } from '../../utils/dateFormat';
import { RecurrenceRule } from '../../types';
import { calendarService } from '../../services/calendar';
import { notificationService } from '../../services/notifications';

// 오늘 날짜를 YYYY-MM-DD 형식으로 반환
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function AddScheduleScreen() {
  const { date } = useLocalSearchParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [showRecurrenceEndDatePicker, setShowRecurrenceEndDatePicker] = useState(false);
  const { selectedChild } = useChild();
  const { theme } = useTheme();
  const router = useRouter();

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const dynamicStyles = {
    container: { backgroundColor: theme.colors.background },
    header: { borderBottomColor: theme.colors.border },
    cancelButton: { color: theme.colors.accent },
    headerTitle: { color: theme.colors.text },
    label: { color: theme.colors.text },
    input: { borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text },
    inputText: { color: theme.colors.text },
    placeholderText: { color: theme.colors.textMuted },
    hint: { color: theme.colors.textMuted },
    checkboxLabel: { color: theme.colors.text },
    checkboxBox: { borderColor: theme.colors.border },
    dayButton: { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
    dayButtonText: { color: theme.colors.textSecondary },
  };

  // 달력에서 전달받은 날짜가 있으면 자동으로 설정
  useEffect(() => {
    console.log('=== 전달받은 날짜 ===');
    console.log('date 파라미터:', date);
    if (date && typeof date === 'string') {
      console.log('날짜 자동 설정:', date);
      setStartDate(date);
    }
  }, [date]);

  const toggleDay = (dayIndex: number) => {
    setSelectedDays(prev => {
      if (prev.includes(dayIndex)) {
        return prev.filter(d => d !== dayIndex);
      } else {
        return [...prev, dayIndex].sort();
      }
    });
  };

  // 로컬 날짜를 YYYY-MM-DD 형식으로 변환 (UTC 변환 오류 방지)
  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleRecurrenceEndDateChange = (event: any, selectedDate?: Date) => {
    setShowRecurrenceEndDatePicker(false);
    if (selectedDate) {
      const dateString = formatLocalDate(selectedDate);
      setRecurrenceEndDate(dateString);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const dateString = formatLocalDate(selectedDate);
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
    console.log('=== handleSave 실행 ===');
    console.log('title:', title);
    console.log('startDate:', startDate);
    console.log('startTime:', startTime);
    console.log('endTime:', endTime);
    console.log('selectedChild:', selectedChild);

    if (!title || !startDate || !startTime || !endTime) {
      console.log('필수 필드 누락');
      if (typeof window !== 'undefined') {
        window.alert('제목, 날짜, 시작 시간, 종료 시간은 필수 항목입니다.');
      } else {
        Alert.alert('오류', '제목, 날짜, 시작 시간, 종료 시간은 필수 항목입니다.');
      }
      return;
    }

    if (!selectedChild) {
      console.log('자녀 미선택');
      if (typeof window !== 'undefined') {
        window.alert('먼저 프로필 탭에서 자녀를 선택해주세요.');
      } else {
        Alert.alert('오류', '자녀를 선택해주세요.');
      }
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

    console.log('=== 저장할 값 ===');
    console.log('입력한 날짜:', startDate);
    console.log('변환된 날짜:', formattedDate);
    console.log('입력한 시작 시간:', startTime);
    console.log('입력한 종료 시간:', endTime);
    console.log('변환된 시작 시간:', startDateTime);
    console.log('변환된 종료 시간:', endDateTime);

    // 시간 검증
    if (new Date(endDateTime) <= new Date(startDateTime)) {
      if (typeof window !== 'undefined') {
        window.alert('종료 시간은 시작 시간보다 나중이어야 합니다.');
      } else {
        Alert.alert('오류', '종료 시간은 시작 시간보다 나중이어야 합니다.');
      }
      return;
    }

    // 반복 일정 검증
    if (isRecurring && selectedDays.length === 0) {
      if (typeof window !== 'undefined') {
        window.alert('반복할 요일을 하나 이상 선택해주세요.');
      } else {
        Alert.alert('오류', '반복할 요일을 하나 이상 선택해주세요.');
      }
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
      console.log('=== 데이터베이스 저장 시작 ===');

      // 네이티브 캘린더에 이벤트 생성 (모바일만)
      let calendarEventId: string | undefined = undefined;
      if (Platform.OS !== 'web') {
        console.log('=== 캘린더 이벤트 생성 시작 ===');
        calendarEventId = await calendarService.createEvent({
          title,
          startDate: new Date(startDateTime),
          endDate: new Date(endDateTime),
          notes: description || undefined,
          alarmOffset: reminderMinutes ? -parseInt(reminderMinutes) : undefined,
        }) || undefined;
        console.log('=== 캘린더 이벤트 생성 완료 ===', calendarEventId);
      }

      const result = await schedulesApi.create({
        child_id: selectedChild.id,
        title,
        description: description || undefined,
        start_time: startDateTime,
        end_time: endDateTime,
        is_recurring: isRecurring,
        recurrence_rule: recurrenceRule,
        reminder_minutes: reminderMinutes ? parseInt(reminderMinutes) : undefined,
        calendar_event_id: calendarEventId,
      });
      console.log('=== 저장 성공 ===', result);

      // 푸시 알림 스케줄링
      if (reminderMinutes && result?.id) {
        const notificationTime = notificationService.calculateNotificationTime(
          new Date(startDateTime),
          parseInt(reminderMinutes)
        );

        await notificationService.scheduleNotification({
          scheduleId: result.id,
          title: `${selectedChild.name} - ${title}`,
          body: `${parseInt(reminderMinutes)}분 후 일정이 있습니다`,
          scheduledTime: notificationTime,
          data: { type: 'schedule', scheduleId: result.id },
        });
        console.log('=== 푸시 알림 스케줄링 완료 ===');
      }

      console.log('=== 네비게이션 시작 ===');
      router.replace('/(tabs)/schedule');
      console.log('=== 네비게이션 완료 ===');
    } catch (error) {
      console.log('=== 저장 실패 ===');
      if (typeof window !== 'undefined') {
        window.alert('일정 추가 중 오류가 발생했습니다.');
      } else {
        Alert.alert('오류', '일정 추가 중 오류가 발생했습니다.');
      }
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, dynamicStyles.container]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, dynamicStyles.container]}
      >
        <View style={[styles.header, dynamicStyles.header]}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/schedule')}
            style={styles.cancelButtonWrapper}
          >
            <Text style={[styles.cancelButton, dynamicStyles.cancelButton]}>취소</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>일정 추가</Text>
          <View style={{ width: 50 }} />
        </View>

      <ScrollView style={styles.content}>
        <View style={styles.formGroup}>
          <Text style={[styles.label, dynamicStyles.label]}>제목 *</Text>
          <TextInput
            style={[styles.input, dynamicStyles.input]}
            value={title}
            onChangeText={setTitle}
            placeholder="예: 언어 치료"
            placeholderTextColor={theme.colors.textMuted}
            editable={!loading}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, dynamicStyles.label]}>날짜 *</Text>
          {Platform.OS === 'web' ? (
            <TextInput
              style={[styles.input, dynamicStyles.input]}
              value={startDate}
              onChangeText={setStartDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.colors.textMuted}
              editable={!loading}
              // @ts-ignore - web only property
              type="date"
            />
          ) : (
            <>
              <TouchableOpacity
                style={[styles.input, dynamicStyles.input]}
                onPress={() => !loading && setShowDatePicker(true)}
                disabled={loading}
              >
                <Text style={startDate ? [styles.inputText, dynamicStyles.inputText] : [styles.placeholderText, dynamicStyles.placeholderText]}>
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
          <Text style={[styles.hint, dynamicStyles.hint]}>날짜를 선택하세요</Text>
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={[styles.label, dynamicStyles.label]}>시작 시간 *</Text>
            {Platform.OS === 'web' ? (
              <TextInput
                style={[styles.input, dynamicStyles.input]}
                value={startTime}
                onChangeText={setStartTime}
                placeholder="HH:MM"
                placeholderTextColor={theme.colors.textMuted}
                editable={!loading}
                // @ts-ignore - web only property
                type="time"
              />
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.input, dynamicStyles.input]}
                  onPress={() => !loading && setShowStartTimePicker(true)}
                  disabled={loading}
                >
                  <Text style={startTime ? [styles.inputText, dynamicStyles.inputText] : [styles.placeholderText, dynamicStyles.placeholderText]}>
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
            <Text style={[styles.hint, dynamicStyles.hint]}>시간을 선택하세요</Text>
          </View>

          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={[styles.label, dynamicStyles.label]}>종료 시간 *</Text>
            {Platform.OS === 'web' ? (
              <TextInput
                style={[styles.input, dynamicStyles.input]}
                value={endTime}
                onChangeText={setEndTime}
                placeholder="HH:MM"
                placeholderTextColor={theme.colors.textMuted}
                editable={!loading}
                // @ts-ignore - web only property
                type="time"
              />
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.input, dynamicStyles.input]}
                  onPress={() => !loading && setShowEndTimePicker(true)}
                  disabled={loading}
                >
                  <Text style={endTime ? [styles.inputText, dynamicStyles.inputText] : [styles.placeholderText, dynamicStyles.placeholderText]}>
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
            <Text style={[styles.hint, dynamicStyles.hint]}>시간을 선택하세요</Text>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, dynamicStyles.label]}>설명</Text>
          <TextInput
            style={[styles.input, styles.textArea, dynamicStyles.input]}
            value={description}
            onChangeText={setDescription}
            placeholder="일정에 대한 추가 설명 (선택사항)"
            placeholderTextColor={theme.colors.textMuted}
            multiline
            numberOfLines={4}
            editable={!loading}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, dynamicStyles.label]}>알림 (분 전)</Text>
          <TextInput
            style={[styles.input, dynamicStyles.input]}
            value={reminderMinutes}
            onChangeText={setReminderMinutes}
            placeholder="예: 30 (30분 전 알림)"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="numeric"
            editable={!loading}
          />
          <Text style={[styles.hint, dynamicStyles.hint]}>예: 30 (30분 전), 60 (1시간 전)</Text>
        </View>

        <View style={styles.formGroup}>
          <View style={styles.checkboxRow}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => !loading && setIsRecurring(!isRecurring)}
              disabled={loading}
            >
              <View style={[styles.checkboxBox, dynamicStyles.checkboxBox, isRecurring && styles.checkboxBoxChecked, isRecurring && { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent }]}>
                {isRecurring && <Text style={styles.checkboxCheck}>✓</Text>}
              </View>
              <Text style={[styles.checkboxLabel, dynamicStyles.checkboxLabel]}>매주 반복</Text>
            </TouchableOpacity>
          </View>

          {isRecurring && (
            <>
              <Text style={[styles.label, dynamicStyles.label, { marginTop: 15 }]}>반복할 요일</Text>
              <View style={styles.daysContainer}>
                {weekDays.map((day, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayButton,
                      dynamicStyles.dayButton,
                      selectedDays.includes(index) && styles.dayButtonSelected,
                      selectedDays.includes(index) && { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent },
                    ]}
                    onPress={() => !loading && toggleDay(index)}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.dayButtonText,
                        dynamicStyles.dayButtonText,
                        selectedDays.includes(index) && styles.dayButtonTextSelected,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, dynamicStyles.label, { marginTop: 15 }]}>반복 종료 날짜 (선택사항)</Text>
              {Platform.OS === 'web' ? (
                <TextInput
                  style={[styles.input, dynamicStyles.input]}
                  value={recurrenceEndDate}
                  onChangeText={setRecurrenceEndDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.colors.textMuted}
                  editable={!loading}
                  // @ts-ignore - web only property
                  type="date"
                />
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.input, dynamicStyles.input]}
                    onPress={() => !loading && setShowRecurrenceEndDatePicker(true)}
                    disabled={loading}
                  >
                    <Text style={recurrenceEndDate ? [styles.inputText, dynamicStyles.inputText] : [styles.placeholderText, dynamicStyles.placeholderText]}>
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
              <Text style={[styles.hint, dynamicStyles.hint]}>비워두면 무기한 반복됩니다</Text>
            </>
          )}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.colors.primary }, loading && styles.saveButtonDisabled]}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  cancelButtonWrapper: {
    padding: 5,
    minWidth: 50,
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
