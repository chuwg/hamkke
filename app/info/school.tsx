import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import FooterNav from '../../components/FooterNav';
import {
  fetchSchools,
  REGION_CODES,
  SCHOOL_TYPES,
  School,
} from '../../services/schoolApi';

export default function SchoolSearchScreen() {
  const router = useRouter();
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    setError(null);

    try {
      const result = await fetchSchools({
        page: 1,
        perPage: 50,
        regionCode: selectedRegion || undefined,
        schoolType: selectedType || undefined,
        schoolName: searchQuery || undefined,
      });

      setSchools(result.schools);
      setTotalCount(result.totalCount);
    } catch (err) {
      console.error('검색 오류:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      setSchools([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone: string) => {
    const phoneNumber = phone.replace(/[^0-9-]/g, '');
    if (Platform.OS === 'web') {
      window.open(`tel:${phoneNumber}`, '_self');
    } else {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const handleWebsite = (url: string) => {
    if (!url) return;
    const fullUrl = url.startsWith('http') ? url : `http://${url}`;
    if (Platform.OS === 'web') {
      window.open(fullUrl, '_blank');
    } else {
      Linking.openURL(fullUrl);
    }
  };

  const getSchoolTypeStyle = (type: string) => {
    if (type === '특수학교') return styles.specialSchoolBadge;
    if (type === '초등학교') return styles.elementaryBadge;
    if (type === '중학교') return styles.middleBadge;
    if (type === '고등학교') return styles.highBadge;
    return {};
  };

  const getSchoolTypeTextStyle = (type: string) => {
    if (type === '특수학교') return styles.specialSchoolText;
    if (type === '초등학교') return styles.elementaryText;
    if (type === '중학교') return styles.middleText;
    if (type === '고등학교') return styles.highText;
    return {};
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>학교 정보 검색</Text>
          <Text style={styles.subtitle}>
            전국 초중고, 특수학교 정보를 검색하세요
          </Text>
        </View>

        {/* 필터 */}
        <View style={styles.filterSection}>
          {/* 지역 선택 */}
          <Text style={styles.filterLabel}>지역</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.regionScroll}
          >
            {REGION_CODES.map((region) => (
              <TouchableOpacity
                key={region.code}
                style={[
                  styles.regionButton,
                  selectedRegion === region.code && styles.regionButtonSelected,
                ]}
                onPress={() => setSelectedRegion(region.code)}
              >
                <Text
                  style={[
                    styles.regionText,
                    selectedRegion === region.code && styles.regionTextSelected,
                  ]}
                >
                  {region.name.replace('특별시', '').replace('광역시', '').replace('특별자치시', '').replace('특별자치도', '').replace('도', '')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* 학교 유형 */}
          <Text style={styles.filterLabel}>학교 유형</Text>
          <View style={styles.typeButtons}>
            {SCHOOL_TYPES.map((type) => (
              <TouchableOpacity
                key={type.code}
                style={[
                  styles.typeButton,
                  selectedType === type.code && styles.typeButtonSelected,
                ]}
                onPress={() => setSelectedType(type.code)}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    selectedType === type.code && styles.typeButtonTextSelected,
                  ]}
                >
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 검색어 */}
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="학교명 검색"
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
          <Text style={styles.tipIcon}>📡</Text>
          <Text style={styles.tipText}>
            NEIS 교육정보 개방 포털 API를 통해 실시간 정보를 제공합니다.
            {'\n'}전국 초중고 및 특수학교 정보 검색 가능
          </Text>
        </View>

        {/* 검색 결과 */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#007AFF"
            style={{ marginTop: 40 }}
          />
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : hasSearched ? (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>
              검색 결과 ({schools.length}개)
              {totalCount > 50 && (
                <Text style={styles.resultsSub}> / 전체 {totalCount}개</Text>
              )}
            </Text>
            {schools.length === 0 ? (
              <View style={styles.emptyResult}>
                <Text style={styles.emptyResultText}>검색 결과가 없습니다</Text>
              </View>
            ) : (
              schools.map((school) => (
                <View key={school.id} style={styles.schoolCard}>
                  <View style={styles.schoolHeader}>
                    <Text style={styles.schoolName}>{school.name}</Text>
                    <View
                      style={[
                        styles.schoolTypeBadge,
                        getSchoolTypeStyle(school.type),
                      ]}
                    >
                      <Text
                        style={[
                          styles.schoolTypeText,
                          getSchoolTypeTextStyle(school.type),
                        ]}
                      >
                        {school.type}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.schoolMeta}>
                    <Text style={styles.schoolMetaItem}>{school.foundationType}</Text>
                    <Text style={styles.schoolMetaDot}>•</Text>
                    <Text style={styles.schoolMetaItem}>{school.coedu}</Text>
                  </View>

                  <Text style={styles.schoolRegion}>{school.region}</Text>
                  <Text style={styles.schoolAddress}>
                    {school.address} {school.addressDetail}
                  </Text>

                  {/* 액션 버튼 */}
                  <View style={styles.schoolActions}>
                    {school.phone && (
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => handleCall(school.phone)}
                      >
                        <Text style={styles.actionBtnText}>📞 전화</Text>
                      </TouchableOpacity>
                    )}
                    {school.website && (
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.actionBtnOutline]}
                        onPress={() => handleWebsite(school.website)}
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
  filterLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  regionScroll: {
    marginBottom: 16,
  },
  regionButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    marginRight: 8,
  },
  regionButtonSelected: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  regionText: {
    fontSize: 13,
    color: '#666',
  },
  regionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
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
    backgroundColor: '#E8F5E9',
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
    color: '#2E7D32',
    lineHeight: 18,
  },
  errorBox: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
    textAlign: 'center',
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
  resultsSub: {
    fontSize: 13,
    fontWeight: '400',
    color: '#999',
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
    marginBottom: 6,
  },
  schoolName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  schoolTypeBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  specialSchoolBadge: {
    backgroundColor: '#E8F5E9',
  },
  elementaryBadge: {
    backgroundColor: '#FFF3E0',
  },
  middleBadge: {
    backgroundColor: '#E3F2FD',
  },
  highBadge: {
    backgroundColor: '#F3E5F5',
  },
  schoolTypeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  specialSchoolText: {
    color: '#2E7D32',
  },
  elementaryText: {
    color: '#E65100',
  },
  middleText: {
    color: '#1976D2',
  },
  highText: {
    color: '#7B1FA2',
  },
  schoolMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  schoolMetaItem: {
    fontSize: 13,
    color: '#666',
  },
  schoolMetaDot: {
    fontSize: 13,
    color: '#ccc',
    marginHorizontal: 6,
  },
  schoolRegion: {
    fontSize: 13,
    color: '#007AFF',
    marginBottom: 2,
  },
  schoolAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
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
