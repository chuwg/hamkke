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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useChild } from '../../contexts/ChildContext';
import { useTheme } from '../../contexts/ThemeContext';
import { milestonesApi } from '../../services/localStorage';

const CATEGORIES = [
  { id: 'social', name: '사회성', icon: '👥' },
  { id: 'communication', name: '의사소통', icon: '💬' },
  { id: 'motor', name: '운동능력', icon: '🏃' },
  { id: 'cognitive', name: '인지', icon: '🧠' },
];

export default function AddMilestoneScreen() {
  const [category, setCategory] = useState('');
  const [milestone, setMilestone] = useState('');
  const [achieved, setAchieved] = useState(false);
  const [achievedDate, setAchievedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { selectedChild } = useChild();
  const { theme } = useTheme();
  const router = useRouter();

  const ds = {
    container: { backgroundColor: theme.colors.background },
    header: { borderBottomColor: theme.colors.border },
    cancelButton: { color: theme.colors.accent },
    headerTitle: { color: theme.colors.text },
    label: { color: theme.colors.text },
    input: { borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text },
    categoryButton: { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
    categoryButtonText: { color: theme.colors.textSecondary },
    inputText: { color: theme.colors.text },
    placeholderText: { color: theme.colors.textMuted },
    checkboxLabel: { color: theme.colors.text },
    saveButton: { backgroundColor: theme.colors.primary },
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      setAchievedDate(dateString);
    }
  };

  const getDate = (dateString: string) => {
    if (dateString) {
      return new Date(dateString + 'T00:00:00');
    }
    return new Date();
  };

  const handleSave = async () => {
    if (!category || !milestone) {
      if (typeof window !== 'undefined') {
        window.alert('카테고리와 마일스톤 내용은 필수 항목입니다.');
      } else {
        Alert.alert('오류', '카테고리와 마일스톤 내용은 필수 항목입니다.');
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

    if (achieved && !achievedDate) {
      if (typeof window !== 'undefined') {
        window.alert('달성한 경우 달성 날짜를 입력해주세요.');
      } else {
        Alert.alert('오류', '달성한 경우 달성 날짜를 입력해주세요.');
      }
      return;
    }

    setLoading(true);
    try {
      await milestonesApi.create({
        child_id: selectedChild.id,
        category,
        milestone,
        achieved,
        achieved_date: achieved && achievedDate ? achievedDate : undefined,
        notes: notes || undefined,
      });

      router.replace('/milestone/list');
    } catch (error) {
      if (typeof window !== 'undefined') {
        window.alert('마일스톤 추가 중 오류가 발생했습니다.');
      } else {
        Alert.alert('오류', '마일스톤 추가 중 오류가 발생했습니다.');
      }
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, ds.container]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flexOne}
      >
        <View style={[styles.header, ds.header]}>
          <TouchableOpacity onPress={() => router.push('/milestone/list')}>
            <Text style={[styles.cancelButton, ds.cancelButton]}>취소</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, ds.headerTitle]}>마일스톤 추가</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.formGroup}>
            <Text style={[styles.label, ds.label]}>카테고리 *</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryButton,
                    ds.categoryButton,
                    category === cat.id && styles.categoryButtonActive,
                  ]}
                  onPress={() => setCategory(cat.id)}
                  disabled={loading}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text
                    style={[
                      styles.categoryButtonText,
                      ds.categoryButtonText,
                      category === cat.id && styles.categoryButtonTextActive,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, ds.label]}>마일스톤 내용 *</Text>
            <TextInput
              style={[styles.input, styles.textArea, ds.input]}
              value={milestone}
              onChangeText={setMilestone}
              placeholder="예: 눈을 마주치며 웃는다"
              placeholderTextColor={theme.colors.textMuted}
              multiline
              numberOfLines={3}
              editable={!loading}
            />
          </View>

          <View style={styles.formGroup}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setAchieved(!achieved)}
              disabled={loading}
            >
              <View style={[styles.checkboxBox, achieved && styles.checkboxBoxChecked]}>
                {achieved && <Text style={styles.checkboxCheck}>✓</Text>}
              </View>
              <Text style={[styles.checkboxLabel, ds.checkboxLabel]}>달성함</Text>
            </TouchableOpacity>
          </View>

          {achieved && (
            <View style={styles.formGroup}>
              <Text style={[styles.label, ds.label]}>달성 날짜 *</Text>
              {Platform.OS === 'web' ? (
                <TextInput
                  style={[styles.input, ds.input]}
                  value={achievedDate}
                  onChangeText={setAchievedDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.colors.textMuted}
                  editable={!loading}
                  // @ts-ignore - web only property
                  type="date"
                />
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.input, ds.input]}
                    onPress={() => !loading && setShowDatePicker(true)}
                    disabled={loading}
                  >
                    <Text style={achievedDate ? [styles.inputText, ds.inputText] : [styles.placeholderText, ds.placeholderText]}>
                      {achievedDate || 'YYYY-MM-DD'}
                    </Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={getDate(achievedDate)}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={handleDateChange}
                    />
                  )}
                </>
              )}
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={[styles.label, ds.label]}>메모</Text>
            <TextInput
              style={[styles.input, styles.textArea, ds.input]}
              value={notes}
              onChangeText={setNotes}
              placeholder="관련 메모나 관찰 내용을 기록하세요"
              placeholderTextColor={theme.colors.textMuted}
              multiline
              numberOfLines={4}
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, ds.saveButton, loading && styles.saveButtonDisabled]}
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flexOne: {
    flex: 1,
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
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    minWidth: '45%',
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  categoryButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  checkboxRow: {
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
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
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
