# 함께크는 (Growing Together)

자폐 스펙트럼 아동을 양육하는 부모님들을 위한 종합 케어 관리 앱입니다.

## 주요 기능

### 인증
- 회원가입 / 로그인
- Supabase 인증 연동

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

### UI/UX
- 하단 Footer 네비게이션 (홈, 일정, 기록, 프로필)
- 당겨서 새로고침
- 웹/모바일 호환
- 커스텀 SVG 차트 컴포넌트

## 기술 스택

| 분류 | 기술 |
|------|------|
| Frontend | React Native + Expo (SDK 54) |
| Routing | Expo Router (파일 기반) |
| Backend | Supabase (PostgreSQL) |
| Language | TypeScript |
| Calendar | expo-calendar |
| Charts | react-native-svg |

## 프로젝트 구조

```
hamkke/
├── app/                    # Expo Router 화면
│   ├── (auth)/            # 인증 화면 (로그인, 회원가입)
│   ├── (tabs)/            # 탭 네비게이션 (홈, 일정, 기록, 프로필)
│   ├── child/             # 자녀 관리 화면
│   ├── milestone/         # 마일스톤 화면
│   ├── schedule/          # 일정 화면
│   ├── sensory/           # 감각 프로파일 화면
│   ├── therapy/           # 치료 기록 화면
│   └── _layout.tsx        # 루트 레이아웃
├── components/            # 재사용 컴포넌트
│   ├── BarChart.tsx       # 막대 차트
│   ├── PieChart.tsx       # 원형 차트
│   ├── RadarChart.tsx     # 레이더 차트
│   └── FooterNav.tsx      # 하단 네비게이션
├── contexts/              # React Context
│   ├── AuthContext.tsx    # 인증 상태
│   └── ChildContext.tsx   # 선택된 자녀
├── services/              # API 서비스
│   ├── database.ts        # Supabase CRUD
│   └── calendar.ts        # 네이티브 캘린더
├── utils/                 # 유틸리티 함수
│   └── dateFormat.ts      # 날짜 포맷
├── types/                 # TypeScript 타입
│   └── index.ts           # 타입 정의
└── migrations/            # DB 마이그레이션
```

## 시작하기

### 1. 패키지 설치
```bash
npm install
```

### 2. Supabase 설정
1. [Supabase](https://supabase.com)에서 프로젝트 생성
2. `.env` 파일 생성:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```
3. `supabase-schema.sql` 실행하여 테이블 생성

### 3. 앱 실행
```bash
# Web
npm run web

# iOS
npm run ios

# Android
npm run android
```

---

## 개발 히스토리

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
