import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FooterNav from '../../components/FooterNav';
import { useTheme } from '../../contexts/ThemeContext';

// 학교급별 진학 정보
const EDUCATION_STAGES = [
  {
    id: 'kindergarten',
    stage: '유치원',
    icon: '🌸',
    ageRange: '만 3세 ~ 5세',
    options: [
      {
        title: '일반유치원 (통합학급)',
        description: '일반 또래와 함께 교육받으며 특수교육 지원',
        pros: ['또래 상호작용', '통합교육 경험'],
        cons: ['개별화 지원 제한적'],
      },
      {
        title: '특수학교 유치부',
        description: '장애 유형별 전문 교육과정 운영',
        pros: ['전문적 치료지원', '소규모 학급'],
        cons: ['비장애 또래 부재'],
      },
      {
        title: '장애아전문 어린이집',
        description: '장애영유아 전문 보육시설',
        pros: ['전문 치료사 상주', '개별화 교육'],
        cons: ['선택지 제한적'],
      },
    ],
    tips: [
      '만 3세부터 특수교육대상자 선정 가능',
      '교육청 특수교육지원센터에서 진단평가',
      '유치원 배치는 보호자 의견 반영',
    ],
  },
  {
    id: 'elementary',
    stage: '초등학교',
    icon: '🎒',
    ageRange: '만 6세 입학',
    options: [
      {
        title: '일반학교 특수학급',
        description: '일반학교 내 특수학급에서 교육',
        pros: ['통합교육 기회', '집 근처 통학'],
        cons: ['학교별 특수학급 유무 확인 필요'],
      },
      {
        title: '일반학교 통합학급',
        description: '일반학급에서 순회교사 지원 받으며 교육',
        pros: ['완전통합 경험'],
        cons: ['지원 시간 제한적'],
      },
      {
        title: '특수학교',
        description: '장애 유형별 전문 특수학교',
        pros: ['전문 교육과정', '치료지원 연계'],
        cons: ['통학 거리', '장애학생만의 환경'],
      },
    ],
    tips: [
      '취학 전년도 11월경 특수교육대상자 선정 신청',
      '1~2월 특수교육운영위원회에서 배치 결정',
      '특수학급 설치 학교는 교육청 홈페이지 확인',
    ],
  },
  {
    id: 'middle',
    stage: '중학교',
    icon: '📖',
    ageRange: '초등학교 졸업 후',
    options: [
      {
        title: '일반중학교 특수학급',
        description: '중학교 내 특수학급 배치',
        pros: ['통합교육', '진로탐색 기회'],
        cons: ['학업 난이도 상승'],
      },
      {
        title: '특수학교 중학부',
        description: '특수학교 중등과정',
        pros: ['전문교육', '직업훈련 시작'],
        cons: ['학교 수 제한적'],
      },
    ],
    tips: [
      '중학교는 의무교육 (무상)',
      '특수교육대상자는 배치교 통보받음',
      '전공과 진학 등 진로 탐색 시작',
    ],
  },
  {
    id: 'high',
    stage: '고등학교',
    icon: '🎓',
    ageRange: '중학교 졸업 후',
    options: [
      {
        title: '일반고 특수학급',
        description: '일반고등학교 내 특수학급',
        pros: ['통합환경', '다양한 진로'],
        cons: ['학교별 여건 상이'],
      },
      {
        title: '특수학교 고등부',
        description: '직업교육 중심 교육과정',
        pros: ['직업훈련 전문화', '전공과 연계'],
        cons: ['제한된 선택지'],
      },
      {
        title: '특성화고 특수학급',
        description: '특성화고 내 직업교육 연계',
        pros: ['실용적 직업훈련'],
        cons: ['학교 수 매우 적음'],
      },
    ],
    tips: [
      '고등학교는 의무교육 아님 (무상교육 시행 중)',
      '직업능력평가 통해 진로 방향 설정',
      '전공과(고등학교 졸업 후 1~2년) 진학 가능',
    ],
  },
  {
    id: 'after',
    stage: '고등학교 이후',
    icon: '🌟',
    ageRange: '만 18세 이후',
    options: [
      {
        title: '전공과',
        description: '특수학교 부설 직업교육과정 (1~2년)',
        pros: ['심화 직업훈련', '취업 연계'],
        cons: ['경쟁률 높음'],
      },
      {
        title: '장애인 평생교육시설',
        description: '평생교육 기회 제공',
        pros: ['지속적 교육', '사회참여'],
        cons: ['지역별 편차'],
      },
      {
        title: '대학 진학',
        description: '장애학생 특별전형 활용',
        pros: ['고등교육 기회', '다양한 경험'],
        cons: ['지원체계 확인 필요'],
      },
    ],
    tips: [
      '전공과는 특수학교별 신청 (경쟁률 높음)',
      '대학 장애학생지원센터 운영 확인',
      '장애인고용공단 취업지원서비스 활용',
    ],
  },
];

// 특수교육대상자 선정 절차
const SELECTION_PROCESS = [
  { step: 1, title: '진단평가 의뢰', desc: '보호자가 교육청에 신청' },
  { step: 2, title: '진단평가 실시', desc: '특수교육지원센터에서 평가' },
  { step: 3, title: '선정 심사', desc: '특수교육운영위원회 심의' },
  { step: 4, title: '배치 결정', desc: '학교 및 학급 배치 통보' },
  { step: 5, title: '교육 시작', desc: '개별화교육계획(IEP) 수립' },
];

export default function EducationGuideScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  const ds = {
    container: { backgroundColor: theme.colors.background },
    header: { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border },
    title: { color: theme.colors.text },
    subtitle: { color: theme.colors.textSecondary },
    processSection: { backgroundColor: theme.colors.card },
    processTitle: { color: theme.colors.text },
    processStepTitle: { color: theme.colors.text },
    processStepDesc: { color: theme.colors.textSecondary },
    processLine: { backgroundColor: theme.colors.accentLight },
    sectionTitle: { color: theme.colors.text },
    stageCard: { backgroundColor: theme.colors.card },
    stageTitle: { color: theme.colors.text },
    stageAge: { color: theme.colors.textSecondary },
    expandIcon: { color: theme.colors.textMuted },
    stageDetails: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border },
    optionsTitle: { color: theme.colors.text },
    optionCard: { backgroundColor: theme.colors.card },
    optionTitle: { color: theme.colors.text },
    optionDesc: { color: theme.colors.textSecondary },
    tipsContainer: { borderTopColor: theme.colors.border },
    tipsTitle: { color: theme.colors.accent },
    tipItem: { color: theme.colors.textSecondary },
    linkButton: { backgroundColor: theme.colors.card },
    linkText: { color: theme.colors.text },
  };

  const handleStagePress = (stageId: string) => {
    setSelectedStage(selectedStage === stageId ? null : stageId);
  };

  const handleLinkPress = async (url: string) => {
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      try {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        }
      } catch (error) {
        console.error('URL 열기 실패:', error);
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, ds.container]} edges={['top']}>
      <ScrollView style={styles.content}>
        {/* 헤더 */}
        <View style={[styles.header, ds.header]}>
          <Text style={[styles.title, ds.title]}>교육/진학 가이드</Text>
          <Text style={[styles.subtitle, ds.subtitle]}>
            학교급별 진학 정보와 절차를 안내합니다
          </Text>
        </View>

        {/* 특수교육대상자 선정 절차 */}
        <View style={[styles.processSection, ds.processSection]}>
          <Text style={[styles.processTitle, ds.processTitle]}>특수교육대상자 선정 절차</Text>
          <View style={styles.processContainer}>
            {SELECTION_PROCESS.map((item, index) => (
              <View key={item.step} style={styles.processItem}>
                <View style={[styles.processStep, { backgroundColor: theme.colors.accent }]}>
                  <Text style={styles.processStepNumber}>{item.step}</Text>
                </View>
                <View style={styles.processContent}>
                  <Text style={[styles.processStepTitle, ds.processStepTitle]}>{item.title}</Text>
                  <Text style={[styles.processStepDesc, ds.processStepDesc]}>{item.desc}</Text>
                </View>
                {index < SELECTION_PROCESS.length - 1 && (
                  <View style={[styles.processLine, ds.processLine]} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* 학교급별 안내 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, ds.sectionTitle]}>학교급별 진학 안내</Text>
          {EDUCATION_STAGES.map((stage) => (
            <TouchableOpacity
              key={stage.id}
              style={[styles.stageCard, ds.stageCard]}
              onPress={() => handleStagePress(stage.id)}
              activeOpacity={0.7}
            >
              <View style={styles.stageHeader}>
                <Text style={styles.stageIcon}>{stage.icon}</Text>
                <View style={styles.stageInfo}>
                  <Text style={[styles.stageTitle, ds.stageTitle]}>{stage.stage}</Text>
                  <Text style={[styles.stageAge, ds.stageAge]}>{stage.ageRange}</Text>
                </View>
                <Text style={[styles.expandIcon, ds.expandIcon]}>
                  {selectedStage === stage.id ? '▲' : '▼'}
                </Text>
              </View>

              {selectedStage === stage.id && (
                <View style={[styles.stageDetails, ds.stageDetails]}>
                  {/* 선택지 */}
                  <Text style={[styles.optionsTitle, ds.optionsTitle]}>교육 형태</Text>
                  {stage.options.map((option, idx) => (
                    <View key={idx} style={[styles.optionCard, ds.optionCard]}>
                      <Text style={[styles.optionTitle, ds.optionTitle]}>{option.title}</Text>
                      <Text style={[styles.optionDesc, ds.optionDesc]}>{option.description}</Text>
                      <View style={styles.prosConsContainer}>
                        <View style={styles.prosSection}>
                          <Text style={styles.prosLabel}>장점</Text>
                          {option.pros.map((pro, i) => (
                            <Text key={i} style={styles.proItem}>+ {pro}</Text>
                          ))}
                        </View>
                        <View style={styles.consSection}>
                          <Text style={styles.consLabel}>고려사항</Text>
                          {option.cons.map((con, i) => (
                            <Text key={i} style={styles.conItem}>- {con}</Text>
                          ))}
                        </View>
                      </View>
                    </View>
                  ))}

                  {/* 팁 */}
                  <View style={[styles.tipsContainer, ds.tipsContainer]}>
                    <Text style={[styles.tipsTitle, ds.tipsTitle]}>알아두세요</Text>
                    {stage.tips.map((tip, idx) => (
                      <Text key={idx} style={[styles.tipItem, ds.tipItem]}>• {tip}</Text>
                    ))}
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* 유용한 링크 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, ds.sectionTitle]}>관련 사이트</Text>
          <View style={styles.linksContainer}>
            <TouchableOpacity
              style={[styles.linkButton, ds.linkButton]}
              onPress={() => handleLinkPress('https://www.nise.go.kr')}
            >
              <Text style={styles.linkIcon}>📖</Text>
              <Text style={[styles.linkText, ds.linkText]}>국립특수교육원</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.linkButton, ds.linkButton]}
              onPress={() => handleLinkPress('https://www.schoolinfo.go.kr')}
            >
              <Text style={styles.linkIcon}>🏫</Text>
              <Text style={[styles.linkText, ds.linkText]}>학교알리미</Text>
            </TouchableOpacity>
          </View>
        </View>

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
  processSection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  processTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  processContainer: {
    paddingLeft: 8,
  },
  processItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
  },
  processStep: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  processStepNumber: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  processContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 20,
  },
  processStepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  processStepDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  processLine: {
    position: 'absolute',
    left: 13,
    top: 28,
    bottom: 0,
    width: 2,
    backgroundColor: '#E3F2FD',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  stageCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  stageIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  stageInfo: {
    flex: 1,
  },
  stageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  stageAge: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  expandIcon: {
    fontSize: 12,
    color: '#999',
  },
  stageDetails: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  optionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  optionCard: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
  },
  prosConsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  prosSection: {
    flex: 1,
  },
  consSection: {
    flex: 1,
  },
  prosLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
  },
  consLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 4,
  },
  proItem: {
    fontSize: 11,
    color: '#2E7D32',
    marginBottom: 2,
  },
  conItem: {
    fontSize: 11,
    color: '#E65100',
    marginBottom: 2,
  },
  tipsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  tipItem: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginBottom: 4,
  },
  linksContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  linkButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  linkIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
});
