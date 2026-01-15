import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useChild } from '../../contexts/ChildContext';
import { useTheme, ThemeMode } from '../../contexts/ThemeContext';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { children, selectedChild, loading, selectChild, deleteChild } = useChild();
  const { theme, themeMode, setThemeMode, isDark } = useTheme();
  const router = useRouter();

  const themeOptions: { mode: ThemeMode; label: string; description: string }[] = [
    { mode: 'light', label: '라이트', description: '밝은 테마' },
    { mode: 'dark', label: '다크', description: '어두운 테마' },
    { mode: 'system', label: '시스템', description: '기기 설정 따름' },
  ];

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

  const dynamicStyles = {
    container: {
      backgroundColor: theme.colors.background,
    },
    header: {
      borderBottomColor: theme.colors.border,
    },
    title: {
      color: theme.colors.text,
    },
    userInfo: {
      backgroundColor: theme.colors.surface,
    },
    label: {
      color: theme.colors.textMuted,
    },
    value: {
      color: theme.colors.text,
    },
    sectionTitle: {
      color: theme.colors.text,
    },
    childCard: {
      backgroundColor: theme.colors.surface,
    },
    childCardSelected: {
      borderColor: theme.colors.accent,
      backgroundColor: theme.colors.accentLight,
    },
    childName: {
      color: theme.colors.text,
    },
    childInfo: {
      color: theme.colors.textSecondary,
    },
    childDiagnosis: {
      color: theme.colors.textMuted,
    },
    childCardActions: {
      borderTopColor: theme.colors.border,
    },
    emptyText: {
      color: theme.colors.textMuted,
    },
    themeOption: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    },
    themeOptionSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight,
    },
    themeLabel: {
      color: theme.colors.text,
    },
    themeDescription: {
      color: theme.colors.textMuted,
    },
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <View style={[styles.header, dynamicStyles.header]}>
        <Text style={[styles.title, dynamicStyles.title]}>프로필</Text>
      </View>

      <ScrollView style={styles.scrollContent}>
        <View style={[styles.userInfo, dynamicStyles.userInfo]}>
          <Text style={[styles.label, dynamicStyles.label]}>이메일</Text>
          <Text style={[styles.value, dynamicStyles.value]}>{user?.email}</Text>
        </View>

        {/* 테마 설정 섹션 */}
        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>화면 설정</Text>
          <View style={styles.themeOptions}>
            {themeOptions.map((option) => (
              <TouchableOpacity
                key={option.mode}
                style={[
                  styles.themeOption,
                  dynamicStyles.themeOption,
                  themeMode === option.mode && styles.themeOptionSelected,
                  themeMode === option.mode && dynamicStyles.themeOptionSelected,
                ]}
                onPress={() => setThemeMode(option.mode)}
              >
                <View style={styles.themeOptionContent}>
                  <Text style={[styles.themeLabel, dynamicStyles.themeLabel]}>
                    {option.label}
                  </Text>
                  <Text style={[styles.themeDescription, dynamicStyles.themeDescription]}>
                    {option.description}
                  </Text>
                </View>
                {themeMode === option.mode && (
                  <View style={[styles.checkmark, { backgroundColor: theme.colors.primary }]}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 아이 프로필 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>아이 프로필</Text>
            <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.colors.accent }]} onPress={handleAddChild}>
              <Text style={styles.addButtonText}>+ 추가</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={theme.colors.accent} style={{ marginTop: 20 }} />
          ) : children.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, dynamicStyles.emptyText]}>등록된 아이가 없습니다.</Text>
              <TouchableOpacity style={[styles.emptyButton, { backgroundColor: theme.colors.accent }]} onPress={handleAddChild}>
                <Text style={styles.emptyButtonText}>첫 프로필 추가하기</Text>
              </TouchableOpacity>
            </View>
          ) : (
            children.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.childCard,
                  dynamicStyles.childCard,
                  selectedChild?.id === item.id && styles.childCardSelected,
                  selectedChild?.id === item.id && dynamicStyles.childCardSelected,
                ]}
              >
                <TouchableOpacity
                  style={styles.childCardContent}
                  onPress={() => selectChild(item)}
                >
                  <View>
                    <Text style={[styles.childName, dynamicStyles.childName]}>{item.name}</Text>
                    <Text style={[styles.childInfo, dynamicStyles.childInfo]}>
                      생년월일: {new Date(item.birth_date).toLocaleDateString('ko-KR')}
                    </Text>
                    {item.diagnosis && (
                      <Text style={[styles.childDiagnosis, dynamicStyles.childDiagnosis]}>{item.diagnosis}</Text>
                    )}
                  </View>
                  {selectedChild?.id === item.id && (
                    <View style={[styles.selectedBadge, { backgroundColor: theme.colors.accent }]}>
                      <Text style={styles.selectedBadgeText}>선택됨</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <View style={[styles.childCardActions, dynamicStyles.childCardActions]}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.colors.accent }]}
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
            ))
          )}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>로그아웃</Text>
        </TouchableOpacity>
      </ScrollView>
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
  scrollContent: {
    flex: 1,
  },
  userInfo: {
    padding: 20,
    backgroundColor: '#f8f8f8',
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 10,
  },
  settingsSection: {
    padding: 20,
    marginTop: 10,
  },
  themeOptions: {
    marginTop: 12,
    gap: 10,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeOptionSelected: {
    borderWidth: 2,
  },
  themeOptionContent: {
    flex: 1,
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  themeDescription: {
    fontSize: 13,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
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
    padding: 20,
    paddingTop: 10,
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
