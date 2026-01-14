import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import FooterNav from '../../components/FooterNav';

// 시도 목록
const REGIONS = [
  { code: 'B10', name: '서울특별시' },
  { code: 'C10', name: '부산광역시' },
  { code: 'D10', name: '대구광역시' },
  { code: 'E10', name: '인천광역시' },
  { code: 'F10', name: '광주광역시' },
  { code: 'G10', name: '대전광역시' },
  { code: 'H10', name: '울산광역시' },
  { code: 'I10', name: '세종특별자치시' },
  { code: 'J10', name: '경기도' },
  { code: 'K10', name: '강원도' },
  { code: 'M10', name: '충청북도' },
  { code: 'N10', name: '충청남도' },
  { code: 'P10', name: '전라북도' },
  { code: 'Q10', name: '전라남도' },
  { code: 'R10', name: '경상북도' },
  { code: 'S10', name: '경상남도' },
  { code: 'T10', name: '제주특별자치도' },
];

// 학교 유형
const SCHOOL_TYPES = [
  { code: 'elem', name: '초등학교' },
  { code: 'midd', name: '중학교' },
  { code: 'high', name: '고등학교' },
  { code: 'spcl', name: '특수학교' },
];

// 목업 데이터 (API 연동 전)
const MOCK_SCHOOLS = [
  {
    id: '1',
    name: '서울특수학교',
    type: '특수학교',
    address: '서울특별시 강남구 테헤란로 123',
    phone: '02-1234-5678',
    hasSpecialClass: true,
    specialClassCount: 12,
  },
  {
    id: '2',
    name: '강남초등학교',
    type: '초등학교',
    address: '서울특별시 강남구 역삼로 456',
    phone: '02-2345-6789',
    hasSpecialClass: true,
    specialClassCount: 2,
  },
  {
    id: '3',
    name: '역삼중학교',
    type: '중학교',
    address: '서울특별시 강남구 논현로 789',
    phone: '02-3456-7890',
    hasSpecialClass: true,
    specialClassCount: 3,
  },
  {
    id: '4',
    name: '서초고등학교',
    type: '고등학교',
    address: '서울특별시 서초구 서초대로 321',
    phone: '02-4567-8901',
    hasSpecialClass: false,
    specialClassCount: 0,
  },
];

export default function SchoolSearchScreen() {
  const router = useRouter();
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRegionPicker, setShowRegionPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState<typeof MOCK_SCHOOLS>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    setLoading(true);
    setHasSearched(true);

    // TODO: 실제 API 호출로 대체
    setTimeout(() => {
      // 목업 데이터 필터링
      let filtered = MOCK_SCHOOLS;
      if (selectedType) {
        const typeName = SCHOOL_TYPES.find(t => t.code === selectedType)?.name;
        filtered = filtered.filter(s => s.type === typeName);
      }
      if (searchQuery) {
        filtered = filtered.filter(s =>
          s.name.includes(searchQuery) || s.address.includes(searchQuery)
        );
      }
      setSchools(filtered);
      setLoading(false);
    }, 500);
  };

  const getSelectedRegionName = () => {
    return REGIONS.find(r => r.code === selectedRegion)?.name || '지역 선택';
  };

  const renderSchoolItem = ({ item }: { item: typeof MOCK_SCHOOLS[0] }) => (
    <View style={styles.schoolCard}>
      <View style={styles.schoolHeader}>
        <Text style={styles.schoolName}>{item.name}</Text>
        <View style={[
          styles.schoolTypeBadge,
          item.type === '특수학교' && styles.specialSchoolBadge
        ]}>
          <Text style={[
            styles.schoolTypeText,
            item.type === '특수학교' && styles.specialSchoolText
          ]}>{item.type}</Text>
        </View>
      </View>

      <Text style={styles.schoolAddress}>{item.address}</Text>
      <Text style={styles.schoolPhone}>{item.phone}</Text>

      <View style={styles.schoolInfo}>
        {item.hasSpecialClass ? (
          <View style={styles.specialClassBadge}>
            <Text style={styles.specialClassText}>
              특수학급 {item.specialClassCount}개
            </Text>
          </View>
        ) : (
          <Text style={styles.noSpecialClass}>특수학급 없음</Text>
        )}
      </View>

      <View style={styles.schoolActions}>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>상세 정보</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.actionBtnOutline]}>
          <Text style={[styles.actionBtnText, styles.actionBtnTextOutline]}>학교알리미</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>학교 정보 검색</Text>
          <Text style={styles.subtitle}>
            특수학급, 특수학교 정보를 검색하세요
          </Text>
        </View>

        {/* 필터 */}
        <View style={styles.filterSection}>
          {/* 지역 선택 */}
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowRegionPicker(!showRegionPicker)}
          >
            <Text style={styles.filterLabel}>지역</Text>
            <Text style={styles.filterValue}>{getSelectedRegionName()}</Text>
          </TouchableOpacity>

          {showRegionPicker && (
            <View style={styles.regionPicker}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {REGIONS.map((region) => (
                  <TouchableOpacity
                    key={region.code}
                    style={[
                      styles.regionItem,
                      selectedRegion === region.code && styles.regionItemSelected
                    ]}
                    onPress={() => {
                      setSelectedRegion(region.code);
                      setShowRegionPicker(false);
                    }}
                  >
                    <Text style={[
                      styles.regionItemText,
                      selectedRegion === region.code && styles.regionItemTextSelected
                    ]}>{region.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* 학교 유형 */}
          <View style={styles.typeFilter}>
            <Text style={styles.filterLabel}>학교 유형</Text>
            <View style={styles.typeButtons}>
              {SCHOOL_TYPES.map((type) => (
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
                  <Text style={[
                    styles.typeButtonText,
                    selectedType === type.code && styles.typeButtonTextSelected
                  ]}>{type.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 검색어 */}
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="학교명 또는 주소 검색"
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
            API 키 등록 후 실시간 학교 정보를 검색할 수 있습니다.
            현재는 예시 데이터가 표시됩니다.
          </Text>
        </View>

        {/* 검색 결과 */}
        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 40 }} />
        ) : hasSearched ? (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>
              검색 결과 ({schools.length}개)
            </Text>
            {schools.length === 0 ? (
              <View style={styles.emptyResult}>
                <Text style={styles.emptyResultText}>
                  검색 결과가 없습니다
                </Text>
              </View>
            ) : (
              schools.map((school) => (
                <View key={school.id}>
                  {renderSchoolItem({ item: school })}
                </View>
              ))
            )}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🏫</Text>
            <Text style={styles.emptyStateText}>
              지역과 학교 유형을 선택하고{'\n'}검색 버튼을 눌러주세요
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
  filterButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  filterValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  regionPicker: {
    marginBottom: 16,
  },
  regionItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 8,
  },
  regionItemSelected: {
    backgroundColor: '#007AFF',
  },
  regionItemText: {
    fontSize: 14,
    color: '#666',
  },
  regionItemTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  typeFilter: {
    marginBottom: 16,
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  typeButtonSelected: {
    backgroundColor: '#007AFF',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#666',
  },
  typeButtonTextSelected: {
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
  schoolCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  schoolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  schoolName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  schoolTypeBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  specialSchoolBadge: {
    backgroundColor: '#E3F2FD',
  },
  schoolTypeText: {
    fontSize: 12,
    color: '#666',
  },
  specialSchoolText: {
    color: '#1976D2',
    fontWeight: '600',
  },
  schoolAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  schoolPhone: {
    fontSize: 14,
    color: '#999',
    marginBottom: 12,
  },
  schoolInfo: {
    marginBottom: 12,
  },
  specialClassBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  specialClassText: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '600',
  },
  noSpecialClass: {
    fontSize: 13,
    color: '#999',
  },
  schoolActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
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
