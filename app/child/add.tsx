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
import { useChild } from '../../contexts/ChildContext';
import { useTheme } from '../../contexts/ThemeContext';
import { formatDateString, isValidDate } from '../../utils/dateFormat';

export default function AddChildScreen() {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { addChild } = useChild();
  const { theme } = useTheme();
  const router = useRouter();

  const ds = {
    container: { backgroundColor: theme.colors.background },
    header: { borderBottomColor: theme.colors.border },
    cancelButton: { color: theme.colors.accent },
    headerTitle: { color: theme.colors.text },
    label: { color: theme.colors.text },
    input: { borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text },
    hint: { color: theme.colors.textMuted },
    saveButton: { backgroundColor: theme.colors.primary },
  };

  const handleSave = async () => {
    if (!name || !birthDate) {
      Alert.alert('오류', '이름과 생년월일은 필수 항목입니다.');
      return;
    }

    // 날짜 자동 포맷팅
    const formattedDate = formatDateString(birthDate);

    // 날짜 유효성 검증
    if (!isValidDate(formattedDate)) {
      Alert.alert('오류', '올바른 생년월일을 입력해주세요.\n예: 20200115 또는 2020-01-15');
      return;
    }

    setLoading(true);
    try {
      await addChild({
        name,
        birth_date: formattedDate,
        diagnosis: diagnosis || undefined,
        notes: notes || undefined,
      });

      // 웹에서는 바로 이동
      router.replace('/(tabs)/profile');
    } catch (error) {
      Alert.alert('오류', '프로필 추가 중 오류가 발생했습니다.');
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
        <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
          <Text style={[styles.cancelButton, ds.cancelButton]}>취소</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, ds.headerTitle]}>프로필 추가</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formGroup}>
          <Text style={[styles.label, ds.label]}>이름 *</Text>
          <TextInput
            style={[styles.input, ds.input]}
            value={name}
            onChangeText={setName}
            placeholder="아이의 이름"
            placeholderTextColor={theme.colors.textMuted}
            editable={!loading}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, ds.label]}>생년월일 *</Text>
          <TextInput
            style={[styles.input, ds.input]}
            value={birthDate}
            onChangeText={setBirthDate}
            placeholder="20200115 또는 2020-01-15"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="numeric"
            editable={!loading}
          />
          <Text style={[styles.hint, ds.hint]}>숫자만 입력하세요 (예: 20200115)</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, ds.label]}>진단명</Text>
          <TextInput
            style={[styles.input, ds.input]}
            value={diagnosis}
            onChangeText={setDiagnosis}
            placeholder="진단명 (선택사항)"
            placeholderTextColor={theme.colors.textMuted}
            editable={!loading}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, ds.label]}>메모</Text>
          <TextInput
            style={[styles.input, styles.textArea, ds.input]}
            value={notes}
            onChangeText={setNotes}
            placeholder="추가 메모 (선택사항)"
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
});
