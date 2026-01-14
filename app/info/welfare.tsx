import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import FooterNav from '../../components/FooterNav';

// 시설 유형
const FACILITY_TYPES = [
  { code: 'welfare', name: '장애인복지관', icon: '🏛️' },
  { code: 'therapy', name: '치료센터', icon: '💊' },
  { code: 'development', name: '발달센터', icon: '🌱' },
  { code: 'daycare', name: '주간보호센터', icon: '🏠' },
  { code: 'support', name: '활동지원센터', icon: '🤝' },
];

// 목업 데이터 (API 연동 전)
const MOCK_FACILITIES = [
  {
    id: '1',
    name: '서울시립장애인복지관',
    type: '장애인복지관',
    address: '서울특별시 강남구 테헤란로 123',
    phone: '02-1234-5678',
    programs: ['언어치료', '작업치료', '행동치료', '미술치료'],
    hours: '평일 09:00 - 18:00',
    website: 'https://example.com',
  },
  {
    id: '2',
    name: '강남아동발달센터',
    type: '발달센터',
    address: '서울특별시 강남구 역삼로 456',
    phone: '02-2345-6789',
    programs: ['감각통합', 'ABA치료', '언어치료'],
    hours: '평일 10:00 - 19:00, 토요일 10:00 - 14:00',
    website: '',
  },
  {
    id: '3',
    name: '희망치료센터',
    type: '치료센터',
    address: '서울특별시 서초구 서초대로 789',
    phone: '02-3456-7890',
    programs: ['언어치료', '음악치료', '놀이치료'],
    hours: '평일 09:00 - 20:00',
    website: 'https://example2.com',
  },
  {
    id: '4',
    name: '사랑주간보호센터',
    type: '주간보호센터',
    address: '서울특별시 송파구 올림픽로 321',
    phone: '02-4567-8901',
    programs: ['일상생활훈련', '사회적응훈련', '여가활동'],
    hours: '평일 09:00 - 17:00',
    website: '',
  },
];

export default function WelfareSearchScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [facilities, setFacilities] = useState<typeof MOCK_FACILITIES>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    setLoading(true);
    setHasSearched(true);

    // TODO: 실제 API 호출로 대체
    setTimeout(() => {
      let filtered = MOCK_FACILITIES;
      if (selectedType) {
        const typeName = FACILITY_TYPES.find(t => t.code === selectedType)?.name;
        filtered = filtered.filter(f => f.type === typeName);
      }
      if (searchQuery) {
        filtered = filtered.filter(f =>
          f.name.includes(searchQuery) ||
          f.address.includes(searchQuery) ||
          f.programs.some(p => p.includes(searchQuery))
        );
      }
      setFacilities(filtered);
      setLoading(false);
    }, 500);
  };

  const handleCall = (phone: string) => {
    if (typeof window !== 'undefined') {
      window.open(`tel:${phone}`, '_self');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>복지시설 찾기</Text>
          <Text style={styles.subtitle}>
            복지관, 치료센터, 발달센터를 검색하세요
          </Text>
        </View>

        {/* 시설 유형 필터 */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>시설 유형</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.typeScroll}
          >
            {FACILITY_TYPES.map((type) => (
              <TouchableOpacity
                key={type.code}
                style={[
                  styles.typeButton,
                  selectedType === type.code && styles.typeButtonSelected
                ]}
                onPress={() => setSelectedType(
                  selectedType === type.code ? '' : type.code
                )}
              >
                <Text style={styles.typeIcon}>{type.icon}</Text>
                <Text style={[
                  styles.typeText,
                  selectedType === type.code && styles.typeTextSelected
                ]}>{type.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* 검색어 */}
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="시설명, 주소, 프로그램 검색"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>검색</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 안내 */}
        <View style={styles.tipBox}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>
            공공데이터 API 연동 후 전국 복지시설 정보를 검색할 수 있습니다.
            현재는 예시 데이터가 표시됩니다.
          </Text>
        </View>

        {/* 검색 결과 */}
        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 40 }} />
        ) : hasSearched ? (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>
              검색 결과 ({facilities.length}개)
            </Text>
            {facilities.length === 0 ? (
              <View style={styles.emptyResult}>
                <Text style={styles.emptyResultText}>
                  검색 결과가 없습니다
                </Text>
              </View>
            ) : (
              facilities.map((facility) => (
                <View key={facility.id} style={styles.facilityCard}>
                  <View style={styles.facilityHeader}>
                    <Text style={styles.facilityName}>{facility.name}</Text>
                    <View style={styles.facilityTypeBadge}>
                      <Text style={styles.facilityTypeText}>{facility.type}</Text>
                    </View>
                  </View>

                  <Text style={styles.facilityAddress}>{facility.address}</Text>
                  <Text style={styles.facilityHours}>{facility.hours}</Text>

                  {/* 프로그램 */}
                  <View style={styles.programsContainer}>
                    {facility.programs.map((program, idx) => (
                      <View key={idx} style={styles.programBadge}>
                        <Text style={styles.programText}>{program}</Text>
                      </View>
                    ))}
                  </View>

                  {/* 액션 버튼 */}
                  <View style={styles.facilityActions}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleCall(facility.phone)}
                    >
                      <Text style={styles.actionBtnText}>📞 전화</Text>
                    </TouchableOpacity>
                    {facility.website && (
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.actionBtnOutline]}
                        onPress={() => {
                          if (typeof window !== 'undefined') {
                            window.open(facility.website, '_blank');
                          }
                        }}
                      >
                        <Text style={[styles.actionBtnText, styles.actionBtnTextOutline]}>
                          🌐 홈페이지
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🏛️</Text>
            <Text style={styles.emptyStateText}>
              시설 유형을 선택하거나{'\n'}검색어를 입력해주세요
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <FooterNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
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
    color: '#666',
    marginTop: 4,
  },
  filterSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  filterLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  typeScroll: {
    marginBottom: 16,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    marginRight: 10,
  },
  typeButtonSelected: {
    backgroundColor: '#007AFF',
  },
  typeIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  typeText: {
    fontSize: 14,
    color: '#666',
  },
  typeTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tipBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF9E6',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  tipIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#856404',
    lineHeight: 18,
  },
  resultsSection: {
    padding: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  facilityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  facilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  facilityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  facilityTypeBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  facilityTypeText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '600',
  },
  facilityAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  facilityHours: {
    fontSize: 13,
    color: '#999',
    marginBottom: 12,
  },
  programsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  programBadge: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  programText: {
    fontSize: 12,
    color: '#666',
  },
  facilityActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionBtnOutline: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  actionBtnTextOutline: {
    color: '#007AFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyResult: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyResultText: {
    fontSize: 16,
    color: '#999',
  },
});
