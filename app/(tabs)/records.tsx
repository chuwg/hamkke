import { View, Text, StyleSheet } from 'react-native';

export default function RecordsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>치료 기록</Text>
      <Text style={styles.description}>
        치료 세션 기록, 감각 프로파일, 발달 마일스톤을 추적합니다.
      </Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
  },
});
