# 함께크는 (Growing Together)

자폐 스펙트럼 아동을 양육하는 부모님들을 위한 종합 케어 관리 앱입니다.

## 주요 기능

### 온보딩
- 첫 실행 시 앱 소개 슬라이드
- 로컬 저장소 기반 (로그인 불필요)

### 자녀 프로필
- 자녀 추가 / 수정 / 삭제
- 자녀 선택 (앱 전체에서 공유)

### 일정 관리
- 일정 추가 / 수정 / 삭제
- 반복 일정 지원 (매주 특정 요일)
- 캘린더 뷰 (월간)
- 네이티브 캘린더 연동 (iOS/Android)
- 오늘 날짜 자동 입력

### 치료 기록
- 치료 기록 CRUD
- 치료 유형: 언어, 작업, 행동, 음악, 미술, 감각통합, 물리, 기타
- 치료사 이름, 시간, 메모 기록
- 차트 시각화: 월별 치료 횟수 (BarChart), 유형별 비율 (PieChart)

### 발달 마일스톤
- 마일스톤 CRUD
- 4개 카테고리: 사회성, 의사소통, 운동능력, 인지
- 달성 여부 및 달성 날짜 기록
- 진행률 표시 (달성률 %)
- 카테고리별 필터링

### 감각 프로파일
- 프로파일 CRUD
- 6개 감각 영역: 시각, 청각, 촉각, 전정감각, 고유수용감각, 구강
- 0-10점 스코어링
- 대시보드: 통계 카드 (평균 점수, 총 기록, 최근 평가)
- 레이더 차트 시각화

### 홈 대시보드
- 오늘 일정 / 다가오는 일정 표시
- 통계 카드
- 빠른 액션 버튼 (일정, 치료기록, 마일스톤, 감각평가 등)

### 정보 탭
- 특수학급 설치 학교 검색 (공공데이터 API)
- 복지시설 검색 (장애인복지관, 발달재활센터)
- 지원 서비스 안내 (바우처, 지원금)
- 교육/진학 가이드
- 유용한 사이트 바로가기

### UI/UX
- 하단 Footer 네비게이션 (홈, 일정, 정보, 기록, 프로필)
- 다크모드 지원 (라이트/다크/시스템)
- 당겨서 새로고침
- 웹/모바일 호환
- 커스텀 SVG 차트 컴포넌트

## 기술 스택

| 분류 | 기술 |
|------|------|
| Frontend | React Native + Expo (SDK 52) |
| Routing | Expo Router (파일 기반) |
| Storage | AsyncStorage (로컬) |
| Language | TypeScript |
| Calendar | expo-calendar |
| Notifications | expo-notifications |
| Charts | react-native-svg |
| Build | EAS Build |

## 프로젝트 구조

```
hamkke/
├── app/                    # Expo Router 화면
│   ├── (tabs)/            # 탭 네비게이션 (홈, 일정, 정보, 기록, 프로필)
│   ├── child/             # 자녀 관리 화면
│   ├── info/              # 정보 화면 (학교, 복지시설, 지원서비스)
│   ├── milestone/         # 마일스톤 화면
│   ├── schedule/          # 일정 화면
│   ├── sensory/           # 감각 프로파일 화면
│   ├── therapy/           # 치료 기록 화면
│   ├── onboarding.tsx     # 온보딩 화면
│   └── _layout.tsx        # 루트 레이아웃
├── components/            # 재사용 컴포넌트
│   ├── BarChart.tsx       # 막대 차트
│   ├── PieChart.tsx       # 원형 차트
│   ├── RadarChart.tsx     # 레이더 차트
│   └── FooterNav.tsx      # 하단 네비게이션
├── contexts/              # React Context
│   ├── ChildContext.tsx   # 선택된 자녀
│   └── ThemeContext.tsx   # 테마 (다크모드)
├── services/              # 서비스
│   ├── localStorage.ts    # AsyncStorage CRUD
│   ├── calendar.ts        # 네이티브 캘린더
│   ├── notifications.ts   # 푸시 알림
│   ├── welfareApi.ts      # 복지시설 API
│   └── schoolInfoApi.ts   # 학교정보 API
├── utils/                 # 유틸리티 함수
│   └── dateFormat.ts      # 날짜 포맷
└── types/                 # TypeScript 타입
    └── index.ts           # 타입 정의
```

## 시작하기

### 1. 패키지 설치
```bash
npm install
```

### 2. 앱 실행
```bash
# Web
npm run web

# iOS
npm run ios

# Android
npm run android
```

### 3. 빌드 (EAS)
```bash
# iOS 빌드
eas build --platform ios

# Android 빌드
eas build --platform android
```

---

## 개발 히스토리

### 2026-02-12
- **레이아웃 수정 (Dynamic Island 대응)**
  - 프로필 추가, 치료기록 추가, 마일스톤 추가, 감각 프로파일 추가 화면에 SafeAreaView 적용
  - 정보 탭 하위 화면(교육/진학, 지원 서비스, 복지시설, 특수학급) SafeAreaView 적용
  - iPhone 16 Pro 등 Dynamic Island 기기에서 헤더 겹침 문제 해결

- **다크모드 테마 적용 확대**
  - 치료기록, 마일스톤, 감각 프로파일 추가 화면에 다크모드 테마 색상 적용

- **외부 링크 수정**
  - 교육/진학, 지원 서비스 화면의 외부 링크를 Linking.openURL로 변경 (네이티브 앱 호환)

### 2026-02-07
- **버그 수정**
  - 날짜 표시 오류 수정 (31일이 30일로 표시되는 UTC 변환 문제)
  - 시스템 다크모드 실시간 반영 안되는 문제 수정
  - 일정 추가 화면 취소 버튼 터치 영역 개선 (SafeAreaView 추가)
  - iPhone 시간 선택기 겹침 문제 수정 (모달 방식으로 변경)
  - 특수학급 검색 Picker 클릭 안되는 문제 수정 (iOS 높이 조정)
  - 복지시설 API 인증 방식 수정 (Authorization: Infuser 헤더)
  - app.json userInterfaceStyle을 automatic으로 변경

- **기능 개선**
  - 정보 탭 최근 업데이트 클릭 시 관련 사이트로 이동 기능 추가
  - 외부 링크 열기를 Linking.openURL로 변경 (네이티브 앱 호환)

### 2026-01-31
- **로컬 저장소 마이그레이션**
  - Supabase → AsyncStorage로 데이터 저장 방식 변경
  - 인증 시스템 제거 (로그인 없이 바로 사용)
  - 오프라인 사용 지원

- **푸시 알림 추가**
  - 일정 알림 기능 (n분 전 알림)
  - expo-notifications 연동

- **앱 아이콘 및 스플래시 업데이트**
  - 새로운 앱 아이콘 적용
  - EAS 빌드 설정 추가

### 2026-01-27
- 개인정보처리방침 추가 (App Store 제출용)

### 2026-01-15
- **다크모드 지원**
  - 라이트/다크/시스템 테마 선택
  - 전체 화면 다크모드 적용

- **온보딩 화면 추가**
  - 첫 실행 시 앱 소개 슬라이드 표시

### 2026-01-10
- Footer 네비게이션 추가 (마일스톤, 감각 프로파일 화면)
- "← 홈" 버튼 제거, 하단 탭 방식으로 변경

### 2026-01-09
- **감각 프로파일 대시보드 개선**
  - 통계 카드 추가 (평균 점수, 총 기록, 최근 평가)
  - 레이아웃 변경: 기록 목록 → 차트 요약 순서
  - 텍스트 짤림 수정 (고유수용감각 → 고유수용)

- **네비게이션 수정**
  - 홈 버튼들이 목록 화면으로 연결되도록 변경
  - 추가 화면 대신 대시보드 먼저 표시

- **치료 기록 차트 추가**
  - BarChart: 월별 치료 횟수 (최근 6개월)
  - PieChart: 치료 유형별 비율

- **감각 프로파일 차트 추가**
  - RadarChart: 6개 감각 영역 시각화

- **종합 케어 관리 기능 구현**
  - 홈 대시보드 (통계, 빠른 액션, 오늘/다가오는 일정)
  - 치료 기록 관리 (CRUD, 차트)
  - 발달 마일스톤 (카테고리, 달성률)
  - 감각 프로파일 (6개 영역 스코어링)
  - 네이티브 캘린더 연동 (iOS/Android)

- **UX 개선**
  - 오늘 날짜 자동 입력 (일정, 치료기록, 감각프로파일)
  - 뒤로 가기 버튼 추가
  - TypeScript 오류 수정

### 2026-01-01
- 프로젝트 초기 설정
- Expo + Expo Router 구성
- Supabase 연동 및 데이터베이스 스키마 설계
- 기본 인증 플로우 구현

---

## 라이선스

MIT
