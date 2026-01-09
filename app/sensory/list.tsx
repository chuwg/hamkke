import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useChild } from '../../contexts/ChildContext';
import { sensoryProfilesApi } from '../../services/database';
import { SensoryProfile } from '../../types';
import RadarChart from '../../components/RadarChart';

const SENSORY_TYPES = [
  { key: 'visual', name: '시각', icon: '👁️', color: '#FF6B6B' },
  { key: 'auditory', name: '청각', icon: '👂', color: '#4ECDC4' },
  { key: 'tactile', name: '촉각', icon: '✋', color: '#95E1D3' },
  { key: 'vestibular', name: '전정감각', icon: '🌀', color: '#F3A683' },
  { key: 'proprioceptive', name: '고유수용감각', icon: '💪', color: '#786FA6' },
  { key: 'oral', name: '구강', icon: '👄', color: '#F8B500' },
];

export default function SensoryProfileListScreen() {
  const { selectedChild } = useChild();
  const [profiles, setProfiles] = useState<SensoryProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (selectedChild) {
      loadProfiles();
    } else {
      setProfiles([]);
    }
  }, [selectedChild]);

  const loadProfiles = async () => {
    if (!selectedChild) return;

    setLoading(true);
    try {
      const data = await sensoryProfilesApi.getByChildId(selectedChild.id);
      setProfiles(data);
    } catch (error) {
      console.error('Failed to load sensory profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProfile = () => {
    if (!selectedChild) {
      if (typeof window !== 'undefined') {
        window.alert('먼저 프로필 탭에서 자녀를 선택해주세요.');
      }
      return;
    }
    router.push('/sensory/add');
  };

  const handleEditProfile = (profileId: string) => {
    router.push(`/sensory/edit/${profileId}`);
  };

  const handleDeleteProfile = async (profileId: string, date: string) => {
    if (typeof window !== 'undefined' && window.confirm) {
      const confirmed = window.confirm(`${date} 기록을 삭제하시겠습니까?`);

      if (confirmed) {
        try {
          await sensoryProfilesApi.delete(profileId);
          await loadProfiles();
        } catch (error) {
          console.error('Delete error:', error);
          window.alert('삭제 중 오류가 발생했습니다.');
        }
      }
    }
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return '#4CAF50'; // 높음 - 초록
    if (score >= 5) return '#FF9800'; // 중간 - 주황
    return '#F44336'; // 낮음 - 빨강
  };

  const calculateAverage = (profile: SensoryProfile) => {
    const total = profile.visual + profile.auditory + profile.tactile +
                  profile.vestibular + profile.proprioceptive + profile.oral;
    return (total / 6).toFixed(1);
  };

  // 최근 프로파일 평균 계산
  const latestProfile = profiles.length > 0 ? profiles[0] : null;
  const latestAverage = latestProfile ? calculateAverage(latestProfile) : '0.0';

  if (!selectedChild) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>프로필 탭에서 자녀를 선택해주세요</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>감각 프로파일</Text>
          <Text style={styles.subtitle}>{selectedChild.name}의 감각 평가</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddProfile}>
          <Text style={styles.addButtonText}>+ 추가</Text>
        </TouchableOpacity>
      </View>

      {/* 레이더 차트 */}
      {latestProfile && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>최근 감각 프로파일</Text>
          <Text style={styles.chartDate}>{formatDate(latestProfile.date)}</Text>
          <RadarChart
            data={SENSORY_TYPES.map(type => ({
              label: type.name,
              value: latestProfile[type.key as keyof SensoryProfile] as number,
              icon: type.icon,
            }))}
            size={300}
            maxValue={10}
            color="#007AFF"
          />
          <View style={styles.chartStats}>
            <View style={styles.chartStat}>
              <Text style={styles.chartStatValue}>{latestAverage}</Text>
              <Text style={styles.chartStatLabel}>평균 점수</Text>
            </View>
            <View style={styles.chartStat}>
              <Text style={styles.chartStatValue}>{profiles.length}</Text>
              <Text style={styles.chartStatLabel}>총 기록</Text>
            </View>
          </View>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      ) : profiles.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>등록된 감각 프로파일이 없습니다</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={handleAddProfile}>
            <Text style={styles.emptyButtonText}>첫 프로파일 추가하기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={profiles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.profileCard}>
              <View style={styles.profileHeader}>
                <Text style={styles.profileDate}>{formatDate(item.date)}</Text>
                <Text style={styles.profileAverage}>평균: {calculateAverage(item)}</Text>
              </View>

              <View style={styles.sensoryGrid}>
                {SENSORY_TYPES.map((type) => {
                  const score = item[type.key as keyof SensoryProfile] as number;
                  return (
                    <View key={type.key} style={styles.sensoryItem}>
                      <Text style={styles.sensoryIcon}>{type.icon}</Text>
                      <Text style={styles.sensoryName}>{type.name}</Text>
                      <View style={styles.scoreContainer}>
                        <View style={styles.scoreBarBackground}>
                          <View
                            style={[
                              styles.scoreBar,
                              {
                                width: `${score * 10}%`,
                                backgroundColor: getScoreColor(score),
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.scoreText}>{score}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              {item.notes && (
                <Text style={styles.profileNotes} numberOfLines={2}>
                  📝 {item.notes}
                </Text>
              )}

              <View style={styles.profileActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEditProfile(item.id)}
                >
                  <Text style={styles.actionButtonText}>수정</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteProfile(item.id, formatDate(item.date))}
                >
                  <Text style={[styles.actionButtonText, styles.deleteButtonText]}>삭제</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={{ padding: 20 }}
        />
      )}
    </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
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
  chartContainer: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  chartDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  chartStats: {
    flexDirection: 'row',
    gap: 40,
    marginTop: 10,
  },
  chartStat: {
    alignItems: 'center',
  },
  chartStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  chartStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
  profileCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  profileAverage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  sensoryGrid: {
    gap: 12,
    marginBottom: 12,
  },
  sensoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sensoryIcon: {
    fontSize: 20,
    width: 30,
  },
  sensoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    width: 90,
  },
  scoreContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreBar: {
    height: '100%',
    borderRadius: 4,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    width: 25,
    textAlign: 'right',
  },
  profileNotes: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  profileActions: {
    flexDirection: 'row',
    marginTop: 8,
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
});
