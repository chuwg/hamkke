import { useState } from 'react';
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
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useChild } from '../../contexts/ChildContext';
import { sensoryProfilesApi } from '../../services/database';

const SENSORY_TYPES = [
  { key: 'visual', name: '시각', icon: '👁️', description: '빛, 색상, 시각적 패턴에 대한 반응' },
  { key: 'auditory', name: '청각', icon: '👂', description: '소리, 음량, 소음에 대한 반응' },
  { key: 'tactile', name: '촉각', icon: '✋', description: '촉감, 질감, 온도에 대한 반응' },
  { key: 'vestibular', name: '전정감각', icon: '🌀', description: '균형, 움직임, 자세에 대한 반응' },
  { key: 'proprioceptive', name: '고유수용감각', icon: '💪', description: '신체 위치, 힘 조절에 대한 인식' },
  { key: 'oral', name: '구강', icon: '👄', description: '맛, 식감, 온도에 대한 반응' },
];

// 오늘 날짜를 YYYY-MM-DD 형식으로 반환
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function AddSensoryProfileScreen() {
  const [date, setDate] = useState(getTodayDateString());
  const [scores, setScores] = useState({
    visual: 5,
    auditory: 5,
    tactile: 5,
    vestibular: 5,
    proprioceptive: 5,
    oral: 5,
  });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { selectedChild } = useChild();
  const router = useRouter();

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

  const updateScore = (key: string, value: number) => {
    setScores(prev => ({
      ...prev,
      [key]: Math.max(0, Math.min(10, value)),
    }));
  };

  const handleSave = async () => {
    if (!date) {
      if (typeof window !== 'undefined') {
        window.alert('날짜는 필수 항목입니다.');
      } else {
        Alert.alert('오류', '날짜는 필수 항목입니다.');
      }
      return;
    }

    if (!selectedChild) {
      if (typeof window !== 'undefined') {
        window.alert('먼저 프로필 탭에서 자녀를 선택해주세요.');
      } else {
        Alert.alert('오류', '자녀를 선택해주세요.');
      }
      return;
    }

    setLoading(true);
    try {
      await sensoryProfilesApi.create({
        child_id: selectedChild.id,
        date,
        visual: scores.visual,
        auditory: scores.auditory,
        tactile: scores.tactile,
        vestibular: scores.vestibular,
        proprioceptive: scores.proprioceptive,
        oral: scores.oral,
        notes: notes || undefined,
      });

      router.replace('/sensory/list');
    } catch (error) {
      if (typeof window !== 'undefined') {
        window.alert('감각 프로파일 추가 중 오류가 발생했습니다.');
      } else {
        Alert.alert('오류', '감각 프로파일 추가 중 오류가 발생했습니다.');
      }
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/sensory/list')}>
          <Text style={styles.cancelButton}>취소</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>감각 프로파일 추가</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.content}>
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
          <Text style={styles.hint}>평가한 날짜를 선택하세요</Text>
        </View>

        <View style={styles.scoresSection}>
          <Text style={styles.sectionTitle}>감각 영역 평가</Text>
          <Text style={styles.sectionHint}>각 영역을 0-10점으로 평가하세요 (0: 매우 낮음, 10: 매우 높음)</Text>

          {SENSORY_TYPES.map((type) => (
            <View key={type.key} style={styles.scoreItem}>
              <View style={styles.scoreHeader}>
                <View style={styles.scoreTitleRow}>
                  <Text style={styles.scoreIcon}>{type.icon}</Text>
                  <Text style={styles.scoreName}>{type.name}</Text>
                </View>
                <Text style={styles.scoreValue}>{scores[type.key as keyof typeof scores]}</Text>
              </View>
              <Text style={styles.scoreDescription}>{type.description}</Text>

              <View style={styles.sliderContainer}>
                <View style={styles.sliderButtons}>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                    <TouchableOpacity
                      key={value}
                      style={[
                        styles.sliderButton,
                        scores[type.key as keyof typeof scores] === value && styles.sliderButtonActive,
                      ]}
                      onPress={() => updateScore(type.key, value)}
                      disabled={loading}
                    >
                      <Text
                        style={[
                          styles.sliderButtonText,
                          scores[type.key as keyof typeof scores] === value && styles.sliderButtonTextActive,
                        ]}
                      >
                        {value}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>메모</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="관찰 내용이나 특이사항을 기록하세요"
            multiline
            numberOfLines={4}
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
    height: 100,
    paddingTop: 15,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  scoresSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionHint: {
    fontSize: 13,
    color: '#666',
    marginBottom: 20,
    lineHeight: 18,
  },
  scoreItem: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  scoreName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  scoreDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  sliderContainer: {
    marginTop: 8,
  },
  sliderButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  sliderButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  sliderButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  sliderButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
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
