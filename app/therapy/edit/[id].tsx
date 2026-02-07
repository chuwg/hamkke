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
import { therapyRecordsApi } from '../../../services/localStorage';

const THERAPY_TYPES = [
  '언어치료',
  '작업치료',
  '행동치료',
  '음악치료',
  '미술치료',
  '감각통합치료',
  '물리치료',
  '기타',
];

export default function EditTherapyRecordScreen() {
  const { id } = useLocalSearchParams();
  const [therapyType, setTherapyType] = useState('');
  const [customTherapyType, setCustomTherapyType] = useState('');
  const [date, setDate] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [therapistName, setTherapistName] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { selectedChild } = useChild();
  const router = useRouter();

  useEffect(() => {
    loadRecord();
  }, [id]);

  const loadRecord = async () => {
    if (!selectedChild) return;

    try {
      const records = await therapyRecordsApi.getByChildId(selectedChild.id);
      const record = records.find(r => r.id === id);

      if (record) {
        if (THERAPY_TYPES.includes(record.therapy_type)) {
          setTherapyType(record.therapy_type);
        } else {
          setTherapyType('기타');
          setCustomTherapyType(record.therapy_type);
        }
        setDate(record.date);
        setDurationMinutes(String(record.duration_minutes));
        setTherapistName(record.therapist_name || '');
        setNotes(record.notes || '');
      }
    } catch (error) {
      console.error('Failed to load therapy record:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      setDate(dateString);
    }
  };

  const getDate = (dateString: string) => {
    if (dateString) {
      return new Date(dateString + 'T00:00:00');
    }
    return new Date();
  };

  const handleSave = async () => {
    const finalTherapyType = therapyType === '기타' ? customTherapyType : therapyType;

    if (!finalTherapyType || !date || !durationMinutes) {
      if (typeof window !== 'undefined') {
        window.alert('치료 유형, 날짜, 치료 시간은 필수 항목입니다.');
      } else {
        Alert.alert('오류', '치료 유형, 날짜, 치료 시간은 필수 항목입니다.');
      }
      return;
    }

    const duration = parseInt(durationMinutes);
    if (isNaN(duration) || duration <= 0) {
      if (typeof window !== 'undefined') {
        window.alert('치료 시간은 1 이상의 숫자를 입력해주세요.');
      } else {
        Alert.alert('오류', '치료 시간은 1 이상의 숫자를 입력해주세요.');
      }
      return;
    }

    setLoading(true);
    try {
      await therapyRecordsApi.update(id as string, {
        therapy_type: finalTherapyType,
        date,
        duration_minutes: duration,
        therapist_name: therapistName || undefined,
        notes: notes || undefined,
      });

      router.replace('/(tabs)/records');
    } catch (error) {
      if (typeof window !== 'undefined') {
        window.alert('치료 기록 수정 중 오류가 발생했습니다.');
      } else {
        Alert.alert('오류', '치료 기록 수정 중 오류가 발생했습니다.');
      }
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
        <TouchableOpacity onPress={() => router.push('/(tabs)/records')}>
          <Text style={styles.cancelButton}>취소</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>치료 기록 수정</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>치료 유형 *</Text>
          <View style={styles.therapyTypeGrid}>
            {THERAPY_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.therapyTypeButton,
                  therapyType === type && styles.therapyTypeButtonActive,
                ]}
                onPress={() => setTherapyType(type)}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.therapyTypeButtonText,
                    therapyType === type && styles.therapyTypeButtonTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {therapyType === '기타' && (
            <TextInput
              style={[styles.input, { marginTop: 10 }]}
              value={customTherapyType}
              onChangeText={setCustomTherapyType}
              placeholder="치료 유형을 입력하세요"
              editable={!loading}
            />
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>날짜 *</Text>
          {Platform.OS === 'web' ? (
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
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
                <Text style={date ? styles.inputText : styles.placeholderText}>
                  {date || 'YYYY-MM-DD'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={getDate(date)}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                />
              )}
            </>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>치료 시간 (분) *</Text>
          <TextInput
            style={styles.input}
            value={durationMinutes}
            onChangeText={setDurationMinutes}
            placeholder="예: 60"
            keyboardType="numeric"
            editable={!loading}
          />
          <Text style={styles.hint}>분 단위로 입력하세요 (예: 30분, 60분)</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>치료사 이름</Text>
          <TextInput
            style={styles.input}
            value={therapistName}
            onChangeText={setTherapistName}
            placeholder="예: 김선생님"
            editable={!loading}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>메모</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="치료 내용, 아이 반응 등을 기록하세요"
            multiline
            numberOfLines={6}
            editable={!loading}
          />
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
    height: 120,
    paddingTop: 15,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  therapyTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  therapyTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  therapyTypeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  therapyTypeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  therapyTypeButtonTextActive: {
    color: '#fff',
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
});
