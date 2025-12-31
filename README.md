# 함께크는 - 자폐 아동 케어 앱

자폐 스펙트럼 아동을 양육하는 부모님들을 위한 종합 관리 앱입니다.

## 주요 기능

- **일정 관리**: 치료, 교육, 일상 활동 일정 관리 및 알림
- **치료 기록**: 치료 세션 기록 및 진행 상황 추적
- **감각 프로파일**: 감각 영역별 평가 및 변화 추적
- **발달 마일스톤**: 발달 단계 체크 및 기록
- **정보 제공**: 자폐 관련 정보 및 자료 제공

## 기술 스택

- **Frontend**: React Native + Expo
- **Routing**: Expo Router
- **Backend**: Supabase (PostgreSQL)
- **Language**: TypeScript

## 시작하기

### 환경 설정

1. 패키지 설치
```bash
npm install
```

2. Supabase 프로젝트 생성
   - [Supabase](https://supabase.com)에서 프로젝트 생성
   - `.env` 파일을 생성하고 Supabase URL과 Anon Key 입력

3. 앱 실행
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## 프로젝트 구조

```
hamkke/
├── app/                  # Expo Router 화면
│   ├── (tabs)/          # 탭 네비게이션
│   └── _layout.tsx      # 루트 레이아웃
├── components/          # 재사용 가능한 컴포넌트
├── services/            # API 및 Supabase 통신
├── hooks/               # 커스텀 React hooks
├── utils/               # 유틸리티 함수
├── types/               # TypeScript 타입 정의
└── constants/           # 상수 정의
```

## 라이선스

MIT
