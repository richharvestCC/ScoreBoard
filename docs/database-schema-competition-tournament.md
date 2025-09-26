# 매치카드 데이터베이스 스키마 - 대회/토너먼트/리그 시스템

## 개요
매치카드 플랫폼의 대회 생성, 토너먼트 및 리그 관리 시스템에 대한 상세 데이터베이스 스키마 문서입니다.

## 핵심 테이블 구조

### 1. Users (사용자) 테이블
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  birthdate DATE,
  gender ENUM('male', 'female', 'other'),
  phone_number VARCHAR(20),
  profile_image_url VARCHAR(500),
  role ENUM('user', 'admin', 'moderator', 'organizer') DEFAULT 'user',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**역할 및 권한:**
- `user`: 일반 사용자
- `admin`: 시스템 관리자 (모든 권한)
- `moderator`: 운영자 (콘텐츠 관리, 사용자 관리 제외)
- `organizer`: 대회 주최자 (대회 생성 및 관리)

### 2. Clubs (클럽/팀) 테이블
```sql
CREATE TABLE clubs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  location VARCHAR(200),
  founded_year INTEGER CHECK (founded_year >= 1800 AND founded_year <= EXTRACT(year FROM NOW())),
  logo_url VARCHAR(500),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Competitions (대회) 테이블 - 메인 테이블
```sql
CREATE TABLE competitions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,

  -- 대회 유형 및 형식
  competition_type ENUM('league', 'tournament', 'cup') NOT NULL,
  format ENUM('round_robin', 'knockout', 'mixed', 'group_knockout') DEFAULT 'knockout',

  -- 조별 예선 설정
  has_group_stage BOOLEAN DEFAULT false,
  group_stage_format ENUM('round_robin', 'single_elimination'),
  knockout_stage_format ENUM('single_elimination', 'double_elimination'),

  -- 대회 기본 정보
  level ENUM('local', 'regional', 'national', 'international') DEFAULT 'local',
  season VARCHAR(50), -- '2025', '2025-Spring', '2025-1차'

  -- 일정 관리
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  registration_start TIMESTAMP,
  registration_end TIMESTAMP,

  -- 상세 정보
  description TEXT, -- 최대 5,000자
  rules TEXT, -- 최대 10,000자
  venue_info TEXT, -- 최대 3,000자

  -- 참가 관리
  max_participants INTEGER CHECK (max_participants >= 2 AND max_participants <= 128),
  min_participants INTEGER DEFAULT 2 CHECK (min_participants >= 2),
  entry_fee DECIMAL(10, 2) CHECK (entry_fee >= 0),
  prize_description TEXT, -- 최대 2,000자

  -- 상태 관리
  is_public BOOLEAN DEFAULT true,
  status ENUM('draft', 'open_registration', 'registration_closed', 'in_progress', 'completed', 'cancelled') DEFAULT 'draft',

  -- 관리자 정보
  organization_id INTEGER, -- 주최 조직 (추후 확장)
  admin_user_id INTEGER NOT NULL REFERENCES users(id),
  created_by INTEGER NOT NULL REFERENCES users(id),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Competition 상태 흐름:**
```
draft → open_registration → registration_closed → in_progress → completed
                                                              ↓
                                                         cancelled
```

### 4. Tournaments (토너먼트) 테이블 - 레거시
```sql
CREATE TABLE tournaments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  tournament_type ENUM('league', 'tournament') NOT NULL,
  format ENUM('round_robin', 'knockout', 'mixed') DEFAULT 'knockout',
  has_group_stage BOOLEAN DEFAULT false,
  level ENUM('local', 'national', 'international') DEFAULT 'local',
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  description TEXT,
  max_participants INTEGER,
  entry_fee DECIMAL(10, 2),
  prize_description TEXT,
  rules TEXT,
  is_public BOOLEAN DEFAULT true,
  status ENUM('draft', 'open', 'closed', 'in_progress', 'completed', 'cancelled') DEFAULT 'draft',
  organization_id INTEGER,
  admin_user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 5. Tournament_Participants (참가자) 테이블
```sql
CREATE TABLE tournament_participants (
  id SERIAL PRIMARY KEY,
  tournament_id INTEGER NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  participant_id INTEGER NOT NULL,
  participant_type ENUM('user', 'club') DEFAULT 'user',
  joined_at TIMESTAMP DEFAULT NOW(),
  status ENUM('active', 'withdrawn', 'disqualified') DEFAULT 'active',

  -- 토너먼트 구성
  group_name VARCHAR(1), -- A, B, C, D 조
  seed_number INTEGER, -- 시드 번호

  -- 통계
  points INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  goals_for INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,

  UNIQUE(tournament_id, participant_id, participant_type),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 6. Matches (경기) 테이블
```sql
CREATE TABLE matches (
  id SERIAL PRIMARY KEY,
  home_club_id INTEGER NOT NULL REFERENCES clubs(id),
  away_club_id INTEGER NOT NULL REFERENCES clubs(id),

  -- 경기 분류
  match_type ENUM('friendly', 'league', 'cup', 'tournament') DEFAULT 'friendly',
  stage ENUM('group', 'round_of_16', 'quarter', 'semi', 'final', 'regular_season', 'playoff'),
  round INTEGER,

  -- 대회 연결
  tournament_id INTEGER REFERENCES tournaments(id),
  competition_id INTEGER REFERENCES competitions(id),

  -- 경기 정보
  match_date TIMESTAMP NOT NULL,
  scheduled_date TIMESTAMP,
  venue VARCHAR(200),
  venue_capacity INTEGER CHECK (venue_capacity >= 0),

  -- 스코어
  home_score INTEGER DEFAULT 0 CHECK (home_score >= 0),
  away_score INTEGER DEFAULT 0 CHECK (away_score >= 0),

  -- 경기 상세
  status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
  duration_minutes INTEGER DEFAULT 90 CHECK (duration_minutes BETWEEN 1 AND 200),
  estimated_duration INTEGER DEFAULT 90 CHECK (estimated_duration BETWEEN 30 AND 240),

  -- 추가 정보
  referee VARCHAR(100),
  weather_conditions VARCHAR(100),
  notes TEXT,
  ticket_price DECIMAL(10, 2) CHECK (ticket_price >= 0),

  -- 스케줄링
  priority ENUM('low', 'normal', 'high', 'critical') DEFAULT 'normal',
  scheduling_status ENUM('pending', 'confirmed', 'rescheduled', 'conflicted') DEFAULT 'pending',
  conflict_reason VARCHAR(500),
  auto_scheduled BOOLEAN DEFAULT false,

  -- 관리 정보
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 관계도 (Entity Relationship)

### 핵심 관계
```
Users (1) ──── (N) Competitions [admin_user_id, created_by]
Users (1) ──── (N) Clubs [created_by]
Users (N) ──── (N) Clubs [through ClubMembers]
Competitions (1) ──── (N) Matches [competition_id]
Tournaments (1) ──── (N) Matches [tournament_id]
Tournaments (1) ──── (N) TournamentParticipants
Clubs (1) ──── (N) Matches [home_club_id, away_club_id]
```

### 상세 관계 설명

#### Competition → User
- `admin_user_id`: 대회 관리자 (필수)
- `created_by`: 대회 생성자 (필수)

#### Tournament → User
- `admin_user_id`: 토너먼트 관리자

#### Match → Competition/Tournament
- `competition_id`: 새로운 Competition 시스템 연결
- `tournament_id`: 기존 Tournament 시스템 연결 (레거시)

#### Match → Clubs
- `home_club_id`: 홈팀
- `away_club_id`: 원정팀

## 대회 형식별 스키마 활용

### 1. 리그전 (League - Round Robin)
```sql
-- 설정 예시
competition_type = 'league'
format = 'round_robin'
has_group_stage = false
```
- 모든 팀이 한 번씩 경기
- 승점 계산으로 순위 결정
- `tournament_participants` 테이블에서 승점, 승/무/패 통계 관리

### 2. 토너먼트 (Single/Double Elimination)
```sql
-- 설정 예시
competition_type = 'tournament'
format = 'knockout'
knockout_stage_format = 'single_elimination'
```
- 패배하면 탈락하는 토너먼트
- `stage` 필드로 경기 단계 구분 (16강, 8강, 4강, 결승)

### 3. 혼합형 (Group Stage + Knockout)
```sql
-- 설정 예시
competition_type = 'tournament'
format = 'group_knockout'
has_group_stage = true
group_stage_format = 'round_robin'
knockout_stage_format = 'single_elimination'
```
- 조별 예선 후 결승 토너먼트
- `group_name` 필드로 조 구분 (A, B, C, D)
- `stage` 필드로 예선/결승 구분

## 인덱스 최적화

### 성능 최적화를 위한 주요 인덱스
```sql
-- Competitions 테이블
CREATE INDEX idx_competitions_type ON competitions(competition_type);
CREATE INDEX idx_competitions_format ON competitions(format);
CREATE INDEX idx_competitions_status ON competitions(status);
CREATE INDEX idx_competitions_season ON competitions(season);
CREATE INDEX idx_competitions_admin ON competitions(admin_user_id);

-- Matches 테이블
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_home_club ON matches(home_club_id);
CREATE INDEX idx_matches_away_club ON matches(away_club_id);
CREATE INDEX idx_matches_competition ON matches(competition_id);
CREATE INDEX idx_matches_tournament ON matches(tournament_id);

-- Tournament_Participants 테이블
CREATE INDEX idx_tournament_participants_tournament ON tournament_participants(tournament_id);
CREATE INDEX idx_tournament_participants_group ON tournament_participants(tournament_id, group_name);
CREATE INDEX idx_tournament_participants_points ON tournament_participants(tournament_id, points, goal_difference);
```

## 데이터 무결성 및 제약 조건

### 비즈니스 규칙 제약조건
```sql
-- 경기 날짜 검증
ALTER TABLE competitions ADD CONSTRAINT chk_competition_dates
CHECK (end_date IS NULL OR start_date IS NULL OR end_date > start_date);

ALTER TABLE competitions ADD CONSTRAINT chk_registration_dates
CHECK (registration_end IS NULL OR registration_start IS NULL OR registration_end > registration_start);

-- 참가자 수 제한
ALTER TABLE competitions ADD CONSTRAINT chk_participant_limits
CHECK (min_participants IS NULL OR max_participants IS NULL OR max_participants >= min_participants);

-- 같은 팀끼리 경기 방지
ALTER TABLE matches ADD CONSTRAINT chk_different_clubs
CHECK (home_club_id != away_club_id);

-- 조별 예선 설정 일관성
ALTER TABLE competitions ADD CONSTRAINT chk_group_stage_consistency
CHECK (
  (has_group_stage = false AND group_stage_format IS NULL) OR
  (has_group_stage = true AND group_stage_format IS NOT NULL)
);
```

## 확장 고려사항

### 향후 확장 가능성
1. **Organization 테이블**: 대회 주최 기관 관리
2. **Seasons 테이블**: 시즌별 대회 그룹핑
3. **CompetitionTemplates 테이블**: 대회 템플릿 시스템
4. **Standings 테이블**: 실시간 순위표 캐싱
5. **CompetitionSettings 테이블**: 대회별 세부 설정 JSON

### 성능 고려사항
- 대용량 데이터를 위한 파티셔닝 (날짜별, 시즌별)
- 읽기 전용 복제본을 통한 통계 조회 최적화
- Redis 캐싱을 통한 실시간 순위표 성능 향상

## 마이그레이션 전략

### Competition vs Tournament 통합
현재 `competitions`와 `tournaments` 테이블이 공존하고 있으며, `competitions` 테이블이 더 포괄적이고 확장성이 좋습니다.

**권장 마이그레이션:**
1. 기존 `tournaments` 데이터를 `competitions`로 이관
2. `tournaments` 테이블을 읽기 전용으로 전환
3. 새로운 기능은 `competitions` 기반으로 개발
4. 점진적으로 `tournaments` 테이블 의존성 제거

---

**문서 작성일**: 2025-09-25
**데이터베이스**: PostgreSQL
**ORM**: Sequelize
**플랫폼**: 매치카드 (MatchCard) - Node.js/React 풋볼 관리 시스템