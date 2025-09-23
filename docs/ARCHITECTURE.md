# 🏗️ ScoreBoard 아키텍처 문서

ScoreBoard 플랫폼의 시스템 아키텍처 및 설계 가이드

## 🎯 시스템 개요

### 아키텍처 스타일
- **패턴**: 3계층 아키텍처 (Presentation - Business - Data)
- **통신**: RESTful API + WebSocket 실시간 통신
- **데이터베이스**: PostgreSQL + Sequelize ORM
- **인증**: JWT 기반 Stateless 인증

### 핵심 설계 원칙
- **확장성**: 모듈형 설계, 수평 확장 지원
- **보안**: 다중 보안 계층 (인증, 권한, 입력 검증)
- **관찰성**: 구조화된 로깅, 상관관계 ID 추적
- **복원력**: Circuit Breaker, Graceful Shutdown

## 🏢 전체 시스템 구조

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│ (React 18 SPA)  │◄──►│  (Node.js)      │◄──►│ (PostgreSQL)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
    ┌────▼────┐              ┌────▼────┐              ┌────▼────┐
    │Material │              │Express  │              │Sequelize│
    │   UI    │              │Socket.io│              │Migration│
    │React Qry│              │Winston  │              │ System  │
    └─────────┘              └─────────┘              └─────────┘
```

## 🎨 프론트엔드 아키텍처

### 폴더 구조
```
frontend/src/
├── components/          # 재사용 가능한 UI 컴포넌트
│   ├── common/         # 공통 컴포넌트
│   ├── admin/          # 관리자 컴포넌트
│   ├── scheduling/     # 스케줄링 컴포넌트
│   └── live/           # 라이브 스코어링
├── pages/              # 페이지 컴포넌트
├── services/           # API 서비스
├── hooks/              # 커스텀 React 훅
├── contexts/           # React Context
├── utils/              # 유틸리티 함수
└── types/              # TypeScript 타입
```

### 상태 관리
- **서버 상태**: React Query (TanStack Query)
- **클라이언트 상태**: React Hooks (useState, useContext)
- **실시간 상태**: Socket.io + React Query

### 주요 기술 스택
```typescript
// 핵심
React 18 + TypeScript
Material-UI (MUI) v5

// 상태 관리
@tanstack/react-query
React Context API

// 라우팅
react-router-dom v6
NavigationContext (커스텀)

// 통신
axios (HTTP)
socket.io-client (WebSocket)
```

### 컴포넌트 설계 패턴
```typescript
// Container/Presenter 패턴
const MatchListContainer = () => {
  const { data, isLoading } = useQuery(['matches'], fetchMatches);
  return <MatchListPresenter matches={data} loading={isLoading} />;
};

// Custom Hook 패턴
const useAuth = () => {
  const [user, setUser] = useState(null);
  const login = useCallback(...);
  return { user, login, logout };
};
```

## ⚙️ 백엔드 아키텍처

### 계층형 구조
```
┌─────────────────────────────────────┐
│           Controllers               │ ← HTTP 요청 처리
├─────────────────────────────────────┤
│             Services                │ ← 비즈니스 로직
├─────────────────────────────────────┤
│              Models                 │ ← 데이터 모델
├─────────────────────────────────────┤
│            Database                 │ ← PostgreSQL
└─────────────────────────────────────┘
```

### 폴더 구조
```
backend/src/
├── controllers/        # HTTP 컨트롤러
├── services/          # 비즈니스 로직
├── models/            # Sequelize 모델
├── middleware/        # Express 미들웨어
├── routes/            # 라우터 정의
├── config/            # 설정 (DB, JWT, Logger)
├── utils/             # 유틸리티
├── migrations/        # DB 마이그레이션
└── seeders/           # 시드 데이터
```

### 미들웨어 스택
```javascript
app.use(correlationId);      // 상관관계 ID
app.use(requestLogger);      // 요청 로깅
app.use(xssProtection);      // XSS 보호
app.use(rateLimiter);        // Rate Limiting
app.use(authenticateToken);   // JWT 인증
app.use(authorize);          // 권한 검사
app.use(routes);             // 라우팅
app.use(errorHandler);       // 오류 처리
```

### 서비스 레이어 예시
```javascript
class MatchService {
  async createMatch(matchData, userId) {
    // 1. 입력 검증
    const validatedData = await validateMatchData(matchData);

    // 2. 비즈니스 로직
    const conflictCheck = await this.checkScheduleConflict(validatedData);

    // 3. 데이터베이스 트랜잭션
    const transaction = await sequelize.transaction();
    try {
      const match = await Match.create(validatedData, { transaction });
      await transaction.commit();
      return match;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
```

## 💾 데이터베이스 설계

### 주요 엔티티 관계
```
Users (사용자)
├── id (PK), username, email, role
└── 1:N → ClubMembers, Matches

Clubs (클럽)
├── id (PK), name, club_type
└── 1:N → ClubMembers, Matches

Competitions (대회)
├── id (PK), name, competition_type, status
└── 1:N → Matches, CompetitionParticipants

Matches (경기)
├── id (PK), competition_id (FK)
├── home_club_id, away_club_id (FK)
├── match_date, status, scores
└── 1:N → MatchEvents

MatchEvents (경기 이벤트)
├── id (PK), match_id (FK)
├── event_type, minute, player_name
└── description
```

### 마이그레이션 시스템
```javascript
// Umzug 기반 마이그레이션
const umzug = new Umzug({
  migrations: {
    glob: 'migrations/*.js',
    resolve: ({ name, path, context }) => {
      const migration = require(path);
      return {
        name,
        up: async () => migration.up(context.sequelize.getQueryInterface()),
        down: async () => migration.down(context.sequelize.getQueryInterface())
      };
    }
  },
  context: { sequelize },
  storage: new SequelizeStorage({ sequelize })
});
```

## 🔒 보안 아키텍처

### 보안 계층
```
┌─────────────────────────────────────┐
│        Network Security             │ ← HTTPS, CORS
├─────────────────────────────────────┤
│      Application Security           │ ← XSS, Rate Limiting
├─────────────────────────────────────┤
│      Authentication Layer           │ ← JWT
├─────────────────────────────────────┤
│      Authorization Layer            │ ← RBAC
├─────────────────────────────────────┤
│          Data Security              │ ← Encryption
└─────────────────────────────────────┘
```

### JWT 인증 플로우
```
Client → Auth API: login(email, password)
Auth API → Client: accessToken + refreshToken
Client → Resource API: request + Bearer token
Resource API → Resource API: verify JWT
If valid: Resource API → Client: response
If expired: Resource API → Client: 401
Client → Auth API: refresh token
Auth API → Client: new access token
```

### RBAC 권한 시스템
```javascript
const permissions = {
  user: ['read:own_profile', 'update:own_profile'],
  recorder: ['create:match_events', 'update:match_events'],
  club_admin: ['manage:club_members', 'create:matches'],
  moderator: ['moderate:content', 'manage:users'],
  admin: ['*'] // 모든 권한
};
```

## 📊 로깅 및 모니터링

### 로깅 시스템
```javascript
// Winston 기반 구조화된 로깅
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, correlationId, userId, message, ...meta }) => {
      return `${timestamp} [${level}][${correlationId}][user:${userId}]: ${message} | ${JSON.stringify(meta)}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' })
  ]
});
```

### 상관관계 ID 추적
```javascript
// AsyncLocalStorage를 통한 요청 추적
const correlationStore = new AsyncLocalStorage();

app.use((req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || uuidv4();
  correlationStore.run({ correlationId, userId: req.user?.id }, next);
});
```

## 🚀 실시간 통신

### Socket.io 이벤트 아키텍처
```javascript
// 서버 이벤트 핸들링
io.on('connection', (socket) => {
  socket.on('join-match', (matchId) => {
    socket.join(`match:${matchId}`);
  });

  socket.on('score-update', (data) => {
    io.to(`match:${data.matchId}`).emit('score-update', data);
  });
});
```

### 실시간 데이터 동기화
```typescript
// React Query + Socket.io 연동
const useMatchLiveData = (matchId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    socket.emit('join-match', matchId);

    socket.on('score-update', (data) => {
      queryClient.setQueryData(['match', matchId], data);
    });

    return () => {
      socket.emit('leave-match', matchId);
    };
  }, [matchId]);
};
```

## 📈 확장성 고려사항

### 수평 확장 전략
```yaml
# 향후 마이크로서비스 분리 계획
services:
  user-service:
    responsibilities: [인증, 사용자 관리]
    database: users, roles

  match-service:
    responsibilities: [경기 관리, 스케줄링]
    database: matches, events

  competition-service:
    responsibilities: [대회 관리]
    database: competitions, standings
```

### 성능 최적화
- **데이터베이스**: 연결 풀링, 쿼리 최적화, 인덱싱
- **캐싱**: Redis 도입 계획 (세션, 자주 조회되는 데이터)
- **프론트엔드**: 코드 스플리팅, 지연 로딩, 메모이제이션

## 🔧 배포 및 운영

### CI/CD 파이프라인 (계획)
```yaml
# GitHub Actions 예시
stages:
  - test: 단위 테스트, 린트 검사
  - build: 프로덕션 빌드
  - deploy: 스테이징/프로덕션 배포
  - monitor: 헬스 체크, 알림
```

### 환경 관리
```bash
# 개발 환경
NODE_ENV=development
DB_HOST=localhost

# 스테이징 환경
NODE_ENV=staging
DB_HOST=staging-db.internal

# 프로덕션 환경
NODE_ENV=production
DB_HOST=prod-db.internal
```

## 📋 기술 부채 및 개선 계획

### 단기 개선 (1-3개월)
- [ ] 테스트 커버리지 확장 (>80%)
- [ ] API 문서 자동 생성 (Swagger)
- [ ] 성능 모니터링 도구 도입

### 중장기 개선 (3-12개월)
- [ ] 마이크로서비스 아키텍처 전환
- [ ] 클라우드 네이티브 인프라 구축
- [ ] AI/ML 기반 고급 분석 기능

---

🏗️ **아키텍처 버전**: v1.0
## 🔗 Related Documentation

### Technical References
- **[API Documentation](./API.md)** - Complete REST API guide with endpoints and examples
- **[Logging System Guide](./backend/LOGGING.md)** - Structured logging implementation and usage
- **[Development Setup](./README.md#-설치-및-실행)** - Installation and development environment

### Project Management
- **[Technical Debt Analysis](./docs/technical-debt-analysis.md)** - Current status and resolution tracking
- **[Dashboard Design Tasks](./docs/dashboard-design-implementation.md)** - UI/UX enhancement roadmap

### Database and Migrations
- **[Migration Strategy](./docs/database-migrations.md)** - Database evolution approach
- **[Test Data Guide](./backend/docs/dummy-users.md)** - Development account information

---

📝 **최종 업데이트**: 2025-09-24 | 📚 **Documentation Version**: v2.0