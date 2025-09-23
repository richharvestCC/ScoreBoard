# ⚽ ScoreBoard - 축구 경기 기록/운영 서비스

실시간 축구 경기 기록 및 관리를 위한 현대적인 웹 플랫폼

## 🚀 프로젝트 개요

ScoreBoard는 아마추어 및 유소년 축구 경기의 실시간 기록과 관리를 위한 풀스택 웹 애플리케이션입니다. 경기 중 발생하는 모든 이벤트를 실시간으로 기록하고 공유할 수 있는 현대적인 플랫폼을 제공합니다.

### 주요 기능
- 🔐 **사용자 인증**: JWT 기반 보안 인증 시스템
- 👥 **클럽 관리**: 팀 생성, 멤버 관리, 역할 기반 권한 시스템
- 🏆 **토너먼트 관리**: 리그 및 토너먼트 생성, 참가 관리, 실시간 순위표
- ⚽ **경기 관리**: 경기 생성, 실시간 이벤트 기록, 라이브 스코어링
- 📊 **통계 및 분석**: 선수별/팀별 통계, 경기 데이터 분석
- 📱 **반응형 UI**: Material-UI 기반 모바일 친화적 인터페이스

## 🏗️ 기술 스택

### Frontend
- **React 18** with TypeScript
- **Material-UI (MUI)** - 모던 UI 컴포넌트 시스템
- **React Query (TanStack Query)** - 서버 상태 관리
- **React Router** - 클라이언트 사이드 라우팅
- **Socket.io Client** - 실시간 통신

### Backend
- **Node.js** with Express.js
- **Socket.io** - 실시간 WebSocket 통신
- **Sequelize ORM** - PostgreSQL 데이터베이스 연동
- **JWT** - JSON Web Token 인증
- **bcryptjs** - 비밀번호 암호화
- **Joi** - 입력 데이터 검증 및 유효성 검사

### Database
- **PostgreSQL** - 관계형 데이터베이스

## 📋 설치 및 실행

### 사전 요구사항
- Node.js 18+
- PostgreSQL 13+
- npm 또는 yarn

### 1. 저장소 클론
```bash
git clone https://github.com/richharvestCC/ScoreBoard.git
cd ScoreBoard
```

### 2. 백엔드 설정
```bash
cd backend
npm install

# 환경변수 설정
cp .env.example .env
# .env 파일을 편집하여 데이터베이스 정보 및 JWT 시크릿 설정

# 데이터베이스 시작
npm start
```

### 3. 프론트엔드 설정 (별도 터미널)
```bash
cd frontend
npm install
npm start
```

### 4. 접속
- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:3001

## 🛠️ 개발 진행 상황

### ✅ 완료된 기능 (2025-09-23 최신 업데이트)
#### 🔐 핵심 인프라
- [x] 사용자 인증 시스템 (JWT 기반, 자동 토큰 갱신)
- [x] 보안 강화 (XSS 보호, Rate Limiting, 입력 데이터 검증)
- [x] 구조화된 로깅 시스템 (Winston, 상관관계 ID 추적)
- [x] 데이터베이스 Migration 시스템 (Umzug 기반)

#### 👥 사용자 및 권한 관리
- [x] 역할 기반 접근 제어 (RBAC) - user, recorder, club_admin, moderator, admin
- [x] 클럽 관리 시스템 (생성, 멤버 관리, 권한 설정)
- [x] 관리자 대시보드 (사용자 관리, 시스템 모니터링)

#### 🏆 Competition 시스템 구축 (2025-09-22)
- [x] Tournament → Competition 스키마 마이그레이션
- [x] 리그/토너먼트/컵/유스 대회 타입 지원
- [x] 조별예선+결승토너먼트 혼합 형식 지원
- [x] 5개 사전 구축 템플릿 (리그, 토너먼트, 월드컵형, FA컵형, 유스)

#### 📊 데이터 인프라 완성
- [x] WK리그 2025 실제 데이터 (8팀, 112경기)
- [x] Club 타입 시스템 (pro, youth, univ, org)
- [x] 역할 기반 더미 사용자 14개 계정
- [x] 한국여자축구연맹 조직 데이터
- [x] 기본 API 엔드포인트
- [x] React 프론트엔드 기본 구조
- [x] Socket.io 실시간 통신 설정

#### 🏆 대회 및 경기 관리
- [x] **템플릿 기반 대회 생성** - 리그, 토너먼트, 컵 대회 지원
- [x] **대회 참가 관리** - 참가 신청, 승인, 팀 매칭 시스템
- [x] **경기 스케줄링** - 자동/수동 스케줄링, 충돌 감지
- [x] **실시간 라이브 스코어링** - 경기 중 실시간 점수 및 이벤트 기록
- [x] **리그 대시보드** - 순위표, 경기 일정, 통계 분석

#### 🎨 프론트엔드
- [x] React 18 + TypeScript SPA
- [x] Material-UI 컴포넌트 시스템
- [x] React Query 서버 상태 관리
- [x] Socket.io 실시간 통신

### 🎯 최근 완료된 주요 작업 (2025-09-23)
#### 보안 강화 및 통합 (PR #23, #24, #25)
- [x] **XSS 보호 시스템** - 모든 입력 데이터 검증 및 보안 미들웨어
- [x] **중복 신호 핸들러 제거** - Graceful Shutdown 중앙 집중화
- [x] **Rate Limiting** - API 요청 제한으로 DoS 공격 방지

#### 기능 통합 및 브랜치 관리
- [x] **템플릿 관리 시스템** (PR #23) - 대회 생성 템플릿 기능
- [x] **관리자 대시보드** (PR #25) - 시스템 관리 및 모니터링
- [x] **라이브 스코어링** (PR #25) - 실시간 경기 기록 시스템
- [x] **develop 브랜치 통합** - 모든 기능을 develop으로 병합 완료
- [x] **브랜치 정리** - 사용하지 않는 feature 브랜치 제거

### 🚀 향후 개발 계획
#### 🎨 UI/UX 개선 (우선순위 최고) - 2-3주 예상
**목표**: Dashboard.jsx를 CompetitionPage 수준의 Material 3 + Financial Dashboard 스타일로 변환

**Phase 1: 시각적 기반 구축 (1주차)**
- [ ] **Glassmorphism 디자인 시스템 구축**
  - backdrop-filter: blur(30px) 기반 투명 효과
  - 그라디언트 배경 및 경계선 처리
  - 멀티 레이어 시각적 깊이감 구현
- [ ] **Material 3 타이포그래피 계층**
  - 헤더: fontWeight 800, fontSize 2.5rem
  - 레이블: 0.75rem, 대문자 변환, 1px 자간
- [ ] **컬러 시스템 통합**
  - 모노크롬 베이스: rgba(255, 255, 255, 0.95)
  - 컬러풀 액센트: 그라디언트 하이라이트

**Phase 2: 컴포넌트 변환 (2주차)**
- [ ] **Navigation Cards 개선**
  - 내 클럽, 경기 일정, 통계 카드 glassmorphism 적용
  - 호버 효과: translateY(-3px) 변환
  - 아이콘 컨테이너 그라디언트 배경
- [ ] **Quick Actions 섹션 재설계**
  - Paper 컴포넌트 glassmorphism 스타일링
  - 버튼 backdrop filter 효과
- [ ] **Recent Activity 섹션 스타일링**

**Phase 3: 고급 기능 통합 (3주차)**
- [ ] **DashboardStats 컴포넌트 통합**
  - 기존 admin 컴포넌트를 일반 사용자 대시보드에 적용
  - CompetitionPage 패턴 기반 카드 스타일링
- [ ] **고급 애니메이션 시스템**
  - cubic-bezier(0.25, 0.46, 0.45, 0.94) 전환 효과
  - 12px 블러 그림자, 0.12 투명도
- [ ] **반응형 최적화**
  - 모바일 터치 인터페이스 조정
  - 디바이스별 glassmorphism 스케일링

📋 **상세 구현 가이드**: [Dashboard Design Tasks](./docs/dashboard-design-implementation.md)

#### 품질 개선 (우선순위 높음)
- [ ] **테스트 자동화** - 단위 테스트, 통합 테스트, E2E 테스트 구축
- [ ] **TypeScript 강화** - Strict 모드 적용, 타입 안전성 개선
- [ ] **API 문서화** - Swagger/OpenAPI 자동 문서 생성

#### 고급 기능 (중간 우선순위)
- [ ] **모바일 PWA** - Progressive Web App 구현
- [ ] **실시간 알림** - 웹푸시, 이메일 알림 시스템
- [ ] **고급 통계** - AI 기반 경기 분석 및 예측
- [ ] **국제화(i18n)** - 다국어 지원

#### 인프라 및 운영 (장기)
- [ ] **클라우드 배포** - AWS/GCP 기반 운영 환경
- [ ] **CI/CD 파이프라인** - 자동화된 빌드 및 배포
- [ ] **모니터링 시스템** - APM, 로그 분석, 알림

<!--
기존 내용 주석 처리 (2025-01-22)
이유: Gemini Code Assist 피드백을 반영하여 프로덕션 준비성 개선사항 추가

## 📝 기술 문서

상세한 기술 사양과 아키텍처 정보는 다음 문서들을 참조하세요:
- [설계 명세서](./plan/outputs/design_specification.md)
- [MVP 로드맵](./plan/outputs/mvp_roadmap_documented.md)
-->

## 🔧 환경 설정

### 데이터베이스 설정
PostgreSQL 데이터베이스를 생성하고 `.env` 파일의 연결 정보를 업데이트하세요:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=scoreboard
DB_USER=your_username
DB_PASSWORD=your_password
```

### JWT 설정
보안을 위해 프로덕션 환경에서는 강력한 JWT 시크릿을 설정하세요:

```env
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_refresh_token_secret
```

## 🚨 알려진 이슈 및 개선사항

### ✅ Critical Issues (해결 완료)
- [x] **Database Connection**: Circuit Breaker 패턴과 지수 백오프로 연결 복원력 개선 완료 ([PR #11](https://github.com/richharvestCC/ScoreBoard/pull/11))
- [x] **Sequelize Sync**: Umzug 기반 migration 시스템 도입 완료 ([PR #12](https://github.com/richharvestCC/ScoreBoard/pull/12))

### ✅ Important Issues (해결 완료)
- [x] **Navigation**: React Router `useNavigate` 훅과 Context 패턴으로 현대화 완료 ([PR #13](https://github.com/richharvestCC/ScoreBoard/pull/13))
- [x] **Logging**: Winston 기반 구조화된 로깅 시스템 구축 완료 ([PR #14](https://github.com/richharvestCC/ScoreBoard/pull/14))

### 🔄 Enhancement Issues (진행 중/계획됨)
- [ ] **Testing**: React Testing Library 설정 및 테스트 커버리지 확장
- [ ] **TypeScript**: Strict 모드 활성화 및 타입 안전성 강화
- [ ] **Error Boundaries**: React Error Boundary와 API 에러 핸들링 개선
- [ ] **Performance**: 번들 최적화 및 코드 스플리팅 도입
- [ ] **Security**: JWT 토큰 갱신 로직 및 보안 헤더 강화
- [ ] **Monitoring**: APM 도구 연동 및 성능 모니터링 시스템 구축

### 📋 향후 개선 계획 (2025-01-22 추가)

#### 🎯 단기 개선사항 (1-2주)
- [ ] **🏆 토너먼트 브라켓 시스템**: 조별예선 + 본선토너먼트 통합 시스템 구현 ([구현 가이드](./docs/tournament-bracket-implementation.md))
  - 조별예선 UI 컴포넌트 (Group Stage View)
  - SVG 기반 토너먼트 브라켓 시각화
  - 실시간 브라켓 업데이트 시스템
- [ ] **Competition API 구현**: 새로운 Competition 스키마 기반 REST API 엔드포인트 개발
- [ ] **템플릿 관리 UI**: 5개 대회 템플릿 선택/수정/생성 프론트엔드 인터페이스
- [ ] **프론트엔드 로깅**: 클라이언트 사이드 에러 추적 및 사용자 행동 분석 시스템 구축

##### 🚀 고우선순위 (2-4주)
- [ ] **실시간 라이브 스코어링**: Socket.io 기반 실시간 경기 기록 및 브로드캐스팅
- [ ] **WK리그 대시보드**: 실제 데이터 기반 리그 순위표, 경기 결과, 통계 표시
- [ ] **Competition 참가 시스템**: 팀 등록, 승인, 대진표 생성 워크플로우
- [ ] **모바일 최적화**: 터치 친화적 라이브 스코어링 인터페이스

##### ⚖️ 보통 우선순위 (1-2개월)
- [ ] **API 문서화**: Swagger/OpenAPI 스펙 작성 및 자동 문서 생성 시스템 도입
- [ ] **프론트엔드 로깅**: 클라이언트 사이드 에러 추적 및 사용자 행동 분석 시스템 구축
- [ ] **환경 변수 관리**: 개발/스테이징/프로덕션 환경별 설정 분리 및 검증 로직 추가

#### 🏗️ 중기 개선사항 (1-2개월)
- [ ] **실시간 기능 강화**: Socket.io 기반 라이브 스코어링 시스템 구현
- [ ] **데이터 분석**: 경기 통계 대시보드 및 성과 분석 툴 개발
- [ ] **알림 시스템**: 실시간 알림 및 이메일/SMS 통지 기능 구축
- [ ] **모바일 최적화**: PWA 지원 및 모바일 친화적 인터페이스 개선
- [ ] **국제화(i18n)**: 다국어 지원 시스템 구축

#### 🚀 장기 로드맵 (3-6개월)
- [ ] **마이크로서비스 아키텍처**: 서비스 분리 및 독립 배포 환경 구축
- [ ] **AI/ML 기능**: 경기 예측 및 선수 성과 분석 시스템 도입
- [ ] **모바일 앱**: React Native 기반 네이티브 앱 개발
- [ ] **클라우드 인프라**: AWS/GCP 기반 확장 가능한 인프라 구축
- [ ] **데이터 웨어하우스**: 빅데이터 분석을 위한 데이터 파이프라인 구축

#### 🔧 기술 부채 해결
- [ ] **코드 리팩토링**: 레거시 코드 정리 및 최신 패턴 적용
- [ ] **성능 최적화**: 데이터베이스 쿼리 최적화 및 캐싱 전략 수립
- [ ] **보안 강화**: 정기적인 보안 감사 및 취약점 점검 체계 구축
- [ ] **문서화 개선**: 코드 주석, 아키텍처 문서, 운영 가이드 정비

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 있습니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📊 프로젝트 현황 (2025-09-23 기준)

### 개발 통계
- **총 PR**: 25개 완료 (develop 브랜치 통합)
- **주요 기능 모듈**: 7개 (인증, 클럽, 대회, 경기, 스케줄링, 라이브, 관리자)
- **보안 강화**: XSS 보호, Rate Limiting, 입력 검증 완료
- **실시간 기능**: Socket.io 기반 라이브 스코어링

### 기술 성숙도
- 🟢 **백엔드**: 프로덕션 준비 (보안, 로깅, DB 마이그레이션)
- 🟡 **프론트엔드**: 기능 완성 (테스트 커버리지 필요)
- 🔴 **인프라**: 개발 환경만 구축 (운영 환경 구축 필요)
- 🟡 **문서화**: 기술 문서 존재 (API 문서 자동화 필요)

## 📚 문서 가이드

### 🎯 개발자용 빠른 시작
1. **[시스템 아키텍처](./docs/ARCHITECTURE.md)** - 전체 시스템 설계 및 기술 스택
2. **[API 문서](./docs/API.md)** - REST API 엔드포인트 및 사용법
3. **[개발 계정](./backend/docs/dummy-users.md)** - 테스트용 사용자 계정 정보
4. **[로깅 시스템](./backend/LOGGING.md)** - 구조화된 로깅 사용법

### 🏗️ 구현 가이드
- **[Dashboard 디자인 구현](./docs/dashboard-design-implementation.md)** - Material 3 + Financial Dashboard 스타일 완전 구현 가이드
- **[토너먼트 브라켓 시스템](./docs/tournament-bracket-implementation.md)** - 조별예선 + 본선토너먼트 구현 가이드
- **[데이터베이스 마이그레이션](./docs/database-migrations.md)** - 스키마 변경 및 관리 가이드

### 📊 프로젝트 관리
- **[기술 부채 분석](./docs/technical-debt-analysis.md)** - 현재 기술 부채 상태 및 해결 계획
- **[문서 관리 가이드](./docs/documentation-management-guide.md)** - 문서 작성 및 유지 관리 표준

### 개발 환경
- **Backend API**: http://localhost:3001/api/v1
- **Frontend**: http://localhost:3000
- **Socket.io**: http://localhost:3001 (실시간 통신)

## 📞 연락처

프로젝트 링크: [https://github.com/richharvestCC/ScoreBoard](https://github.com/richharvestCC/ScoreBoard)

---

⚽ **Made with passion for football** | 최종 업데이트: 2025-09-23 ⚽