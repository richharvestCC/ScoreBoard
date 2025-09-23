# 기술 문서: 축구 경기 기록/운영 서비스 설계 명세서

## 1. 시작하며

### 1.1. 이 문서의 목적

이 문서는 '축구 경기 기록/운영 서비스'의 MVP(Minimum Viable Product) 개발을 위한 기술적 설계와 아키텍처, 그리고 구현 계획을 정의합니다. 개발자가 프로젝트의 목표, 구조, 기술적 요구사항을 명확히 이해하고 일관된 방향으로 제품을 구현하는 것을 돕는 것을 목표로 합니다.

### 1.2. 프로젝트 목표 (The "Why")

현재 파편화되어 있는 아마추어 및 유소년 축구 경기의 기록과 데이터를 중앙에서 실시간으로 관리하는 표준 플랫폼을 구축하고자 합니다. 이를 통해 선수, 팀 관계자, 팬들에게 더 풍부한 경기 경험과 데이터 기반의 인사이트를 제공하는 '축구계의 Strava'가 되는 것을 장기적인 비전으로 삼습니다.

### 1.3. 주요 대상 독자

- **소프트웨어 개발자:** 이 문서를 바탕으로 실제 시스템을 구현합니다.
- **프로젝트 관리자:** 개발 범위와 일정을 파악하고 진척 상황을 관리합니다.
- **미래의 팀원:** 프로젝트의 기술적 배경과 구조를 빠르게 학습합니다.

---

## 2. 시스템 아키텍처 (The "Big Picture")

### 2.1. 개요

본 시스템은 사용자가 웹을 통해 접속하는 **단일 페이지 애플리케이션(SPA)**, 비즈니스 로직을 처리하는 **API 서버**, 그리고 실시간 통신을 위한 **WebSocket 서버**로 구성된 현대적인 웹 아키텍처를 따릅니다. 데이터는 중앙 **관계형 데이터베이스**에 저장됩니다.

### 2.2. 시스템 구성도 (MVP)

| 컴포넌트             | 기술 스택           | 역할 및 배포 전략                                                                                                                                      |
| :------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Client**           | React (SPA)         | 사용자와의 모든 상호작용을 담당하는 UI 계층입니다. Vercel, Netlify 등 정적 호스팅 플랫폼을 통해 배포하여 빠른 로딩 속도를 보장합니다.                  |
| **API Server**       | Node.js / Express   | 핵심 비즈니스 로직, 데이터 처리, 인증을 담당하는 백엔드 서버입니다. Heroku, AWS EC2 등 클라우드 플랫폼에 배포합니다.                                   |
| **WebSocket Server** | Node.js / Socket.io | 경기 중 발생하는 이벤트를 클라이언트에 실시간으로 전달합니다. 초기에는 API 서버와 동일한 인스턴스에서 실행하며, 트래픽 증가 시 별도 서버로 분리합니다. |
| **Database**         | PostgreSQL          | 모든 영구 데이터를 저장하는 신뢰성 있는 데이터 저장소입니다. AWS RDS와 같은 관리형 데이터베이스 서비스를 사용하여 운영 부담을 최소화합니다.            |
| **CDN**              | Cloudflare 등       | 전 세계 사용자에게 이미지, JS, CSS 파일 등 정적 콘텐츠를 빠르게 전송하기 위해 사용합니다.                                                              |

### 2.3. 확장성 고려사항 (Designing for 10x Growth)

MVP 단계부터 미래의 성장을 염두에 두고 설계합니다.

- **Stateless API 서버:** 서버가 상태를 갖지 않도록 설계하여, 필요시 간단히 인스턴스 수를 늘리는 것만으로도 수평 확장이 가능하도록 합니다.
- **데이터베이스 읽기/쓰기 분리:** 향후 트래픽이 증가하면, 데이터 조회(Read) 요청을 처리하는 'Read Replica' 데이터베이스를 추가하여 부하를 분산할 수 있습니다.
- **비동기 작업 분리:** 통계 집계, 알림 발송 등 즉각적인 응답이 필요 없는 작업은 메시지 큐(Message Queue)를 도입하여 별도의 워커 프로세스에서 처리하도록 개선할 수 있습니다.

---

## 3. 기능별 상세 설계 (Feature Breakdown)

### 3.1. 사용자 및 인증 (User & Auth)

- **요구사항:** 사용자는 가입, 로그인, 프로필 조회가 가능해야 합니다. 인증은 JWT(JSON Web Token)를 사용합니다.
- **API Endpoints:**
  - `POST /api/v1/auth/register`: 신규 사용자 등록
  - `POST /api/v1/auth/login`: 이메일/비밀번호로 로그인, JWT 발급
  - `GET /api/v1/users/me`: 현재 로그인된 사용자 정보 조회
- **데이터 모델 (`users`):** `id`, `user_id`, `password_hash`, `email`, `name`, `birthdate`, `gender`, `phone_number` 등

### 3.2. 클럽 (Club)

- **요구사항:** 사용자는 클럽을 생성하고 다른 사용자를 멤버로 초대/관리할 수 있습니다.
- **API Endpoints:**
  - `POST /api/v1/clubs`: 신규 클럽 생성
  - `GET /api/v1/clubs/:clubId`: 특정 클럽의 상세 정보 조회
  - `POST /api/v1/clubs/:clubId/join`: 클럽 가입 신청
  - `GET /api/v1/clubs/:clubId/members`: 클럽 멤버 목록 조회
- **데이터 모델 (`clubs`, `club_members`):** 클럽 정보와 멤버의 역할(선수, 코치 등)을 관리합니다.

### 3.3. 경기 및 실시간 이벤트 (Match & Real-time Events)

- **요구사항:** 클럽 관리자는 경기를 생성할 수 있습니다. 지정된 기록원은 경기 중 발생하는 이벤트(득점, 경고 등)를 실시간으로 입력하고, 해당 경기를 보는 모든 사용자에게 즉시 공유되어야 합니다.
- **API Endpoints:**
  - `POST /api/v1/matches`: 친선 경기 생성
  - `GET /api/v1/matches/:matchId`: 경기 상세 정보 조회
  - `POST /api/v1/matches/:matchId/events`: 경기 이벤트 기록 (예: `{ "type": "GOAL", "playerId": 123, "timestamp": "..." }`)
- **WebSocket Events:**
  - **`match:event:new`**: 새로운 경기 이벤트가 발생했을 때 서버가 클라이언트로 전송하는 이벤트. 경기 상세 페이지에 접속한 모든 사용자에게 브로드캐스트됩니다.
- **데이터 모델 (`matches`, `match_events`):** 경기 기본 정보와 경기 중 발생한 모든 이벤트를 시간 순서대로 기록합니다.

---

## 4. 프론트엔드 아키텍처

### 4.1. 기술 선택

- **상태 관리 (State Management):**
  - **서버 상태:** `React-Query` (TanStack Query)를 사용하여 API 데이터를 효율적으로 가져오고 캐싱합니다. 로딩 및 오류 상태를 선언적으로 관리하여 코드 복잡도를 낮춥니다.
  - **클라이언트 상태:** `Zustand`를 사용하여 로그인 상태 등 전역적으로 필요한 UI 상태를 간결하게 관리합니다.
- **UI 컴포넌트:** `Material-UI` 또는 `Ant Design`과 같은 검증된 라이브러리를 사용하여 개발 속도를 높이고 일관된 디자인을 유지합니다.

### 4.2. 디렉토리 구조 (Feature-based)

코드를 기능(도메인) 단위로 구성하여 응집도를 높이고 유지보수를 용이하게 합니다.

```
src/
├── features/        # 도메인별 기능 폴더
│   ├── auth/        # 인증 관련 컴포넌트, 훅, API 호출 함수
│   ├── club/        # 클럽 관련 로직
│   └── match/       # 경기 관련 로직
├── components/      # 여러 기능에서 재사용되는 공통 컴포넌트 (예: Button, Modal)
├── lib/             # API 클라이언트, WebSocket 클라이언트 등 외부 통신 설정
├── pages/           # Next.js 또는 React Router의 라우팅 단위 페이지
└── App.js
```

<!--
기존 내용 주석처리 (2025-01-22)
이유: Gemini Code Assist 피드백 반영 및 프로덕션 준비성 강화

원본 설계 문서의 핵심 아키텍처와 기능 설계는 유지하되,
실제 구현 과정에서 발견된 보안 및 품질 이슈를 반영하여 업데이트
-->

이 문서는 살아있는 문서(Living Document)로, 프로젝트가 진행됨에 따라 지속적으로 업데이트되어야 합니다.

---

## 5. 프로덕션 준비성 개선사항 (Production Readiness - 2025-01-22 추가)

### 5.1. Critical Issues (즉시 수정 필요)

#### 5.1.1. 데이터베이스 연결 에러 처리
**문제:** 현재 `testConnection()` 함수가 DB 연결 실패 시에도 서버가 계속 실행됨
```javascript
// 현재 (문제)
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    // 에러를 다시 throw하지 않아 서버가 계속 실행됨
  }
}
```

**해결방안:**
```javascript
// 개선 필요
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error; // 서버 시작을 중단시켜야 함
  }
}
```

#### 5.1.2. 데이터베이스 동기화 전략
**문제:** `sequelize.sync({ alter: true })`는 프로덕션에서 데이터 손실 위험
**해결방안:** Sequelize CLI 마이그레이션 시스템 도입
```bash
# 마이그레이션 설정
npx sequelize-cli init
npx sequelize-cli migration:generate --name create-users-table
```

### 5.2. Important Issues (우선순위 높음)

#### 5.2.1. React Navigation 최적화
**문제:** `window.location.href` 사용으로 인한 페이지 전체 리로드
```javascript
// 현재 (비효율적)
window.location.href = '/dashboard';

// 개선 필요
const navigate = useNavigate();
navigate('/dashboard');
```

#### 5.2.2. 구조화된 로깅 시스템
**문제:** `console.error` 의존으로 인한 로그 관리 어려움
**해결방안:** Winston 또는 Pino 도입
```javascript
// Winston 설정 예시
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### 5.3. Enhancement Issues (점진적 개선)

#### 5.3.1. 테스트 커버리지 확장
**현재 상태:** 기본 placeholder 테스트만 존재
**개선계획:**
- React Testing Library 설정
- 컴포넌트 단위 테스트 작성
- API 엔드포인트 통합 테스트
- E2E 테스트 시나리오 구축

#### 5.3.2. TypeScript 엄격 모드
```json
// tsconfig.json 개선
{
  "compilerOptions": {
    "strict": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### 5.4. 보안 강화 방안

#### 5.4.1. 환경별 설정 분리
```env
# .env.development
NODE_ENV=development
LOG_LEVEL=debug

# .env.production
NODE_ENV=production
LOG_LEVEL=error
JWT_SECRET=${STRONG_SECRET_FROM_ENV}
```

#### 5.4.2. API 에러 바운더리
```javascript
// 글로벌 에러 핸들러
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', { error: error.message, stack: error.stack });
  res.status(500).json({ error: 'Internal server error' });
});
```

### 5.5. 개선 우선순위 및 일정

**Phase 1 (즉시 - 1주 내):**
1. 데이터베이스 연결 에러 처리 수정
2. Sequelize 마이그레이션 시스템 도입
3. React Navigation 개선

**Phase 2 (1-2주):**
1. Winston 로깅 시스템 구축
2. 기본 테스트 suite 설정
3. TypeScript strict 모드 활성화

**Phase 3 (1개월 내):**
1. 포괄적인 테스트 커버리지
2. 성능 모니터링 시스템
3. CI/CD 파이프라인 구축

---

## 6. 기술 부채 관리 계획 (Technical Debt Management)

### 6.1. 코드 품질 지표
- **테스트 커버리지:** 최소 80% 목표
- **TypeScript 엄격성:** strict 모드 활성화
- **ESLint 규칙:** Airbnb 스타일 가이드 적용
- **성능 지표:** Core Web Vitals 기준 충족

### 6.2. 정기 리뷰 사이클
- **주간 코드 리뷰:** 새로운 기능 및 버그 수정
- **월간 아키텍처 리뷰:** 시스템 설계 및 확장성 점검
- **분기별 기술 부채 정리:** 누적된 기술 부채 우선순위 정리