# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com) 접속
2. "Start your project" 클릭 (또는 로그인)
3. "New Project" 클릭
4. 프로젝트 정보 입력:
   - **Name**: hamkke (또는 원하는 이름)
   - **Database Password**: 안전한 비밀번호 생성 (잘 보관하세요!)
   - **Region**: Northeast Asia (Seoul) 선택 (한국에서 가장 빠름)
   - **Pricing Plan**: Free 선택
5. "Create new project" 클릭
6. 프로젝트 생성 대기 (약 2분 소요)

## 2. API 키 복사

프로젝트가 생성되면:

1. 왼쪽 메뉴에서 **Settings** (톱니바퀴 아이콘) 클릭
2. **API** 탭 클릭
3. 다음 정보를 복사:
   - **Project URL** (예: `https://xxxxx.supabase.co`)
   - **anon public** 키 (아래에 있는 긴 문자열)

## 3. 환경 변수 설정

프로젝트 루트의 `.env` 파일을 열고 복사한 정보를 입력:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=여기에_anon_public_키_붙여넣기
```

## 4. 데이터베이스 스키마 생성

1. Supabase 대시보드에서 왼쪽 메뉴의 **SQL Editor** 클릭
2. "New query" 클릭
3. `supabase-schema.sql` 파일의 내용을 복사해서 붙여넣기
4. **RUN** 버튼 클릭 (또는 Ctrl/Cmd + Enter)
5. 성공 메시지 확인

## 5. Row Level Security (RLS) 정책 설정

1. SQL Editor에서 "New query" 다시 클릭
2. `supabase-rls.sql` 파일의 내용을 복사해서 붙여넣기
3. **RUN** 버튼 클릭
4. 성공 메시지 확인

## 6. 테이블 확인

1. 왼쪽 메뉴에서 **Table Editor** 클릭
2. 다음 테이블들이 생성되었는지 확인:
   - children (자녀 프로필)
   - schedules (일정)
   - therapy_records (치료 기록)
   - sensory_profiles (감각 프로파일)
   - milestones (발달 마일스톤)

## 7. 인증 설정 (선택)

나중에 소셜 로그인을 추가하려면:

1. **Authentication** > **Providers** 클릭
2. 원하는 제공자 활성화 (Google, Apple 등)

## 완료!

이제 앱에서 Supabase를 사용할 준비가 되었습니다.
앱을 다시 시작하면 Supabase 연결이 활성화됩니다.

```bash
npm start
```

## 문제 해결

### 연결 오류가 발생하는 경우:
1. `.env` 파일의 URL과 키가 올바른지 확인
2. 개발 서버를 재시작 (Ctrl+C 후 다시 `npm start`)
3. Supabase 프로젝트가 "Active" 상태인지 확인

### RLS 정책 오류:
- SQL Editor에서 에러 메시지 확인
- 각 SQL 명령을 개별적으로 실행해보기
