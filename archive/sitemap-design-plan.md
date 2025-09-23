# 🗺️ ScoreBoard 사이트맵 & 디자인 마스터플랜

## 📱 반응형 디자인 전략

### 브레이크포인트 시스템 (Material UI 3 기반)
```css
/* 모바일 우선 접근법 */
xs: 0px      // 📱 모바일 (320-599px)
sm: 600px    // 📱 큰 모바일 / 작은 태블릿 (600-899px)
md: 900px    // 💻 태블릿 (900-1199px)
lg: 1200px   // 🖥️ 데스크톱 (1200-1535px)
xl: 1536px   // 🖥️ 대형 데스크톱 (1536px+)
```

### 컨텐츠 우선순위 매트릭스
| 화면 크기 | 1순위 | 2순위 | 3순위 | 숨김 |
|-----------|-------|-------|-------|------|
| **모바일 (xs)** | 스코어, 핵심액션 | 네비게이션 | 기본정보 | 상세통계, 사이드바 |
| **태블릿 (md)** | 스코어, 액션, 통계 | 네비게이션, 상세정보 | 사이드바 일부 | 고급기능 |
| **데스크톱 (lg+)** | 모든 정보 표시 | 멀티패널 레이아웃 | 고급 대시보드 | - |

---

## 🎨 Material Design 3 테마 시스템

### 색상 팔레트 (스포츠 비즈니스 특화)
```typescript
// Primary - 프로페셔널 블루 (신뢰성, 안정성)
primary: {
  50: '#E3F2FD',   // 라이트 배경
  100: '#BBDEFB',  // 카드 배경
  500: '#1976D2',  // 메인 액션
  700: '#1565C0',  // 호버 상태
  900: '#0D47A1'   // 텍스트 강조
}

// Secondary - 스포츠 그린 (성장, 성공)
secondary: {
  50: '#E8F5E8',
  500: '#4CAF50',  // 승리, 성공 지표
  700: '#388E3C'
}

// Warning - 골드 (중요성, 주의)
warning: {
  500: '#FF9800',  // 경고, 보류 상태
}

// Error - 레드 (패배, 오류)
error: {
  500: '#F44336',  // 패배, 오류
}

// Surface Colors (MD3 다이나믹 컬러)
surface: {
  100: '#F5F5F5',  // 카드 배경
  200: '#EEEEEE',  // 구분선
  300: '#E0E0E0'   // 비활성 요소
}
```

### 타이포그래피 스케일
```typescript
typography: {
  // 대시보드 헤드라인
  h1: { fontSize: '2.5rem', fontWeight: 700 },    // 주요 타이틀
  h2: { fontSize: '2rem', fontWeight: 600 },      // 섹션 제목
  h3: { fontSize: '1.5rem', fontWeight: 600 },    // 카드 제목

  // 스포츠 스코어 특화
  scoreDisplay: {
    fontSize: '3rem',
    fontWeight: 900,
    fontFamily: 'Roboto Mono'  // 숫자 가독성
  },

  // 데이터 표시
  body1: { fontSize: '1rem', lineHeight: 1.6 },   // 일반 텍스트
  caption: { fontSize: '0.875rem' },              // 메타 정보

  // 모바일 최적화
  '@media (max-width: 600px)': {
    h1: { fontSize: '1.75rem' },
    h2: { fontSize: '1.5rem' },
    scoreDisplay: { fontSize: '2rem' }
  }
}
```

---

## 📊 비즈니스 대시보드 UI/UX 아키텍처

### 정보 계층 구조 (F-패턴 기반)
```
┌─────────────────────────────────────┐
│ 🏠 Navigation Bar                   │ ← 1차: 빠른 네비게이션
├─────────────────────────────────────┤
│ 📊 KPI 카드 영역 (Horizontal)        │ ← 2차: 핵심 지표
├─────┬───────────────────┬───────────┤
│ 📋  │ 📈 Main Content   │ 📌        │ ← 3차: 주요 콘텐츠
│List │                   │Sidebar    │
│     │                   │           │
└─────┴───────────────────┴───────────┘
```

### 사용자 플로우 최적화
```typescript
// 역할별 대시보드 레이아웃
const dashboardLayouts = {
  admin: {
    priority: ['시스템 상태', '사용자 관리', '통계', '설정'],
    widgets: ['실시간 모니터링', '수익 분석', '사용자 활동']
  },

  clubManager: {
    priority: ['팀 성과', '경기 일정', '선수 관리', '통계'],
    widgets: ['다음 경기', '팀 순위', '선수 컨디션']
  },

  viewer: {
    priority: ['라이브 스코어', '순위표', '경기 일정'],
    widgets: ['인기 경기', '하이라이트', '뉴스']
  }
}
```

### 모바일 우선 네비게이션
```typescript
// 네비게이션 패턴
Mobile (xs-sm): {
  pattern: 'Bottom Tab Navigation',
  items: ['홈', '경기', '순위', '더보기'],
  secondary: 'Drawer Navigation'
}

Tablet (md): {
  pattern: 'Side Rail Navigation',
  items: ['확장된 메뉴 with 아이콘+텍스트'],
  secondary: 'Top App Bar'
}

Desktop (lg+): {
  pattern: 'Persistent Side Navigation',
  items: ['풀 메뉴 with 서브카테고리'],
  secondary: 'Top Action Bar'
}
```

---

## 🏆 스포츠 플랫폼 특화 컴포넌트 시스템

### 스코어보드 컴포넌트 패밀리
```typescript
// 라이브 스코어 디스플레이
<LiveScoreCard
  responsive={{
    xs: 'compact',      // 스코어만 크게
    md: 'standard',     // 팀명 + 스코어 + 시간
    lg: 'detailed'      // 통계 + 이벤트 포함
  }}
  realtime={true}
  animations={{
    scoreChange: 'bounce',
    statusUpdate: 'fade'
  }}
/>

// 통계 대시보드
<StatsGrid
  breakpoints={{
    xs: { cols: 1, spacing: 2 },
    sm: { cols: 2, spacing: 3 },
    lg: { cols: 4, spacing: 4 }
  }}
  priority={['승률', '득점', '순위', '경기수']}
/>

// 경기 일정 뷰
<MatchSchedule
  viewModes={{
    xs: 'list',         // 세로 리스트
    md: 'grid',         // 그리드 뷰
    lg: 'calendar'      // 캘린더 뷰
  }}
/>
```

### 데이터 시각화 컴포넌트
```typescript
// 반응형 차트 시스템
<ResponsiveChart
  type="line | bar | pie"
  responsive={{
    xs: { height: 200, simplified: true },
    md: { height: 300, showLegend: true },
    lg: { height: 400, interactive: true }
  }}
  sportSpecific={{
    colorMapping: 'team-based',
    tooltips: 'game-context',
    animations: 'score-based'
  }}
/>
```

### 액션 컴포넌트 시스템
```typescript
// Floating Action Button (모바일 특화)
<SpeedDial
  actions={[
    { icon: 'add_match', label: '경기 추가' },
    { icon: 'live_score', label: '라이브 점수' },
    { icon: 'quick_stats', label: '빠른 통계' }
  ]}
  responsive={{
    xs: 'bottom-right',
    lg: 'hidden'  // 데스크톱에서는 툴바 사용
  }}
/>

// 빠른 액션 툴바 (데스크톱 특화)
<QuickActionToolbar
  position="top"
  actions={['새 경기', '스코어 입력', '통계 생성', '보고서']}
  responsive={{
    xs: 'hidden',
    lg: 'persistent'
  }}
/>
```

---

## 🗺️ 체계적 사이트맵 구성

### 현재 라우팅 구조 분석
```typescript
// 현재 App.tsx에서 확인된 라우팅
/auth                                    // 로그인/회원가입
/                                       // 대시보드 (홈)
/clubs                                  // 클럽 목록
/clubs/:id                             // 클럽 상세
/matches                               // 경기 목록
/matches/:id                           // 경기 상세
/matches/:id/live                      // 라이브 스코어링
/tournaments                           // 토너먼트 목록
/tournaments/:id                       // 토너먼트 상세
/templates                             // 템플릿 관리
/admin                                 // 관리자 대시보드
/competitions/:competitionId/scheduling // 경기 일정 관리
/live                                  // 라이브 경기 페이지
/leagues/:competitionId/dashboard      // 리그 대시보드
```

### 1️⃣ **인증 & 온보딩** (Public)
```
📁 Authentication & Onboarding
├── /auth
│   ├── /auth/login              // 로그인
│   ├── /auth/register           // 회원가입
│   ├── /auth/forgot-password    // 비밀번호 찾기
│   └── /auth/reset-password     // 비밀번호 재설정
├── /welcome                     // 온보딩 가이드
└── /about                       // 플랫폼 소개
```

### 2️⃣ **메인 대시보드** (Role-based)
```
🏠 Dashboard Hub
├── /                            // 통합 대시보드
├── /dashboard/admin             // 관리자 대시보드
├── /dashboard/club-manager      // 클럽 관리자 대시보드
├── /dashboard/tournament-admin  // 토너먼트 관리자 대시보드
├── /dashboard/recorder          // 기록원 대시보드
└── /dashboard/viewer            // 일반 사용자 대시보드
```

### 3️⃣ **클럽 관리** (Organizations)
```
🏛️ Club Management
├── /clubs                       // 클럽 목록
├── /clubs/create               // 클럽 생성
├── /clubs/:id                  // 클럽 상세 정보
├── /clubs/:id/edit             // 클럽 정보 수정
├── /clubs/:id/members          // 클럽 멤버 관리
├── /clubs/:id/statistics       // 클럽 통계
├── /clubs/:id/history          // 클럽 경기 이력
└── /clubs/:id/settings         // 클럽 설정
```

### 4️⃣ **대회 관리** (Competitions)
```
🏆 Competition Management
├── /competitions               // 전체 대회 목록
├── /competitions/create        // 대회 생성
│
├── 📁 Tournaments (토너먼트)
│   ├── /tournaments                    // 토너먼트 목록
│   ├── /tournaments/create            // 토너먼트 생성
│   ├── /tournaments/:id               // 토너먼트 상세
│   ├── /tournaments/:id/edit          // 토너먼트 수정
│   ├── /tournaments/:id/bracket       // 대진표
│   ├── /tournaments/:id/participants  // 참가자 관리
│   ├── /tournaments/:id/scheduling    // 일정 관리
│   ├── /tournaments/:id/results       // 결과 관리
│   └── /tournaments/:id/statistics    // 토너먼트 통계
│
└── 📁 Leagues (리그)
    ├── /leagues                       // 리그 목록
    ├── /leagues/create               // 리그 생성
    ├── /leagues/:id                  // 리그 상세
    ├── /leagues/:id/dashboard        // 리그 대시보드 ✅
    ├── /leagues/:id/standings        // 순위표
    ├── /leagues/:id/fixtures         // 경기 일정
    ├── /leagues/:id/results          // 경기 결과
    ├── /leagues/:id/statistics       // 리그 통계
    └── /leagues/:id/management       // 리그 관리
```

### 5️⃣ **경기 관리** (Matches)
```
⚽ Match Management
├── /matches                    // 전체 경기 목록 ✅
├── /matches/create            // 경기 생성
├── /matches/:id               // 경기 상세 ✅
├── /matches/:id/edit          // 경기 정보 수정
├── /matches/:id/preview       // 경기 미리보기
├── /matches/:id/live          // 라이브 스코어링 ✅
├── /matches/:id/result        // 경기 결과
├── /matches/:id/statistics    // 경기 통계
├── /matches/:id/timeline      // 경기 타임라인
└── /matches/:id/reports       // 경기 보고서
```

### 6️⃣ **라이브 & 실시간** (Live Features)
```
📺 Live & Real-time
├── /live                      // 라이브 경기 목록 ✅
├── /live/dashboard           // 라이브 대시보드
├── /live/scoreboard          // 실시간 스코어보드
├── /live/commentary          // 실시간 중계
├── /live/statistics          // 실시간 통계
└── /live/broadcasts          // 방송 관리
```

### 7️⃣ **일정 관리** (Scheduling)
```
📅 Scheduling & Calendar
├── /schedule                  // 통합 일정 보기
├── /schedule/calendar         // 캘린더 뷰
├── /schedule/conflicts        // 일정 충돌 관리
├── /competitions/:id/scheduling // 대회별 일정 관리 ✅
└── /scheduling/templates      // 일정 템플릿
```

### 8️⃣ **템플릿 & 설정** (Templates & Configuration)
```
⚙️ Templates & Configuration
├── /templates                 // 템플릿 관리 ✅
├── /templates/competitions    // 대회 템플릿
├── /templates/scheduling      // 일정 템플릿
├── /templates/scoring         // 스코어링 템플릿
├── /settings                  // 일반 설정
├── /settings/profile          // 프로필 설정
├── /settings/notifications    // 알림 설정
└── /settings/preferences      // 환경 설정
```

### 9️⃣ **통계 & 분석** (Analytics)
```
📊 Analytics & Reports
├── /analytics                 // 종합 분석
├── /analytics/performance     // 성과 분석
├── /analytics/trends          // 트렌드 분석
├── /reports                   // 보고서
├── /reports/competitions      // 대회 보고서
├── /reports/clubs            // 클럽 보고서
└── /reports/custom           // 커스텀 보고서
```

### 🔟 **시스템 관리** (Admin Only)
```
👨‍💼 System Administration
├── /admin                     // 관리자 대시보드 ✅
├── /admin/users              // 사용자 관리
├── /admin/organizations      // 조직 관리
├── /admin/permissions        // 권한 관리
├── /admin/system-config      // 시스템 설정
├── /admin/logs              // 시스템 로그
├── /admin/maintenance       // 시스템 유지보수
└── /admin/analytics         // 관리자 분석
```

---

## 🧭 네비게이션 구조 계획

### 메인 네비게이션 (역할별 맞춤)
```typescript
// 공통 네비게이션
const commonNavigation = [
  { icon: 'dashboard', label: '대시보드', path: '/' },
  { icon: 'live_tv', label: '라이브', path: '/live' },
  { icon: 'calendar_today', label: '일정', path: '/schedule' }
];

// 역할별 네비게이션
const roleBasedNavigation = {
  admin: [
    ...commonNavigation,
    { icon: 'business', label: '클럽', path: '/clubs' },
    { icon: 'emoji_events', label: '대회', path: '/competitions' },
    { icon: 'sports_soccer', label: '경기', path: '/matches' },
    { icon: 'admin_panel_settings', label: '관리', path: '/admin' }
  ],

  clubManager: [
    ...commonNavigation,
    { icon: 'business', label: '내 클럽', path: '/clubs/my' },
    { icon: 'sports_soccer', label: '경기', path: '/matches' },
    { icon: 'emoji_events', label: '대회', path: '/competitions' }
  ],

  viewer: [
    ...commonNavigation,
    { icon: 'emoji_events', label: '대회', path: '/competitions' },
    { icon: 'sports_soccer', label: '경기', path: '/matches' }
  ]
};
```

### 모바일 네비게이션 (Bottom Tab)
```typescript
const mobileNavigation = [
  { icon: 'home', label: '홈', path: '/' },
  { icon: 'live_tv', label: '라이브', path: '/live' },
  { icon: 'emoji_events', label: '대회', path: '/competitions' },
  { icon: 'person', label: '내정보', path: '/profile' }
];
```

---

## 🔄 URL 패턴 규칙

### RESTful URL 설계 원칙
```typescript
// 리소스 기반 URL 구조
/[resource]                    // 목록
/[resource]/create            // 생성 폼
/[resource]/:id               // 상세 보기
/[resource]/:id/edit          // 수정 폼
/[resource]/:id/[subresource] // 하위 리소스

// 액션 기반 URL (특별한 경우)
/[resource]/:id/[action]      // 특정 액션 (live, preview 등)
```

### SEO 친화적 URL
```typescript
// 다국어 지원 (향후)
/ko/competitions              // 한국어
/en/competitions              // 영어

// 카테고리별 분류
/competitions/tournaments     // 토너먼트
/competitions/leagues         // 리그
```

---

## 🎯 구현 로드맵

### Phase 1: 기반 시스템 (2주)
```typescript
// 1. 반응형 그리드 시스템 구축
// 2. Material 3 테마 적용
// 3. 타이포그래피 스케일 설정
// 4. 기본 컴포넌트 라이브러리 구축
```

### Phase 2: 핵심 컴포넌트 (3주)
```typescript
// 1. 스코어보드 컴포넌트 패밀리
// 2. 데이터 시각화 시스템
// 3. 네비게이션 시스템
// 4. 폼 및 인터랙션 컴포넌트
```

### Phase 3: 대시보드 레이아웃 (2주)
```typescript
// 1. 역할별 대시보드 템플릿
// 2. 위젯 시스템 구축
// 3. 개인화 설정 기능
// 4. 성능 최적화
```

---

## 🚀 기술적 고려사항

### 성능 최적화
- **Code Splitting**: 역할별 대시보드 번들 분리
- **Lazy Loading**: 차트 및 복잡한 위젯 지연 로딩
- **Virtualization**: 큰 데이터 테이블/리스트 가상화
- **Image Optimization**: 팀 로고, 선수 사진 최적화

### 접근성 (A11Y)
- **키보드 네비게이션**: 모든 기능 키보드로 접근 가능
- **스크린 리더**: 스포츠 데이터 의미론적 마크업
- **고대비 모드**: 스코어 및 중요 정보 고대비 지원
- **다국어**: 한국어/영어 RTL 지원

---

**작성일**: 2025-09-23
**버전**: 1.0
**상태**: 계획 수립 완료