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

// 지원 서비스 카테고리
const SUPPORT_CATEGORIES = [
  {
    id: 'voucher',
    title: '발달재활서비스 바우처',
    icon: '🎫',
    description: '만 18세 미만 장애아동 치료 지원',
    eligibility: '장애등록 아동 (만 18세 미만)',
    amount: '월 14~25만원',
    howTo: '주민센터 신청 → 소득조사 → 바우처 카드 발급',
    details: [
      '언어치료, 청능치료, 미술치료, 음악치료 등',
      '소득수준에 따라 본인부담금 차등',
      '매년 재신청 필요',
    ],
  },
  {
    id: 'activity',
    title: '장애인활동지원서비스',
    icon: '🤝',
    description: '일상생활 및 사회활동 지원',
    eligibility: '만 6세 이상 ~ 만 65세 미만 장애인',
    amount: '월 60~480시간',
    howTo: '주민센터 신청 → 방문조사 → 등급심의 → 서비스 이용',
    details: [
      '신체활동지원, 가사활동지원, 사회활동지원',
      '등급에 따라 월 이용시간 결정',
      '본인부담금 있음 (기초생활수급자 면제)',
    ],
  },
  {
    id: 'education',
    title: '특수교육 관련서비스',
    icon: '📚',
    description: '특수교육대상자 치료지원',
    eligibility: '특수교육대상자로 선정된 학생',
    amount: '학기당 치료지원비 지급',
    howTo: '학교 특수교육지원센터 신청',
    details: [
      '언어치료, 물리치료, 작업치료 등',
      '학교 외부 치료실 이용 시 비용 지원',
      '바우처와 중복 불가',
    ],
  },
  {
    id: 'care',
    title: '장애아가족양육지원',
    icon: '👨‍👩‍👧',
    description: '돌봄 및 휴식 지원',
    eligibility: '만 18세 미만 장애아동 가정',
    amount: '연 840시간 이내',
    howTo: '주민센터 신청 → 자격확인 → 서비스 이용',
    details: [
      '아이돌봄서비스 연계',
      '부모 휴식 및 긴급돌봄 지원',
      '소득기준에 따라 본인부담금 차등',
    ],
  },
  {
    id: 'allowance',
    title: '장애아동수당',
    icon: '💰',
    description: '저소득 장애아동 수당 지급',
    eligibility: '만 18세 미만 등록 장애아동',
    amount: '월 2~22만원',
    howTo: '주민센터 신청 → 소득조사 → 지급',
    details: [
      '기초생활수급자, 차상위계층 우선',
      '장애정도에 따라 금액 차등',
      '매월 20일 지급',
    ],
  },
  {
    id: 'pension',
    title: '장애인연금 (성인)',
    icon: '🏦',
    description: '만 18세 이상 중증장애인',
    eligibility: '만 18세 이상 중증장애인 (소득하위 70%)',
    amount: '월 최대 40만원',
    howTo: '주민센터 신청',
    details: [
      '기초급여 + 부가급여',
      '소득수준에 따라 금액 결정',
      '65세 이후 기초연금으로 전환',
    ],
  },
];

// 자주 묻는 질문
const FAQ = [
  {
    question: '발달재활서비스와 특수교육 치료지원을 동시에 받을 수 있나요?',
    answer: '아니요, 두 서비스는 중복 수혜가 불가합니다. 한 가지만 선택해야 합니다.',
  },
  {
    question: '바우처 신청은 언제 해야 하나요?',
    answer: '연중 수시로 신청 가능합니다. 단, 예산 소진 시 대기가 발생할 수 있으므로 빠른 신청을 권장합니다.',
  },
  {
    question: '소득 기준은 어떻게 산정되나요?',
    answer: '가구의 소득인정액으로 산정됩니다. 주민센터에서 정확한 상담을 받으시기 바랍니다.',
  },
];

export default function SupportServiceScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const ds = {
    container: { backgroundColor: theme.colors.background },
    header: { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border },
    title: { color: theme.colors.text },
    subtitle: { color: theme.colors.textSecondary },
    infoBox: { backgroundColor: theme.colors.accentLight },
    infoTitle: { color: theme.colors.accent },
    infoText: { color: theme.colors.accent },
    sectionTitle: { color: theme.colors.text },
    serviceCard: { backgroundColor: theme.colors.card },
    serviceTitle: { color: theme.colors.text },
    serviceDesc: { color: theme.colors.textSecondary },
    expandIcon: { color: theme.colors.textMuted },
    serviceDetails: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border },
    detailLabel: { color: theme.colors.textSecondary },
    detailValue: { color: theme.colors.text },
    detailList: { borderTopColor: theme.colors.border },
    detailListTitle: { color: theme.colors.text },
    detailListItem: { color: theme.colors.textSecondary },
    faqCard: { backgroundColor: theme.colors.card },
    faqQuestion: { color: theme.colors.text },
    faqIcon: { color: theme.colors.accent },
    faqAnswer: { color: theme.colors.textSecondary, borderTopColor: theme.colors.border },
    linkButton: { backgroundColor: theme.colors.card },
    linkText: { color: theme.colors.text },
  };

  const toggleCard = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
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
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, ds.container]} edges={['top']}>
      <ScrollView style={styles.content}>
        {/* 헤더 */}
        <View style={[styles.header, ds.header]}>
          <Text style={[styles.title, ds.title]}>지원 서비스 안내</Text>
          <Text style={[styles.subtitle, ds.subtitle]}>
            장애아동 및 가족을 위한 지원 서비스
          </Text>
        </View>

        {/* 안내 박스 */}
        <View style={[styles.infoBox, ds.infoBox]}>
          <Text style={styles.infoIcon}>📋</Text>
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, ds.infoTitle]}>신청 전 확인하세요!</Text>
            <Text style={[styles.infoText, ds.infoText]}>
              각 서비스마다 자격 요건과 신청 방법이 다릅니다.{'\n'}
              자세한 내용은 주민센터 또는 복지로에서 확인하세요.
            </Text>
          </View>
        </View>

        {/* 지원 서비스 목록 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, ds.sectionTitle]}>지원 서비스</Text>
          {SUPPORT_CATEGORIES.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[styles.serviceCard, ds.serviceCard]}
              onPress={() => toggleCard(service.id)}
              activeOpacity={0.7}
            >
              <View style={styles.serviceHeader}>
                <Text style={styles.serviceIcon}>{service.icon}</Text>
                <View style={styles.serviceInfo}>
                  <Text style={[styles.serviceTitle, ds.serviceTitle]}>{service.title}</Text>
                  <Text style={[styles.serviceDesc, ds.serviceDesc]}>{service.description}</Text>
                </View>
                <Text style={[styles.expandIcon, ds.expandIcon]}>
                  {expandedCard === service.id ? '▲' : '▼'}
                </Text>
              </View>

              {expandedCard === service.id && (
                <View style={[styles.serviceDetails, ds.serviceDetails]}>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, ds.detailLabel]}>대상</Text>
                    <Text style={[styles.detailValue, ds.detailValue]}>{service.eligibility}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, ds.detailLabel]}>지원 금액</Text>
                    <Text style={[styles.detailValue, ds.detailValue]}>{service.amount}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, ds.detailLabel]}>신청 방법</Text>
                    <Text style={[styles.detailValue, ds.detailValue]}>{service.howTo}</Text>
                  </View>
                  <View style={[styles.detailList, ds.detailList]}>
                    <Text style={[styles.detailListTitle, ds.detailListTitle]}>상세 내용</Text>
                    {service.details.map((detail, idx) => (
                      <Text key={idx} style={[styles.detailListItem, ds.detailListItem]}>
                        • {detail}
                      </Text>
                    ))}
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* 자주 묻는 질문 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, ds.sectionTitle]}>자주 묻는 질문</Text>
          {FAQ.map((faq, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.faqCard, ds.faqCard]}
              onPress={() => toggleFaq(index)}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <Text style={[styles.faqQuestion, ds.faqQuestion]}>Q. {faq.question}</Text>
                <Text style={[styles.faqIcon, ds.faqIcon]}>
                  {expandedFaq === index ? '−' : '+'}
                </Text>
              </View>
              {expandedFaq === index && (
                <Text style={[styles.faqAnswer, ds.faqAnswer]}>A. {faq.answer}</Text>
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
              onPress={() => handleLinkPress('https://www.bokjiro.go.kr')}
            >
              <Text style={styles.linkIcon}>🌐</Text>
              <Text style={[styles.linkText, ds.linkText]}>복지로</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.linkButton, ds.linkButton]}
              onPress={() => handleLinkPress('https://www.socialservice.or.kr')}
            >
              <Text style={styles.linkIcon}>🎫</Text>
              <Text style={[styles.linkText, ds.linkText]}>사회서비스</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.linkButton, ds.linkButton]}
              onPress={() => handleLinkPress('https://www.129.go.kr')}
            >
              <Text style={styles.linkIcon}>📞</Text>
              <Text style={[styles.linkText, ds.linkText]}>정부24</Text>
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
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
    color: '#2E7D32',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20,
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
  serviceCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  serviceIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  serviceDesc: {
    fontSize: 13,
    color: '#666',
  },
  expandIcon: {
    fontSize: 12,
    color: '#999',
  },
  serviceDetails: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  detailLabel: {
    width: 80,
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },
  detailList: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  detailListTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  detailListItem: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    lineHeight: 18,
  },
  faqCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    padding: 16,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    lineHeight: 20,
  },
  faqIcon: {
    fontSize: 18,
    color: '#007AFF',
    marginLeft: 8,
  },
  faqAnswer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
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
