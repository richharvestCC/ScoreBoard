# ScoreBoard 사용자 프로필 기능 설계

## 개요

ScoreBoard 축구 관리 시스템에 종합적인 사용자 프로필 기능을 추가하는 설계 문서입니다. 현재 시스템의 User 모델과 관계를 활용하여 4단계로 나누어 점진적으로 구현합니다.

## 현재 시스템 분석

### 기술 스택
- **Frontend**: React + Material-UI + React Router
- **Backend**: Node.js + Express + Sequelize ORM
- **Database**: PostgreSQL/MySQL (Sequelize 지원)

### 현재 User 모델
```javascript
User {
  id: INTEGER (PK)
  user_id: STRING (UNIQUE)
  email: STRING (UNIQUE)
  password_hash: STRING
  name: STRING
  birthdate: DATEONLY
  gender: ENUM('male', 'female', 'other')
  phone_number: STRING
  profile_image_url: STRING
  // Associations
  clubs: belongsToMany(Club) // 가입한 클럽
  createdClubs: hasMany(Club) // 생성한 클럽
  playerEvents: hasMany(MatchEvent) // 선수 이벤트
  recordedEvents: hasMany(MatchEvent) // 기록한 이벤트
}
```

### 현재 상황
- Header.jsx에 "프로필" 메뉴 존재하지만 실제 구현 없음
- User 인증 시스템은 구현됨 (useAuth hook)
- 기본적인 사용자 관계 데이터는 모델링됨

## 4단계 구현 계획

## 1단계: 기본 프로필 기능 (우선순위: 높음)

### 기능 범위
- 개인정보 조회 및 수정
- 프로필 이미지 업로드 및 관리
- 비밀번호 변경
- 기본 프로필 표시

### 컴포넌트 구조
```
frontend/src/
├── pages/
│   └── Profile/
│       ├── ProfilePage.jsx        # 메인 프로필 페이지
│       └── index.js               # export
├── components/
│   └── profile/
│       ├── PersonalInfo/
│       │   ├── PersonalInfoForm.jsx       # 개인정보 편집 폼
│       │   ├── ProfileImageUpload.jsx     # 이미지 업로드
│       │   └── PasswordChangeForm.jsx     # 비밀번호 변경
│       └── common/
│           ├── ProfileLayout.jsx          # 공통 레이아웃
│           └── ProfileTabs.jsx           # 탭 네비게이션
├── hooks/
│   ├── useProfile.js              # 프로필 데이터 관리
│   └── useProfileImage.js         # 이미지 업로드 관리
└── services/
    └── profileAPI.js              # API 호출 함수들
```

### API 설계
```javascript
// GET /api/users/profile - 프로필 조회
// PUT /api/users/profile - 프로필 수정
// POST /api/users/profile/image - 이미지 업로드
// PUT /api/users/password - 비밀번호 변경
```

### 백엔드 구조
```
backend/src/
├── routes/
│   └── profile.js                 # 프로필 라우트
├── controllers/
│   └── profileController.js       # 프로필 컨트롤러
├── services/
│   ├── profileService.js          # 비즈니스 로직
│   └── imageUploadService.js      # 이미지 처리
└── middleware/
    └── upload.js                  # 파일 업로드 미들웨어
```

### 주요 기능
1. **개인정보 관리**
   - 이름, 생년월일, 성별, 전화번호 수정
   - 실시간 유효성 검사
   - 변경사항 자동 저장

2. **프로필 이미지**
   - 이미지 업로드 (jpg, png, 최대 5MB)
   - 이미지 크롭 기능
   - 기본 아바타 제공

3. **보안**
   - 현재 비밀번호 확인
   - 새 비밀번호 강도 검사
   - 비밀번호 변경 확인 이메일

### 구현 일정: 2주
- Week 1: 기본 UI + API + 개인정보 수정
- Week 2: 이미지 업로드 + 비밀번호 변경 + 테스트

## 2단계: 활동 프로필 기능 (우선순위: 중간)

### 기능 범위
- 가입한 클럽 목록 및 역할 표시
- 생성한 클럽 관리
- 경기 참여 내역
- 활동 타임라인

### 추가 컴포넌트
```
components/profile/
├── Activity/
│   ├── MyClubsList.jsx            # 가입 클럽 목록
│   ├── CreatedClubsList.jsx       # 생성 클럽 목록
│   ├── MatchHistoryList.jsx       # 경기 참여 내역
│   └── ActivityTimeline.jsx       # 활동 타임라인
└── common/
    └── ActivityCard.jsx           # 활동 카드 공통 컴포넌트
```

### API 확장
```javascript
// GET /api/users/profile/clubs - 가입 클럽 목록
// GET /api/users/profile/created-clubs - 생성 클럽 목록
// GET /api/users/profile/matches - 경기 참여 내역
// GET /api/users/profile/activity-timeline - 활동 타임라인
// PUT /api/users/profile/clubs/:id/leave - 클럽 탈퇴
```

### 주요 기능
1. **클럽 활동**
   - 가입 클럽: 역할, 가입일, 활동 상태
   - 생성 클럽: 관리 기능, 멤버 수, 최근 활동
   - 클럽 탈퇴 기능

2. **경기 내역**
   - 참여한 경기 목록 (페이지네이션)
   - 경기별 개인 성과 (골, 어시스트, 카드)
   - 경기 결과 및 날짜

3. **활동 타임라인**
   - 최근 30일 활동 요약
   - 클럽 가입, 경기 참여, 기록 등록 이벤트
   - 무한 스크롤

### 구현 일정: 2주
- Week 1: 클럽 관련 기능 + API
- Week 2: 경기 내역 + 활동 타임라인 + 최적화

## 3단계: 통계 프로필 기능 (우선순위: 중간)

### 기능 범위
- 개인 성과 통계 대시보드
- 시간별/클럽별 성과 그래프
- 성과 트렌드 분석
- 포지션별 분석

### 추가 컴포넌트
```
components/profile/
├── Statistics/
│   ├── PersonalStatsOverview.jsx  # 통계 개요
│   ├── PerformanceChart.jsx       # 성과 차트
│   ├── TrendAnalysis.jsx          # 트렌드 분석
│   ├── PositionAnalysis.jsx       # 포지션 분석
│   └── ComparisonChart.jsx        # 비교 차트
└── charts/
    ├── LineChart.jsx              # 라인 차트
    ├── BarChart.jsx               # 바 차트
    └── PieChart.jsx               # 파이 차트
```

### API 확장
```javascript
// GET /api/users/profile/statistics - 전체 통계
// GET /api/users/profile/statistics/performance - 성과 통계
// GET /api/users/profile/statistics/trends - 트렌드 데이터
// GET /api/users/profile/statistics/comparison - 비교 데이터
```

### 주요 기능
1. **개인 통계**
   - 총 경기 수, 골, 어시스트, 카드
   - 승률, 평균 평점
   - 월별/시즌별 성과

2. **시각화**
   - Chart.js 또는 Recharts 활용
   - 반응형 차트 컴포넌트
   - 인터랙티브 필터링

3. **분석**
   - 성과 트렌드 (상승/하강)
   - 클럽별 성과 비교
   - 포지션별 특화 통계

### 구현 일정: 3주
- Week 1: 통계 계산 로직 + 기본 차트
- Week 2: 고급 분석 + 트렌드 계산
- Week 3: UI/UX 개선 + 성능 최적화

## 4단계: 고급 프로필 기능 (우선순위: 낮음)

### 기능 범위
- 개인 달력 (경기/훈련 일정)
- 알림 설정 및 관리
- 축구 경력 관리
- 목표 설정 및 추적

### 추가 컴포넌트
```
components/profile/
├── Advanced/
│   ├── ProfileCalendar.jsx        # 개인 달력
│   ├── NotificationSettings.jsx   # 알림 설정
│   ├── CareerManagement.jsx       # 경력 관리
│   ├── GoalTracking.jsx          # 목표 추적
│   └── AchievementsBadges.jsx     # 성취 배지
└── calendar/
    ├── CalendarView.jsx           # 달력 뷰
    ├── EventModal.jsx             # 이벤트 모달
    └── EventCard.jsx              # 이벤트 카드
```

### 데이터베이스 확장
```javascript
// 새로운 모델들
UserNotification {
  id: INTEGER (PK)
  user_id: INTEGER (FK)
  type: ENUM('match', 'club', 'achievement')
  enabled: BOOLEAN
  settings: JSON
}

UserCareer {
  id: INTEGER (PK)
  user_id: INTEGER (FK)
  club_name: STRING
  position: STRING
  start_date: DATE
  end_date: DATE
  achievements: TEXT
}

UserGoal {
  id: INTEGER (PK)
  user_id: INTEGER (FK)
  title: STRING
  target_value: INTEGER
  current_value: INTEGER
  deadline: DATE
  status: ENUM('active', 'completed', 'expired')
}
```

### 주요 기능
1. **달력 통합**
   - 경기 일정 표시
   - 클럽 이벤트 연동
   - Google Calendar 동기화 (선택)

2. **알림 시스템**
   - 경기 전 알림
   - 클럽 소식 알림
   - 성취 달성 알림
   - 이메일/앱 푸시 설정

3. **경력 관리**
   - 축구 경력 타임라인
   - 클럽별 성과 기록
   - 수상 내역 관리

### 구현 일정: 3주
- Week 1: 달력 기능 + 데이터 모델
- Week 2: 알림 시스템 구축
- Week 3: 경력/목표 관리 + 통합 테스트

## 기술적 고려사항

### 성능 최적화
- **이미지 최적화**: WebP 변환, 다중 해상도 지원
- **데이터 캐싱**: Redis 활용 통계 데이터 캐시
- **지연 로딩**: 탭별 컴포넌트 lazy loading
- **페이지네이션**: 대량 데이터 목록 최적화

### 보안 고려사항
- **파일 업로드**: 파일 타입 검증, 바이러스 스캔
- **API 보안**: 인증 미들웨어, 권한 검사
- **데이터 검증**: 입력 데이터 sanitization
- **개인정보**: 민감 정보 암호화

### 접근성 (A11y)
- **키보드 네비게이션**: 모든 기능 키보드 접근 가능
- **스크린 리더**: ARIA 레이블, 의미적 HTML
- **색상 대비**: WCAG 2.1 AA 준수
- **반응형 디자인**: 모바일 최적화

## 라우팅 설계

```javascript
// React Router 설정
/profile                    # 프로필 메인 (기본 정보)
/profile/personal          # 개인정보 수정
/profile/activity          # 활동 내역
/profile/statistics        # 통계 대시보드
/profile/calendar          # 개인 달력
/profile/settings          # 설정 (알림, 보안)
/profile/career            # 경력 관리
```

## API 엔드포인트 전체 목록

### 1단계 - 기본 기능
```
GET    /api/users/profile              # 프로필 조회
PUT    /api/users/profile              # 프로필 수정
POST   /api/users/profile/image        # 이미지 업로드
DELETE /api/users/profile/image        # 이미지 삭제
PUT    /api/users/password             # 비밀번호 변경
```

### 2단계 - 활동 기능
```
GET    /api/users/profile/clubs                    # 가입 클럽
GET    /api/users/profile/created-clubs           # 생성 클럽
GET    /api/users/profile/matches                 # 경기 내역
GET    /api/users/profile/activity-timeline       # 활동 타임라인
PUT    /api/users/profile/clubs/:id/leave         # 클럽 탈퇴
```

### 3단계 - 통계 기능
```
GET    /api/users/profile/statistics              # 전체 통계
GET    /api/users/profile/statistics/performance  # 성과 통계
GET    /api/users/profile/statistics/trends       # 트렌드
GET    /api/users/profile/statistics/comparison   # 비교 데이터
```

### 4단계 - 고급 기능
```
GET    /api/users/profile/calendar                # 달력 데이터
POST   /api/users/profile/goals                   # 목표 생성
PUT    /api/users/profile/goals/:id               # 목표 수정
GET    /api/users/profile/notifications           # 알림 설정
PUT    /api/users/profile/notifications           # 알림 설정 수정
GET    /api/users/profile/career                  # 경력 조회
POST   /api/users/profile/career                  # 경력 추가
```

## 테스트 전략

### 단위 테스트
- API 엔드포인트별 테스트
- 컴포넌트 렌더링 테스트
- 유틸리티 함수 테스트
- 목표: 80% 이상 커버리지

### 통합 테스트
- 프로필 수정 워크플로우
- 이미지 업로드 프로세스
- 통계 계산 정확성
- API-Frontend 연동

### E2E 테스트
- 전체 사용자 여정
- 브라우저 호환성
- 반응형 디자인
- 접근성 테스트

## 배포 및 모니터링

### 배포 전략
- **단계적 배포**: Feature Flag 활용
- **A/B 테스트**: UI/UX 최적화
- **롤백 계획**: 이전 버전 복구

### 모니터링
- **사용자 행동**: Google Analytics 연동
- **성능 모니터링**: API 응답 시간
- **오류 추적**: Sentry 또는 유사 도구

## 총 구현 일정: 10주

### Phase 1 (Week 1-2): 기본 프로필
- **Week 1**: 컴포넌트 구조 + API + 개인정보 수정
- **Week 2**: 이미지 업로드 + 비밀번호 변경 + 테스트

### Phase 2 (Week 3-4): 활동 내역
- **Week 3**: 클럽 관련 기능 + API 개발
- **Week 4**: 경기 내역 + 활동 타임라인 + 최적화

### Phase 3 (Week 5-7): 통계 기능
- **Week 5**: 통계 계산 로직 + 기본 차트 구현
- **Week 6**: 고급 분석 + 트렌드 계산 로직
- **Week 7**: UI/UX 개선 + 성능 최적화

### Phase 4 (Week 8-10): 고급 기능 (선택적)
- **Week 8**: 달력 기능 + 새 데이터 모델
- **Week 9**: 알림 시스템 구축
- **Week 10**: 경력/목표 관리 + 전체 통합 테스트

## 리스크 관리

### 높은 리스크
- **이미지 업로드**: 파일 크기, 보안, 저장소 비용
  - 대응: CDN 활용, 압축 최적화, 용량 제한
- **통계 성능**: 데이터량 증가시 쿼리 성능
  - 대응: 인덱싱, 캐싱, 배치 처리

### 중간 리스크
- **UI 복잡성**: Material-UI 일관성, 반응형 디자인
  - 대응: 디자인 시스템 구축, 스타일가이드
- **API 부하**: 동시 접속자 증가
  - 대응: 로드 밸런싱, API 캐싱

### 낮은 리스크
- **브라우저 호환성**: 최신 React/Material-UI 사용
  - 대응: Babel 폴리필, 크로스 브라우저 테스트

## 성공 지표

### 기능적 지표
- 프로필 완성도: 90% 이상 필드 입력
- 이미지 업로드율: 70% 이상 사용자
- 통계 페이지 체류시간: 평균 2분 이상

### 기술적 지표
- API 응답시간: 평균 200ms 이하
- 페이지 로딩속도: 1초 이내
- 에러율: 0.1% 이하

### 사용자 경험
- 만족도 설문: 4.0/5.0 이상
- 기능 사용률: 주요 기능 80% 이상
- 이탈률: 프로필 페이지 20% 이하

## 결론

이 설계는 ScoreBoard 시스템에 체계적이고 확장 가능한 사용자 프로필 기능을 제공합니다. 4단계 구현을 통해 MVP부터 고급 기능까지 점진적으로 개발하여 사용자 경험을 극대화하고 개발 리스크를 최소화할 수 있습니다.

각 단계는 독립적으로 가치를 제공하므로, 리소스나 시간 제약이 있을 경우 1-2단계만으로도 충분한 사용자 가치를 창출할 수 있습니다.