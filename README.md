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

### ✅ 완료된 기능
- [x] 기본 프로젝트 구조 설정
- [x] 사용자 인증 시스템 (회원가입, 로그인)
- [x] JWT 토큰 기반 보안 미들웨어
- [x] 데이터베이스 모델 설계 (User, Club, Match, MatchEvent)
- [x] 기본 API 엔드포인트
- [x] React 프론트엔드 기본 구조
- [x] Socket.io 실시간 통신 설정

### 🔄 진행 중 (2025-01-22 업데이트)
- [x] **코드 품질 개선 및 최적화**
  - [x] 데이터베이스 연결 복원력 개선 (Circuit Breaker, 지수 백오프)
  - [x] React Navigation 최적화 (useCallback, useMemo, React Router 통합)
  - [x] 구조화된 로깅 시스템 구축 (Winston, 상관관계 ID, AsyncLocalStorage)
  - [x] Sequelize Migration 시스템 도입 (Umzug, 건강 모니터링, CLI 도구)
  - [ ] 테스트 커버리지 확장
- [x] **PR 리뷰 피드백 처리 완료**
  - [x] PR #11: Database Connection 복원력 ([#11](https://github.com/richharvestCC/ScoreBoard/pull/11))
  - [x] PR #12: Sequelize Migration 시스템 ([#12](https://github.com/richharvestCC/ScoreBoard/pull/12))
  - [x] PR #13: Navigation 시스템 개선 ([#13](https://github.com/richharvestCC/ScoreBoard/pull/13))
  - [x] PR #14: 구조화된 로깅 시스템 ([#14](https://github.com/richharvestCC/ScoreBoard/pull/14))

### 📋 계획된 기능
- [ ] 라이브 스코어링 시스템
- [ ] 경기 이벤트 실시간 브로드캐스팅
- [ ] 사용자 프로필 및 설정
- [ ] 고급 경기 통계 및 분석
- [ ] 순위표 및 리그 시스템
- [ ] 모바일 앱 (React Native)

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

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 있습니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 연락처

프로젝트 링크: [https://github.com/richharvestCC/ScoreBoard](https://github.com/richharvestCC/ScoreBoard)

---

⚽ **Made with passion for football** ⚽