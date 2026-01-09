import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useChild } from '../../contexts/ChildContext';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { children, selectedChild, loading, selectChild, deleteChild } = useChild();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  const handleAddChild = () => {
    router.push('/child/add');
  };

  const handleEditChild = (childId: string) => {
    router.push(`/child/edit/${childId}`);
  };

  const handleDeleteChild = async (childId: string, childName: string) => {
    // 웹에서는 window.confirm 사용
    if (typeof window !== 'undefined' && window.confirm) {
      const confirmed = window.confirm(
        `${childName}의 프로필을 삭제하시겠습니까?\n모든 관련 데이터가 함께 삭제됩니다.`
      );

      if (confirmed) {
        try {
          console.log('Deleting child:', childId);
          await deleteChild(childId);
          console.log('Delete successful');
        } catch (error) {
          console.error('Delete error:', error);
          const message = error instanceof Error ? error.message : '알 수 없는 오류';
          window.alert(`삭제 중 오류가 발생했습니다: ${message}`);
        }
      }
    } else {
      // 모바일에서는 Alert 사용
      Alert.alert(
        '자녀 삭제',
        `${childName}의 프로필을 삭제하시겠습니까?\n모든 관련 데이터가 함께 삭제됩니다.`,
        [
          { text: '취소', style: 'cancel' },
          {
            text: '삭제',
            style: 'destructive',
            onPress: async () => {
              try {
                console.log('Deleting child:', childId);
                await deleteChild(childId);
              } catch (error) {
                console.error('Delete error:', error);
                const message = error instanceof Error ? error.message : '알 수 없는 오류';
                Alert.alert('오류', `삭제 중 오류가 발생했습니다: ${message}`);
              }
            },
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>프로필</Text>
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.label}>이메일</Text>
        <Text style={styles.value}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>아이 프로필</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddChild}>
            <Text style={styles.addButtonText}>+ 추가</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
        ) : children.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>등록된 아이가 없습니다.</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleAddChild}>
              <Text style={styles.emptyButtonText}>첫 프로필 추가하기</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={children}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={[
                styles.childCard,
                selectedChild?.id === item.id && styles.childCardSelected
              ]}>
                <TouchableOpacity
                  style={styles.childCardContent}
                  onPress={() => selectChild(item)}
                >
                  <View>
                    <Text style={styles.childName}>{item.name}</Text>
                    <Text style={styles.childInfo}>
                      생년월일: {new Date(item.birth_date).toLocaleDateString('ko-KR')}
                    </Text>
                    {item.diagnosis && (
                      <Text style={styles.childDiagnosis}>{item.diagnosis}</Text>
                    )}
                  </View>
                  {selectedChild?.id === item.id && (
                    <View style={styles.selectedBadge}>
                      <Text style={styles.selectedBadgeText}>선택됨</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.childCardActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEditChild(item.id)}
                  >
                    <Text style={styles.actionButtonText}>수정</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteChild(item.id, item.name)}
                  >
                    <Text style={[styles.actionButtonText, styles.deleteButtonText]}>삭제</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>로그아웃</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  userInfo: {
    padding: 20,
    backgroundColor: '#f8f8f8',
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 10,
  },
  label: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  section: {
    flex: 1,
    padding: 20,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
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
  childCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  childCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f7ff',
  },
  childCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  childName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  childInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  childDiagnosis: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
  },
  selectedBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  selectedBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  childCardActions: {
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
  logoutButton: {
    backgroundColor: '#ff3b30',
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
