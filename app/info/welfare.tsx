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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FooterNav from '../../components/FooterNav';
import { useTheme } from '../../contexts/ThemeContext';
import {
  fetchWelfareCenters,
  fetchRehabCenters,
  transformWelfareCenter,
  transformRehabCenter,
  Facility,
} from '../../services/welfareApi';

// 시설 유형
const FACILITY_TYPES = [
  { code: 'all', name: '전체', icon: '🏛️' },
  { code: 'welfare', name: '장애인복지관', icon: '🏢' },
  { code: 'rehab', name: '발달재활센터', icon: '💊' },
];

// 시도 목록
const REGIONS = [
  { code: '', name: '전체 지역' },
  { code: '서울', name: '서울' },
  { code: '부산', name: '부산' },
  { code: '대구', name: '대구' },
  { code: '인천', name: '인천' },
  { code: '광주', name: '광주' },
  { code: '대전', name: '대전' },
  { code: '울산', name: '울산' },
  { code: '세종', name: '세종' },
  { code: '경기', name: '경기' },
  { code: '강원', name: '강원' },
  { code: '충북', name: '충북' },
  { code: '충남', name: '충남' },
  { code: '전북', name: '전북' },
  { code: '전남', name: '전남' },
  { code: '경북', name: '경북' },
  { code: '경남', name: '경남' },
  { code: '제주', name: '제주' },
];

export default function WelfareSearchScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [selectedType, setSelectedType] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const ds = {
    container: { backgroundColor: theme.colors.background },
    header: { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border },
    title: { color: theme.colors.text },
    subtitle: { color: theme.colors.textSecondary },
    filterSection: { backgroundColor: theme.colors.card },
    filterLabel: { color: theme.colors.textSecondary },
    typeButton: { backgroundColor: theme.colors.surface },
    typeText: { color: theme.colors.textSecondary },
    regionButton: { backgroundColor: theme.colors.surface },
    regionText: { color: theme.colors.textSecondary },
    searchInput: { backgroundColor: theme.colors.surface, color: theme.colors.text },
    tipBox: { backgroundColor: theme.colors.accentLight },
    tipText: { color: theme.colors.accent },
    resultsTitle: { color: theme.colors.text },
    pageInfo: { color: theme.colors.textSecondary },
    facilityCard: { backgroundColor: theme.colors.card },
    facilityName: { color: theme.colors.text },
    facilityAddress: { color: theme.colors.accent },
    facilityAddressDetail: { color: theme.colors.textSecondary },
    emptyStateText: { color: theme.colors.textMuted },
    emptyResultText: { color: theme.colors.textMuted },
    pageNumber: { color: theme.colors.text },
  };

  const handleSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    setError(null);
    setCurrentPage(1);

    try {
      let allFacilities: Facility[] = [];
      let total = 0;

      // 복지관 검색
      if (selectedType === 'all' || selectedType === 'welfare') {
        const welfareResult = await fetchWelfareCenters({
          page: 1,
          perPage: 50,
          sido: selectedRegion || undefined,
        });
        const welfareFacilities = welfareResult.data.map((item, idx) =>
          transformWelfareCenter(item, idx)
        );
        allFacilities = [...allFacilities, ...welfareFacilities];
        total += welfareResult.matchCount;
      }

      // 발달재활센터 검색
      if (selectedType === 'all' || selectedType === 'rehab') {
        // API의 시도명 형식 맞추기
        let sidoQuery = selectedRegion;
        if (selectedRegion === '서울') sidoQuery = '서울특별시';
        else if (selectedRegion === '부산') sidoQuery = '부산광역시';
        else if (selectedRegion === '대구') sidoQuery = '대구광역시';
        else if (selectedRegion === '인천') sidoQuery = '인천광역시';
        else if (selectedRegion === '광주') sidoQuery = '광주광역시';
        else if (selectedRegion === '대전') sidoQuery = '대전광역시';
        else if (selectedRegion === '울산') sidoQuery = '울산광역시';
        else if (selectedRegion === '세종') sidoQuery = '세종특별자치시';
        else if (selectedRegion === '경기') sidoQuery = '경기도';
        else if (selectedRegion === '강원') sidoQuery = '강원특별자치도';
        else if (selectedRegion === '충북') sidoQuery = '충청북도';
        else if (selectedRegion === '충남') sidoQuery = '충청남도';
        else if (selectedRegion === '전북') sidoQuery = '전북특별자치도';
        else if (selectedRegion === '전남') sidoQuery = '전라남도';
        else if (selectedRegion === '경북') sidoQuery = '경상북도';
        else if (selectedRegion === '경남') sidoQuery = '경상남도';
        else if (selectedRegion === '제주') sidoQuery = '제주특별자치도';

        const rehabResult = await fetchRehabCenters({
          page: 1,
          perPage: 50,
          sido: sidoQuery || undefined,
        });
        const rehabFacilities = rehabResult.data.map((item, idx) =>
          transformRehabCenter(item, idx)
        );
        allFacilities = [...allFacilities, ...rehabFacilities];
        total += rehabResult.matchCount;
      }

      // 검색어 필터링
      if (searchQuery) {
        allFacilities = allFacilities.filter(
          (f) =>
            f.name.includes(searchQuery) ||
            f.address.includes(searchQuery) ||
            f.sigungu.includes(searchQuery)
        );
      }

      setFacilities(allFacilities);
      setTotalCount(total);
    } catch (err: any) {
      const errorMessage = err?.message || '알 수 없는 오류';
      setError(`데이터를 불러오는 중 오류가 발생했습니다.\n(${errorMessage})`);
      setFacilities([]);
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

  return (
    <SafeAreaView style={[styles.container, ds.container]} edges={['top']}>
      <ScrollView style={styles.content}>
        {/* 헤더 */}
        <View style={[styles.header, ds.header]}>
          <Text style={[styles.title, ds.title]}>복지시설 찾기</Text>
          <Text style={[styles.subtitle, ds.subtitle]}>
            장애인복지관, 발달재활센터를 검색하세요
          </Text>
        </View>

        {/* 시설 유형 필터 */}
        <View style={[styles.filterSection, ds.filterSection]}>
          <Text style={[styles.filterLabel, ds.filterLabel]}>시설 유형</Text>
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
                  ds.typeButton,
                  selectedType === type.code && styles.typeButtonSelected,
                  selectedType === type.code && { backgroundColor: theme.colors.accent },
                ]}
                onPress={() => setSelectedType(type.code)}
              >
                <Text style={styles.typeIcon}>{type.icon}</Text>
                <Text
                  style={[
                    styles.typeText,
                    ds.typeText,
                    selectedType === type.code && styles.typeTextSelected,
                  ]}
                >
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* 지역 선택 */}
          <Text style={[styles.filterLabel, ds.filterLabel]}>지역</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.regionScroll}
          >
            {REGIONS.map((region) => (
              <TouchableOpacity
                key={region.code}
                style={[
                  styles.regionButton,
                  ds.regionButton,
                  selectedRegion === region.code && styles.regionButtonSelected,
                  selectedRegion === region.code && { backgroundColor: theme.colors.accentLight, borderColor: theme.colors.accent },
                ]}
                onPress={() => setSelectedRegion(region.code)}
              >
                <Text
                  style={[
                    styles.regionText,
                    ds.regionText,
                    selectedRegion === region.code && styles.regionTextSelected,
                    selectedRegion === region.code && { color: theme.colors.accent },
                  ]}
                >
                  {region.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* 검색어 */}
          <View style={styles.searchRow}>
            <TextInput
              style={[styles.searchInput, ds.searchInput]}
              placeholder="시설명, 주소 검색"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={theme.colors.textMuted}
            />
            <TouchableOpacity style={[styles.searchButton, { backgroundColor: theme.colors.accent }]} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>검색</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 안내 */}
        <View style={[styles.tipBox, ds.tipBox]}>
          <Text style={styles.tipIcon}>📡</Text>
          <Text style={[styles.tipText, ds.tipText]}>
            공공데이터포털 API를 통해 실시간 정보를 제공합니다.
            {'\n'}장애인복지관 {266}개, 발달재활센터 {2746}개 등록
          </Text>
        </View>

        {/* 검색 결과 */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color={theme.colors.accent}
            style={{ marginTop: 40 }}
          />
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : hasSearched ? (
          <View style={styles.resultsSection}>
            <Text style={[styles.resultsTitle, ds.resultsTitle]}>
              검색 결과 (전체 {facilities.length}개)
            </Text>
            <Text style={[styles.pageInfo, ds.pageInfo]}>
              {currentPage} / {Math.ceil(facilities.length / itemsPerPage)} 페이지
            </Text>
            {facilities.length === 0 ? (
              <View style={styles.emptyResult}>
                <Text style={[styles.emptyResultText, ds.emptyResultText]}>검색 결과가 없습니다</Text>
              </View>
            ) : (
              <>
              {facilities
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((facility) => (
                <View key={facility.id} style={[styles.facilityCard, ds.facilityCard]}>
                  <View style={styles.facilityHeader}>
                    <Text style={[styles.facilityName, ds.facilityName]}>{facility.name}</Text>
                    <View
                      style={[
                        styles.facilityTypeBadge,
                        facility.type === '발달재활' && styles.rehabBadge,
                      ]}
                    >
                      <Text
                        style={[
                          styles.facilityTypeText,
                          facility.type === '발달재활' && styles.rehabText,
                        ]}
                      >
                        {facility.type}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.facilityAddress, ds.facilityAddress]}>
                    {facility.sido} {facility.sigungu}
                  </Text>
                  <Text style={[styles.facilityAddressDetail, ds.facilityAddressDetail]}>
                    {facility.address}
                  </Text>

                  {/* 액션 버튼 */}
                  {facility.phone && (
                    <View style={styles.facilityActions}>
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: theme.colors.accent }]}
                        onPress={() => handleCall(facility.phone!)}
                      >
                        <Text style={styles.actionBtnText}>
                          📞 {facility.phone}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}

              {/* 페이지네이션 */}
              <View style={styles.pagination}>
                <TouchableOpacity
                  style={[styles.pageBtn, { backgroundColor: theme.colors.accent }, currentPage === 1 && styles.pageBtnDisabled]}
                  onPress={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <Text style={[styles.pageBtnText, currentPage === 1 && styles.pageBtnTextDisabled]}>
                    ◀ 이전
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.pageNumber, ds.pageNumber]}>{currentPage}</Text>
                <TouchableOpacity
                  style={[styles.pageBtn, { backgroundColor: theme.colors.accent }, currentPage >= Math.ceil(facilities.length / itemsPerPage) && styles.pageBtnDisabled]}
                  onPress={() => currentPage < Math.ceil(facilities.length / itemsPerPage) && setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= Math.ceil(facilities.length / itemsPerPage)}
                >
                  <Text style={[styles.pageBtnText, currentPage >= Math.ceil(facilities.length / itemsPerPage) && styles.pageBtnTextDisabled]}>
                    다음 ▶
                  </Text>
                </TouchableOpacity>
              </View>
              </>
            )}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🏛️</Text>
            <Text style={[styles.emptyStateText, ds.emptyStateText]}>
              시설 유형과 지역을 선택하고{'\n'}검색 버튼을 눌러주세요
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <FooterNav />
    </SafeAreaView>
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
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  facilityTypeBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  rehabBadge: {
    backgroundColor: '#FFF3E0',
  },
  facilityTypeText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '600',
  },
  rehabText: {
    color: '#E65100',
  },
  facilityAddress: {
    fontSize: 13,
    color: '#007AFF',
    marginBottom: 2,
  },
  facilityAddressDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
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
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
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
  pageInfo: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 16,
  },
  pageBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  pageBtnDisabled: {
    backgroundColor: '#E0E0E0',
  },
  pageBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  pageBtnTextDisabled: {
    color: '#999',
  },
  pageNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 40,
    textAlign: 'center',
  },
});
