import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Switch, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useChild } from '../../contexts/ChildContext';
import { useTheme, ThemeMode } from '../../contexts/ThemeContext';
import { notificationService } from '../../services/notifications';
import { backupApi } from '../../services/localStorage';

// Platform-specific imports for mobile backup
let FileSystem: any = null;
let DocumentPicker: any = null;
let Sharing: any = null;

if (Platform.OS !== 'web') {
  FileSystem = require('expo-file-system');
  DocumentPicker = require('expo-document-picker');
  Sharing = require('expo-sharing');
}

export default function ProfileScreen() {
  const { children, selectedChild, loading, selectChild, deleteChild, refreshChildren } = useChild();
  const { theme, themeMode, setThemeMode } = useTheme();
  const router = useRouter();

  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [checkingPermission, setCheckingPermission] = useState(true);
  const [backupLoading, setBackupLoading] = useState(false);

  useEffect(() => {
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = async () => {
    if (Platform.OS === 'web') {
      setCheckingPermission(false);
      return;
    }
    const hasPermission = await notificationService.checkPermission();
    setNotificationEnabled(hasPermission);
    setCheckingPermission(false);
  };

  const handleNotificationToggle = async (value: boolean) => {
    if (Platform.OS === 'web') {
      Alert.alert('알림', '웹에서는 푸시 알림이 지원되지 않습니다.');
      return;
    }

    if (value) {
      const granted = await notificationService.requestPermission();
      setNotificationEnabled(granted);
      if (!granted) {
        Alert.alert(
          '알림 권한',
          '알림 권한이 거부되었습니다. 설정에서 알림 권한을 허용해주세요.',
        );
      }
    } else {
      Alert.alert(
        '알림 비활성화',
        '알림을 비활성화하려면 기기 설정에서 앱의 알림 권한을 변경해주세요.',
      );
    }
  };

  const handleTestNotification = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('알림', '웹에서는 푸시 알림이 지원되지 않습니다.');
      return;
    }

    const hasPermission = await notificationService.checkPermission();
    if (!hasPermission) {
      Alert.alert('알림 권한', '알림 권한이 없습니다. 먼저 알림을 활성화해주세요.');
      return;
    }

    await notificationService.sendImmediateNotification(
      '테스트 알림',
      '알림이 정상적으로 작동합니다!'
    );
    Alert.alert('알림 전송', '테스트 알림이 전송되었습니다.');
  };

  // 데이터 백업 (내보내기)
  const handleBackup = async () => {
    setBackupLoading(true);
    try {
      const jsonData = await backupApi.exportAllData();
      const fileName = `hamkke_backup_${new Date().toISOString().split('T')[0]}.json`;

      if (Platform.OS === 'web') {
        // 웹에서는 다운로드
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        Alert.alert('백업 완료', '백업 파일이 다운로드되었습니다.');
      } else if (FileSystem && Sharing) {
        // 모바일에서는 공유
        const fileUri = FileSystem.documentDirectory + fileName;
        await FileSystem.writeAsStringAsync(fileUri, jsonData);

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/json',
            dialogTitle: '백업 파일 저장',
          });
        } else {
          Alert.alert('백업 완료', `백업 파일이 저장되었습니다:\n${fileUri}`);
        }
      }
    } catch (error) {
      console.error('Backup error:', error);
      Alert.alert('오류', '백업 중 오류가 발생했습니다.');
    } finally {
      setBackupLoading(false);
    }
  };

  // 데이터 복원 (가져오기)
  const handleRestore = async () => {
    Alert.alert(
      '데이터 복원',
      '백업 파일에서 데이터를 복원하면 현재 데이터가 덮어씌워집니다. 계속하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '복원',
          onPress: async () => {
            try {
              setBackupLoading(true);

              if (Platform.OS === 'web') {
                // 웹에서는 파일 input 사용
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = async (e: any) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = async (event) => {
                      const jsonData = event.target?.result as string;
                      const result = await backupApi.importAllData(jsonData);
                      if (result.success) {
                        await refreshChildren();
                        Alert.alert('복원 완료', result.message);
                      } else {
                        Alert.alert('오류', result.message);
                      }
                      setBackupLoading(false);
                    };
                    reader.readAsText(file);
                  } else {
                    setBackupLoading(false);
                  }
                };
                input.click();
              } else if (DocumentPicker && FileSystem) {
                // 모바일에서는 DocumentPicker 사용
                const result = await DocumentPicker.getDocumentAsync({
                  type: 'application/json',
                });

                if (!result.canceled && result.assets && result.assets[0]) {
                  const fileUri = result.assets[0].uri;
                  const jsonData = await FileSystem.readAsStringAsync(fileUri);
                  const importResult = await backupApi.importAllData(jsonData);

                  if (importResult.success) {
                    await refreshChildren();
                    Alert.alert('복원 완료', importResult.message);
                  } else {
                    Alert.alert('오류', importResult.message);
                  }
                }
                setBackupLoading(false);
              }
            } catch (error) {
              console.error('Restore error:', error);
              Alert.alert('오류', '복원 중 오류가 발생했습니다.');
              setBackupLoading(false);
            }
          },
        },
      ]
    );
  };

  const themeOptions: { mode: ThemeMode; label: string; description: string }[] = [
    { mode: 'light', label: '라이트', description: '밝은 테마' },
    { mode: 'dark', label: '다크', description: '어두운 테마' },
    { mode: 'system', label: '시스템', description: '기기 설정 따름' },
  ];

  const handleAddChild = () => {
    router.push('/child/add');
  };

  const handleEditChild = (childId: string) => {
    router.push(`/child/edit/${childId}`);
  };

  const handleDeleteChild = async (childId: string, childName: string) => {
    if (typeof window !== 'undefined' && window.confirm) {
      const confirmed = window.confirm(
        `${childName}의 프로필을 삭제하시겠습니까?\n모든 관련 데이터가 함께 삭제됩니다.`
      );

      if (confirmed) {
        try {
          await deleteChild(childId);
        } catch (error) {
          console.error('Delete error:', error);
          const message = error instanceof Error ? error.message : '알 수 없는 오류';
          window.alert(`삭제 중 오류가 발생했습니다: ${message}`);
        }
      }
    } else {
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
    container: { backgroundColor: theme.colors.background },
    header: { borderBottomColor: theme.colors.border },
    title: { color: theme.colors.text },
    infoBox: { backgroundColor: theme.colors.accentLight },
    infoTitle: { color: theme.colors.accent },
    infoText: { color: theme.colors.accent },
    sectionTitle: { color: theme.colors.text },
    childCard: { backgroundColor: theme.colors.surface },
    childCardSelected: { borderColor: theme.colors.accent, backgroundColor: theme.colors.accentLight },
    childName: { color: theme.colors.text },
    childInfo: { color: theme.colors.textSecondary },
    childDiagnosis: { color: theme.colors.textMuted },
    childCardActions: { borderTopColor: theme.colors.border },
    emptyText: { color: theme.colors.textMuted },
    themeOption: { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
    themeOptionSelected: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight },
    themeLabel: { color: theme.colors.text },
    themeDescription: { color: theme.colors.textMuted },
    notificationRow: { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
    notificationLabel: { color: theme.colors.text },
    notificationDesc: { color: theme.colors.textMuted },
    backupCard: { backgroundColor: theme.colors.surface },
    backupTitle: { color: theme.colors.text },
    backupDesc: { color: theme.colors.textMuted },
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <View style={[styles.header, dynamicStyles.header]}>
        <Text style={[styles.title, dynamicStyles.title]}>프로필</Text>
      </View>

      <ScrollView style={styles.scrollContent}>
        {/* 로컬 저장 안내 */}
        <View style={[styles.infoBox, dynamicStyles.infoBox]}>
          <Text style={styles.infoIcon}>🔒</Text>
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, dynamicStyles.infoTitle]}>로컬 저장 모드</Text>
            <Text style={[styles.infoText, dynamicStyles.infoText]}>
              모든 데이터는 이 기기에만 저장됩니다.{'\n'}
              기기 변경 시 백업 기능을 이용해주세요.
            </Text>
          </View>
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
                  <Text style={[styles.themeLabel, dynamicStyles.themeLabel]}>{option.label}</Text>
                  <Text style={[styles.themeDescription, dynamicStyles.themeDescription]}>{option.description}</Text>
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

        {/* 알림 설정 섹션 */}
        {Platform.OS !== 'web' && (
          <View style={styles.settingsSection}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>알림 설정</Text>
            <View style={styles.notificationOptions}>
              <View style={[styles.notificationRow, dynamicStyles.notificationRow]}>
                <View style={styles.notificationContent}>
                  <Text style={[styles.notificationLabel, dynamicStyles.notificationLabel]}>푸시 알림</Text>
                  <Text style={[styles.notificationDesc, dynamicStyles.notificationDesc]}>일정 알림을 받습니다</Text>
                </View>
                {checkingPermission ? (
                  <ActivityIndicator size="small" color={theme.colors.accent} />
                ) : (
                  <Switch
                    value={notificationEnabled}
                    onValueChange={handleNotificationToggle}
                    trackColor={{ false: theme.colors.surface, true: theme.colors.accent }}
                    thumbColor={notificationEnabled ? '#fff' : '#f4f3f4'}
                  />
                )}
              </View>
              <TouchableOpacity
                style={[styles.testNotificationButton, { backgroundColor: theme.colors.accent }]}
                onPress={handleTestNotification}
              >
                <Text style={styles.testNotificationButtonText}>테스트 알림 보내기</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 데이터 백업/복원 섹션 */}
        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>데이터 관리</Text>
          <View style={[styles.backupCard, dynamicStyles.backupCard]}>
            <Text style={[styles.backupTitle, dynamicStyles.backupTitle]}>백업 및 복원</Text>
            <Text style={[styles.backupDesc, dynamicStyles.backupDesc]}>
              데이터를 JSON 파일로 내보내거나 가져올 수 있습니다.{'\n'}
              기기 변경 시 이 기능을 사용하세요.
            </Text>
            <View style={styles.backupButtons}>
              <TouchableOpacity
                style={[styles.backupButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleBackup}
                disabled={backupLoading}
              >
                {backupLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.backupButtonText}>백업 (내보내기)</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.backupButton, { backgroundColor: theme.colors.accent }]}
                onPress={handleRestore}
                disabled={backupLoading}
              >
                <Text style={styles.backupButtonText}>복원 (가져오기)</Text>
              </TouchableOpacity>
            </View>
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
                <TouchableOpacity style={styles.childCardContent} onPress={() => selectChild(item)}>
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

        {/* 하단 여백 */}
        <View style={{ height: 100 }} />
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
  settingsSection: {
    padding: 20,
    paddingTop: 10,
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
  notificationOptions: {
    marginTop: 12,
    gap: 12,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  notificationContent: {
    flex: 1,
  },
  notificationLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationDesc: {
    fontSize: 13,
  },
  testNotificationButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  testNotificationButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  backupCard: {
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
  },
  backupTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  backupDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  backupButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  backupButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  backupButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
