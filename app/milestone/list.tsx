import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useChild } from '../../contexts/ChildContext';
import { milestonesApi } from '../../services/database';
import { Milestone } from '../../types';

const CATEGORIES = [
  { id: 'all', name: '전체', icon: '📋' },
  { id: 'social', name: '사회성', icon: '👥' },
  { id: 'communication', name: '의사소통', icon: '💬' },
  { id: 'motor', name: '운동능력', icon: '🏃' },
  { id: 'cognitive', name: '인지', icon: '🧠' },
];

export default function MilestoneListScreen() {
  const { selectedChild } = useChild();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const router = useRouter();

  useEffect(() => {
    if (selectedChild) {
      loadMilestones();
    } else {
      setMilestones([]);
    }
  }, [selectedChild]);

  const loadMilestones = async () => {
    if (!selectedChild) return;

    setLoading(true);
    try {
      const data = await milestonesApi.getByChildId(selectedChild.id);
      setMilestones(data);
    } catch (error) {
      console.error('Failed to load milestones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMilestone = () => {
    if (!selectedChild) {
      if (typeof window !== 'undefined') {
        window.alert('먼저 프로필 탭에서 자녀를 선택해주세요.');
      }
      return;
    }
    router.push('/milestone/add');
  };

  const handleEditMilestone = (milestoneId: string) => {
    router.push(`/milestone/edit/${milestoneId}`);
  };

  const handleToggleAchieved = async (milestone: Milestone) => {
    try {
      const newAchieved = !milestone.achieved;
      await milestonesApi.update(milestone.id, {
        achieved: newAchieved,
        achieved_date: newAchieved ? new Date().toISOString().split('T')[0] : undefined,
      });
      await loadMilestones();
    } catch (error) {
      console.error('Failed to update milestone:', error);
      if (typeof window !== 'undefined') {
        window.alert('마일스톤 업데이트 중 오류가 발생했습니다.');
      }
    }
  };

  const handleDeleteMilestone = async (milestoneId: string, milestone: string) => {
    if (typeof window !== 'undefined' && window.confirm) {
      const confirmed = window.confirm(`"${milestone}" 마일스톤을 삭제하시겠습니까?`);

      if (confirmed) {
        try {
          await milestonesApi.delete(milestoneId);
          await loadMilestones();
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

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES.find(c => c.id === category);
    return cat?.icon || '📋';
  };

  const getCategoryName = (category: string) => {
    const cat = CATEGORIES.find(c => c.id === category);
    return cat?.name || category;
  };

  // 카테고리별 필터링
  const filteredMilestones = selectedCategory === 'all'
    ? milestones
    : milestones.filter(m => m.category === selectedCategory);

  // 통계 계산
  const totalMilestones = milestones.length;
  const achievedMilestones = milestones.filter(m => m.achieved).length;
  const progressPercentage = totalMilestones > 0
    ? Math.round((achievedMilestones / totalMilestones) * 100)
    : 0;

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
        <View style={styles.headerNav}>
          <TouchableOpacity onPress={() => router.push('/(tabs)')}>
            <Text style={styles.backButton}>← 홈</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>발달 마일스톤</Text>
            <Text style={styles.subtitle}>{selectedChild.name}의 발달 기록</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={handleAddMilestone}>
            <Text style={styles.addButtonText}>+ 추가</Text>
          </TouchableOpacity>
        </View>

        {/* 진행률 */}
        <View style={styles.progressContainer}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              달성률: {achievedMilestones}/{totalMilestones}
            </Text>
            <Text style={styles.progressPercentage}>{progressPercentage}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
          </View>
        </View>
      </View>

      {/* 카테고리 필터 */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item.id && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(item.id)}
            >
              <Text style={styles.categoryIcon}>{item.icon}</Text>
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === item.id && styles.categoryButtonTextActive,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      ) : filteredMilestones.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            {selectedCategory === 'all'
              ? '등록된 마일스톤이 없습니다'
              : `${getCategoryName(selectedCategory)} 카테고리에 등록된 마일스톤이 없습니다`}
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={handleAddMilestone}>
            <Text style={styles.emptyButtonText}>첫 마일스톤 추가하기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredMilestones}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.milestoneCard}>
              <View style={styles.milestoneHeader}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => handleToggleAchieved(item)}
                >
                  <View style={[styles.checkboxBox, item.achieved && styles.checkboxBoxChecked]}>
                    {item.achieved && <Text style={styles.checkboxCheck}>✓</Text>}
                  </View>
                </TouchableOpacity>
                <View style={styles.milestoneContent}>
                  <View style={styles.milestoneTop}>
                    <Text style={styles.categoryBadge}>
                      {getCategoryIcon(item.category)} {getCategoryName(item.category)}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.milestoneTitle,
                      item.achieved && styles.milestoneTitleAchieved,
                    ]}
                  >
                    {item.milestone}
                  </Text>
                  {item.achieved && item.achieved_date && (
                    <Text style={styles.achievedDate}>
                      ✅ {formatDate(item.achieved_date)} 달성
                    </Text>
                  )}
                  {item.notes && (
                    <Text style={styles.milestoneNotes} numberOfLines={2}>
                      {item.notes}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.milestoneActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEditMilestone(item.id)}
                >
                  <Text style={styles.actionButtonText}>수정</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteMilestone(item.id, item.milestone)}
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerNav: {
    marginBottom: 10,
  },
  backButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
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
  progressContainer: {
    marginTop: 5,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  categoryContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  categoryButtonTextActive: {
    color: '#fff',
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
    textAlign: 'center',
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
  milestoneCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  milestoneHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  checkbox: {
    paddingTop: 2,
    marginRight: 12,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
  milestoneContent: {
    flex: 1,
  },
  milestoneTop: {
    marginBottom: 6,
  },
  categoryBadge: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  milestoneTitleAchieved: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  achievedDate: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '500',
    marginBottom: 6,
  },
  milestoneNotes: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  milestoneActions: {
    flexDirection: 'row',
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
