<!--
문서 상태: DEPRECATED (2025-01-22)
이유: 내용이 다음 개별 문서들로 분리되어 더 상세하게 관리됨

최신 정보는 아래 문서들을 참조하세요:
- 설계 명세서: design_specification.md
- MVP 로드맵: mvp_roadmap_documented.md
- 프로젝트 현황: ../README.md

이 문서는 역사적 참조용으로 보존되지만 더 이상 업데이트되지 않습니다.
-->

# 축구 경기 기록/운영 서비스: 설계 명세서 및 MVP 로드맵

**⚠️ 이 문서는 더 이상 업데이트되지 않습니다.**
**최신 정보는 다음 문서들을 참조하세요:**
- **[설계 명세서](./design_specification.md)** - 시스템 아키텍처 및 기능 설계
- **[MVP 로드맵](./mvp_roadmap_documented.md)** - 개발 계획 및 현재 진행상황
- **[프로젝트 README](../README.md)** - 전체 프로젝트 개요 및 설치 가이드

## 1. 설계 명세서 (Design Specification)

### 1.1. 요구사항 분석 (Requirements Analysis)

#### 1.1.1. 프로젝트 목표 및 핵심 가치
- **Why:** 분산된 아마추어/유소년 축구 경기 정보를 중앙화하고, 실시간 데이터 입력을 통해 경기 운영의 효율성과 선수/팬 경험의 질을 높인다. Strava가 개인 운동 기록의 기준이 된 것처럼, 본 서비스는 팀 스포츠(축구) 기록의 표준 플랫폼을 지향한다.
- **For Whom:** 선수, 코칭스태프, 클럽 운영진, 대회 주최자, 학부모 및 팬
- **Success Criteria (MVP):**
    - 5주 내 핵심 기능(사용자, 클럽, 친선경기 실시간 기록)을 포함한 MVP 런칭
    - 내부 데모(3주차)에서 2명의 사용자가 실시간으로 경기 이벤트를 공유하는 시나리오 성공
    - 런칭 후 1개월 내 10개 이상의 클럽이 생성되고 5개 이상의 경기가 기록됨

#### 1.1.2. 사용자 페르소나 및 주요 시나리오
- **경기 기록원 (대학생 A군):** 클럽 매니저의 요청으로 경기장에서 모바일로 실시간 이벤트를 입력한다. 직관적인 UI를 통해 득점, 경고, 선수 교체 등을 빠르게 입력해야 한다.
- **클럽 관리자 (직장인 B씨):** 자신의 팀 페이지에서 멤버를 관리하고, 주말 친선경기 일정을 생성한다. 경기 후에는 팀과 선수들의 누적 스탯을 확인하여 다음 경기를 준비한다.
- **선수 (고등학생 C양):** 자신의 프로필 페이지에서 출전 기록, 공격포인트 등 개인 통계를 확인하고 친구들에게 공유한다.
- **대회 관리자 (협회 직원 D씨):** 주최하는 유소년 리그의 대진표를 생성하고, 각 경기의 기록원을 배정한다. 경기 종료 후 기록을 승인하여 공식 순위를 업데이트한다.

### 1.2. 시스템 아키텍처 (System Architecture)

#### 1.2.1. 전체 시스템 구성도 (MVP)
- **Client (React SPA):** Vercel/Netlify 배포
- **API Server (Node.js/Express):** Heroku/AWS EC2/ECS 배포
- **WebSocket Server (Node.js/Socket.io):** API 서버와 함께 실행 또는 별도 분리
- **Database (PostgreSQL):** AWS RDS 등 관리형 서비스 사용
- **CDN (e.g., Cloudflare):** 정적 에셋 캐싱

#### 1.2.2. 확장성 계획 (10x Growth Scenario)
- **API 서버 수평 확장:** Load Balancer를 통한 요청 분산
- **데이터베이스 부하 분산:** Read Replica 도입
- **WebSocket 확장:** `socket.io-redis-adapter` 사용
- **비동기 처리:** 메시지 큐(RabbitMQ/SQS) 도입 고려
- **마이크로서비스 전환:** 향후 도메인 단위 서비스 분리 고려

### 1.3. API 및 데이터 모델 설계 (Backend Architecture)

#### 1.3.1. RESTful API 엔드포인트 (주요)
- **Base URL:** `/api/v1`
- **Auth:** `POST /auth/register`, `POST /auth/login`
- **Users:** `GET /users/me`, `GET /users/:userId`
- **Clubs:** `POST /clubs`, `GET /clubs/:clubId`
- **Matches:** `POST /matches`, `GET /matches/:matchId`, `POST /matches/:matchId/events`

#### 1.3.2. 데이터베이스 스키마 (ERD)
- **`users`**, **`roles`**, **`clubs`**, **`matches`**, **`match_events`**, **`competitions`** 등 핵심 테이블 정의

#### 1.3.3. 인증 및 권한 부여
- **인증:** JWT(JSON Web Token) 사용
- **권한 부여:** RBAC(Role-Based Access Control) 미들웨어 구현

### 1.4. UI/UX 아키텍처 (Frontend Architecture)

#### 1.4.1. 컴포넌트 구조
- **UI Library:** Material-UI 또는 Ant Design
- **Server State:** React-Query (TanStack Query)
- **Client State:** Zustand 또는 Recoil
- **디렉토리 구조:** Feature-based 구조

#### 1.4.2. 핵심 페이지 설계
- **경기 상세 페이지 (Live):** 실시간 스코어보드, 이벤트 피드
- **클럽 대시보드:** 멤버, 경기 일정, 결과 관리
- **선수 프로필:** 개인 통계 시각화

---

## 2. MVP 개발 추정 및 로드맵

### 2.1. 프로젝트 개요
- **목표:** 5주 내 MVP 런칭 (1인 개발자), 3주차 내부 데모
- **핵심 성공 기준:** 사용자 가입, 클럽 생성, 실시간 경기 기록 및 조회, 기본 스탯 반영
- **범위 제외:** 대회 운영, 세분화된 권한, 상세 통계 등

### 2.2. 개발 추정치
| 카테고리 | Story Points | 예상 기간 (일) |
| :--- | :--- | :--- |
| 환경 설정 | 11 | 5.5 |
| 사용자 관리 | 7 | 3.5 |
| 클럽 관리 | 5 | 2.5 |
| 경기 관리 | 7 | 3.5 |
| 실시간 기능 | 11 | 5.5 |
| UI/UX | 10 | 5 |
| 통계 | 5 | 2.5 |
| **총계** | **56** | **28일** |

- **분석:** 5주(25일) 내 완료는 도전적인 일정. 실시간 기능 구현에 가장 큰 리소스가 필요.

### 2.3. 잠재적 리스크 및 완화 전략
1.  **리스크 (High):** 실시간 동기화 로직의 복잡성
    - **완화:** 서버 중심의 순차적 이벤트 처리, 고유 ID/타임스탬프 부여
2.  **리스크 (Medium):** 범위蔓延 (Scope Creep)
    - **완화:** 로드맵 기준 주간 목표 설정, 추가 아이디어는 Post-MVP 백로그로 관리
3.  **리스크 (Low):** 인프라 설정 시간 소요
    - **완화:** PaaS/SaaS (Vercel, Heroku, AWS RDS) 적극 활용

### 2.4. MVP 개발 로드맵 (5-Week Plan)

#### **Week 1: 기반 구축 및 인증**
- **목표:** 개발 환경 완성, 사용자 가입/로그인 구현

#### **Week 2: 클럽 및 경기 생성**
- **목표:** 클럽 생성 및 관리, 친선 경기 생성 기능 구현

#### **Week 3: 실시간 기록 구현 (내부 데모)**
- **목표:** 실시간 경기 이벤트 입력 및 조회 기능 시연

#### **Week 4: 기능 완성 및 통계**
- **목표:** 데모 피드백 반영, 기본 통계 기능 구현

#### **Week 5: 테스트 및 배포**
- **목표:** 안정화된 MVP 버전 프로덕션 배포
