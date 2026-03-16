import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import FooterNav from '../../components/FooterNav';
import { useTheme } from '../../contexts/ThemeContext';
import {
  fetchSpecialClassSchools,
  SIDO_CODES,
  SCHOOL_LEVEL_CODES,
  getSggCodes,
  SpecialClassSchool,
} from '../../services/schoolInfoApi';

export default function SchoolScreen() {
  const { theme } = useTheme();
  const [selectedSido, setSelectedSido] = useState('');
  const [selectedSgg, setSelectedSgg] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState<SpecialClassSchool[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const ds = {
    wrapper: { backgroundColor: theme.colors.background },
    container: { backgroundColor: theme.colors.background },
    title: { color: theme.colors.text },
    subtitle: { color: theme.colors.textSecondary },
    infoBox: { backgroundColor: theme.colors.accentLight },
    infoTitle: { color: theme.colors.accent },
    infoText: { color: theme.colors.accent },
    filterSection: { backgroundColor: theme.colors.card },
    filterTitle: { color: theme.colors.text },
    pickerLabel: { color: theme.colors.textSecondary },
    pickerWrapper: { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
    loadingText: { color: theme.colors.textSecondary },
    resultsTitle: { color: theme.colors.text },
    pageInfo: { color: theme.colors.textSecondary },
    emptyResult: { backgroundColor: theme.colors.card },
    emptyResultText: { color: theme.colors.textMuted },
    schoolCard: { backgroundColor: theme.colors.card },
    schoolName: { color: theme.colors.text },
    schoolMetaItem: { color: theme.colors.textSecondary },
    schoolMetaDot: { color: theme.colors.textMuted },
    schoolAddress: { color: theme.colors.textSecondary },
    emptyState: { backgroundColor: theme.colors.card },
    emptyStateTitle: { color: theme.colors.text },
    emptyStateText: { color: theme.colors.textSecondary },
    guideSection: { backgroundColor: theme.colors.card },
    guideTitle: { color: theme.colors.text },
    guideItemTitle: { color: theme.colors.text },
    guideItemText: { color: theme.colors.textSecondary },
    pageNumber: { color: theme.colors.text },
  };

  const sggCodes = getSggCodes(selectedSido);

  const handleSidoChange = (value: string) => {
    setSelectedSido(value);
    setSelectedSgg('');
  };

  const handleSearch = async () => {
    if (!selectedSido) {
      setError('시/도를 선택해주세요.');
      return;
    }
    if (!selectedSgg) {
      setError('시/군/구를 선택해주세요.');
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setError(null);
    setCurrentPage(1);

    try {
      const result = await fetchSpecialClassSchools({
        sidoCode: selectedSido,
        sggCode: selectedSgg,
        schulKndCode: selectedLevel || undefined,
      });

      setSchools(result.schools);
    } catch (err) {
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
    let website = url;
    if (!website.startsWith('http')) {
      website = `https://${website}`;
    }
    if (Platform.OS === 'web') {
      window.open(website, '_blank');
    } else {
      Linking.openURL(website);
    }
  };

  const getLevelBadgeStyle = (level: string) => {
    switch (level) {
      case '02':
        return { backgroundColor: '#E3F2FD' };
      case '03':
        return { backgroundColor: '#E8F5E9' };
      case '04':
        return { backgroundColor: '#FFF3E0' };
      default:
        return { backgroundColor: '#F5F5F5' };
    }
  };

  const getLevelTextStyle = (level: string) => {
    switch (level) {
      case '02':
        return { color: '#1976D2' };
      case '03':
        return { color: '#388E3C' };
      case '04':
        return { color: '#F57C00' };
      default:
        return { color: '#666' };
    }
  };

  // 현재 페이지에 표시할 학교 목록
  const paginatedSchools = schools.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(schools.length / itemsPerPage);

  return (
    <SafeAreaView style={[styles.wrapper, ds.wrapper]} edges={['top']}>
    <ScrollView style={[styles.container, ds.container]}>
      <View style={styles.content}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={[styles.title, ds.title]}>특수학급 설치 학교</Text>
          <Text style={[styles.subtitle, ds.subtitle]}>
            우리 지역의 특수학급이 있는 학교를 찾아보세요
          </Text>
        </View>

        {/* 안내 박스 */}
        <View style={[styles.infoBox, ds.infoBox]}>
          <Text style={[styles.infoTitle, ds.infoTitle]}>특수학급이란?</Text>
          <Text style={[styles.infoText, ds.infoText]}>
            일반학교에서 특수교육대상자에게 통합교육을 실시하기 위해 설치된 학급입니다.
            특수학급에서는 개별화교육계획에 따라 맞춤형 교육을 받을 수 있습니다.
          </Text>
        </View>

        {/* 검색 필터 */}
        <View style={[styles.filterSection, ds.filterSection]}>
          <Text style={[styles.filterTitle, ds.filterTitle]}>지역 선택</Text>

          {/* 시/도 선택 */}
          <View style={styles.pickerContainer}>
            <Text style={[styles.pickerLabel, ds.pickerLabel]}>시/도 *</Text>
            <View style={[styles.pickerWrapper, ds.pickerWrapper]}>
              <Picker
                selectedValue={selectedSido}
                onValueChange={handleSidoChange}
                style={[styles.picker, { color: theme.colors.text, height: Platform.OS === 'ios' ? 150 : 50 }]}
              >
                <Picker.Item label="시/도 선택" value="" color={theme.colors.text} />
                {SIDO_CODES.filter((s) => s.code !== '').map((sido) => (
                  <Picker.Item key={sido.code} label={sido.name} value={sido.code} color={theme.colors.text} />
                ))}
              </Picker>
            </View>
          </View>

          {/* 시/군/구 선택 */}
          <View style={styles.pickerContainer}>
            <Text style={[styles.pickerLabel, ds.pickerLabel]}>시/군/구 *</Text>
            <View style={[styles.pickerWrapper, ds.pickerWrapper]}>
              <Picker
                selectedValue={selectedSgg}
                onValueChange={setSelectedSgg}
                style={[styles.picker, { color: theme.colors.text, height: Platform.OS === 'ios' ? 150 : 50 }]}
                enabled={sggCodes.length > 0}
              >
                <Picker.Item
                  label={sggCodes.length > 0 ? '시/군/구 선택' : '시/도를 먼저 선택하세요'}
                  value=""
                  color={theme.colors.text}
                />
                {sggCodes.map((sgg) => (
                  <Picker.Item key={sgg.code} label={sgg.name} value={sgg.code} color={theme.colors.text} />
                ))}
              </Picker>
            </View>
          </View>

          {/* 학교급 선택 */}
          <View style={styles.pickerContainer}>
            <Text style={[styles.pickerLabel, ds.pickerLabel]}>학교급</Text>
            <View style={[styles.pickerWrapper, ds.pickerWrapper]}>
              <Picker
                selectedValue={selectedLevel}
                onValueChange={setSelectedLevel}
                style={[styles.picker, { color: theme.colors.text, height: Platform.OS === 'ios' ? 150 : 50 }]}
              >
                {SCHOOL_LEVEL_CODES.map((level) => (
                  <Picker.Item key={level.code} label={level.name} value={level.code} color={theme.colors.text} />
                ))}
              </Picker>
            </View>
          </View>

          {/* 검색 버튼 */}
          <TouchableOpacity style={[styles.searchButton, { backgroundColor: theme.colors.accent }]} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>특수학급 학교 검색</Text>
          </TouchableOpacity>
        </View>

        {/* 결과 영역 */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.accent} />
            <Text style={[styles.loadingText, ds.loadingText]}>검색 중...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : hasSearched ? (
          <View style={styles.resultsSection}>
            <Text style={[styles.resultsTitle, ds.resultsTitle]}>
              검색 결과 (전체 {schools.length}개교)
            </Text>
            {schools.length > 0 && (
              <Text style={[styles.pageInfo, ds.pageInfo]}>
                {currentPage} / {totalPages} 페이지
              </Text>
            )}

            {schools.length === 0 ? (
              <View style={[styles.emptyResult, ds.emptyResult]}>
                <Text style={[styles.emptyResultText, ds.emptyResultText]}>
                  해당 지역에 특수학급 설치 학교가 없습니다
                </Text>
              </View>
            ) : (
              <>
                {paginatedSchools.map((school) => (
                  <View key={school.id} style={[styles.schoolCard, ds.schoolCard]}>
                    <View style={styles.schoolHeader}>
                      <Text style={[styles.schoolName, ds.schoolName]}>{school.name}</Text>
                      <View
                        style={[
                          styles.levelBadge,
                          getLevelBadgeStyle(school.schoolLevel),
                        ]}
                      >
                        <Text
                          style={[
                            styles.levelText,
                            getLevelTextStyle(school.schoolLevel),
                          ]}
                        >
                          {school.schoolLevelName}
                        </Text>
                      </View>
                    </View>

                    {/* 특수학급 정보 - 강조 */}
                    <View style={styles.specialClassInfo}>
                      <Text style={styles.specialClassLabel}>특수학급</Text>
                      <Text style={styles.specialClassValue}>
                        {school.specialClassCount}학급 / {school.specialStudentCount}명
                      </Text>
                    </View>

                    <View style={styles.schoolMeta}>
                      <Text style={[styles.schoolMetaItem, ds.schoolMetaItem]}>{school.foundationType}</Text>
                      <Text style={[styles.schoolMetaDot, ds.schoolMetaDot]}>•</Text>
                      <Text style={[styles.schoolMetaItem, ds.schoolMetaItem]}>{school.region}</Text>
                    </View>

                    {school.address && (
                      <Text style={[styles.schoolAddress, ds.schoolAddress]}>{school.address}</Text>
                    )}

                    {/* 액션 버튼 */}
                    <View style={styles.schoolActions}>
                      {school.phone && (
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: theme.colors.accent }]}
                          onPress={() => handleCall(school.phone)}
                        >
                          <Text style={styles.actionBtnText}>전화</Text>
                        </TouchableOpacity>
                      )}
                      {school.website && (
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.actionBtnOutline, { borderColor: theme.colors.accent }]}
                          onPress={() => handleWebsite(school.website)}
                        >
                          <Text
                            style={[styles.actionBtnText, styles.actionBtnTextOutline, { color: theme.colors.accent }]}
                          >
                            홈페이지
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                  <View style={styles.pagination}>
                    <TouchableOpacity
                      style={[
                        styles.pageBtn,
                        { backgroundColor: theme.colors.accent },
                        currentPage === 1 && styles.pageBtnDisabled,
                      ]}
                      onPress={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <Text
                        style={[
                          styles.pageBtnText,
                          currentPage === 1 && styles.pageBtnTextDisabled,
                        ]}
                      >
                        이전
                      </Text>
                    </TouchableOpacity>
                    <Text style={[styles.pageNumber, ds.pageNumber]}>{currentPage}</Text>
                    <TouchableOpacity
                      style={[
                        styles.pageBtn,
                        { backgroundColor: theme.colors.accent },
                        currentPage >= totalPages && styles.pageBtnDisabled,
                      ]}
                      onPress={() =>
                        currentPage < totalPages && setCurrentPage(currentPage + 1)
                      }
                      disabled={currentPage >= totalPages}
                    >
                      <Text
                        style={[
                          styles.pageBtnText,
                          currentPage >= totalPages && styles.pageBtnTextDisabled,
                        ]}
                      >
                        다음
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        ) : (
          <View style={[styles.emptyState, ds.emptyState]}>
            <Text style={styles.emptyStateIcon}>🏫</Text>
            <Text style={[styles.emptyStateTitle, ds.emptyStateTitle]}>특수학급 학교 검색</Text>
            <Text style={[styles.emptyStateText, ds.emptyStateText]}>
              지역을 선택하고 검색 버튼을 눌러{'\n'}
              특수학급이 설치된 학교를 찾아보세요
            </Text>
          </View>
        )}

        {/* 추가 안내 */}
        <View style={[styles.guideSection, ds.guideSection]}>
          <Text style={[styles.guideTitle, ds.guideTitle]}>특수학급 입학 안내</Text>
          <View style={styles.guideItem}>
            <Text style={[styles.guideNumber, { backgroundColor: theme.colors.accent }]}>1</Text>
            <View style={styles.guideContent}>
              <Text style={[styles.guideItemTitle, ds.guideItemTitle]}>특수교육대상자 선정</Text>
              <Text style={[styles.guideItemText, ds.guideItemText]}>
                특수교육지원센터에서 진단/평가 후 선정
              </Text>
            </View>
          </View>
          <View style={styles.guideItem}>
            <Text style={[styles.guideNumber, { backgroundColor: theme.colors.accent }]}>2</Text>
            <View style={styles.guideContent}>
              <Text style={[styles.guideItemTitle, ds.guideItemTitle]}>배치 희망 학교 신청</Text>
              <Text style={[styles.guideItemText, ds.guideItemText]}>
                거주지 인근 특수학급 설치 학교로 신청
              </Text>
            </View>
          </View>
          <View style={styles.guideItem}>
            <Text style={[styles.guideNumber, { backgroundColor: theme.colors.accent }]}>3</Text>
            <View style={styles.guideContent}>
              <Text style={[styles.guideItemTitle, ds.guideItemTitle]}>특수교육운영위원회 심사</Text>
              <Text style={[styles.guideItemText, ds.guideItemText]}>
                교육지원청에서 배치 결정
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
    <FooterNav />
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  infoBox: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1B5E20',
    lineHeight: 20,
  },
  filterSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    overflow: 'hidden',
    minHeight: 50,
  },
  picker: {
    width: '100%',
  },
  searchButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorBox: {
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
  },
  resultsSection: {
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  pageInfo: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
  },
  emptyResult: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptyResultText: {
    fontSize: 14,
    color: '#999',
  },
  schoolCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  schoolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '500',
  },
  specialClassInfo: {
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  specialClassLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F57C00',
    marginRight: 8,
  },
  specialClassValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#E65100',
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
    marginHorizontal: 8,
  },
  schoolAddress: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  schoolActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionBtnOutline: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  actionBtnTextOutline: {
    color: '#4CAF50',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 16,
  },
  pageBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#4CAF50',
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  guideSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  guideItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  guideNumber: {
    width: 28,
    height: 28,
    backgroundColor: '#4CAF50',
    borderRadius: 14,
    textAlign: 'center',
    lineHeight: 28,
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginRight: 12,
  },
  guideContent: {
    flex: 1,
  },
  guideItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  guideItemText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});
