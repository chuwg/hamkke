import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { testConnection } from '../../services/database';

export default function HomeScreen() {
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('');

  const handleTestConnection = async () => {
    setTesting(true);
    setConnectionStatus('연결 테스트 중...');

    try {
      const result = await testConnection();
      setConnectionStatus(result.message);

      if (result.success) {
        Alert.alert('성공', 'Supabase 연결이 정상적으로 작동합니다!');
      } else {
        Alert.alert('오류', `연결 실패: ${result.message}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '알 수 없는 오류';
      setConnectionStatus(`오류: ${message}`);
      Alert.alert('오류', message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>함께크는에 오신 것을 환영합니다</Text>
      <Text style={styles.subtitle}>자폐 아동을 위한 케어 앱</Text>

      <View style={styles.content}>
        <Text style={styles.description}>
          일정 관리, 감각 프로파일, 치료 기록, 발달 마일스톤을{'\n'}
          한 곳에서 관리하세요.
        </Text>

        <TouchableOpacity
          style={styles.testButton}
          onPress={handleTestConnection}
          disabled={testing}
        >
          <Text style={styles.testButtonText}>
            {testing ? '테스트 중...' : 'Supabase 연결 테스트'}
          </Text>
        </TouchableOpacity>

        {connectionStatus ? (
          <Text style={styles.statusText}>{connectionStatus}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 40,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  testButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusText: {
    marginTop: 15,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
