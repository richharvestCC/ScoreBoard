# 📚 ScoreBoard API 문서

ScoreBoard 플랫폼의 완전한 REST API 가이드

## 🌐 API 개요

### Base URL
- **개발**: `http://localhost:3001/api/v1`
- **프로덕션**: `https://api.scoreboard.com/api/v1`

### 인증
JWT Bearer 토큰 방식 사용
```
Authorization: Bearer <your_jwt_token>
```

### 응답 형식
```json
{
  "success": true,
  "message": "성공 메시지",
  "data": { /* 데이터 */ },
  "pagination": { /* 페이지 정보 */ }
}
```

## 🔐 인증 API

### POST `/auth/register`
회원가입

**요청:**
```json
{
  "username": "user123",
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동"
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "user123",
      "email": "user@example.com",
      "role": "user"
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

### POST `/auth/login`
로그인

### POST `/auth/refresh-token`
토큰 갱신

### GET `/auth/profile`
프로필 조회 (인증 필요)

### POST `/auth/logout`
로그아웃 (인증 필요)

## 👥 클럽 관리 API

### POST `/clubs`
클럽 생성 (인증 필요)

### GET `/clubs`
클럽 목록 조회

**쿼리 매개변수:**
- `page`: 페이지 번호
- `limit`: 페이지 크기
- `search`: 검색어
- `club_type`: 클럽 타입

### GET `/clubs/:id`
특정 클럽 조회

### PUT `/clubs/:id`
클럽 수정 (클럽 관리자)

### DELETE `/clubs/:id`
클럽 삭제 (관리자)

### POST `/clubs/:id/join`
클럽 가입

### POST `/clubs/:id/leave`
클럽 탈퇴

### GET `/clubs/:id/members`
클럽 멤버 조회

## 🏆 대회 관리 API

### GET `/competitions`
대회 목록 조회

**쿼리 매개변수:**
- `status`: 대회 상태 (`draft`, `registration`, `active`, `completed`)
- `competition_type`: 대회 타입 (`league`, `tournament`, `cup`)
- `season`: 시즌

### POST `/competitions`
대회 생성 (관리자)

**요청:**
```json
{
  "name": "2025 K리그",
  "competition_type": "league",
  "season": "2025",
  "start_date": "2025-03-01",
  "end_date": "2025-11-30"
}
```

### GET `/competitions/:id`
대회 조회

### PUT `/competitions/:id`
대회 수정 (관리자)

### DELETE `/competitions/:id`
대회 삭제 (관리자)

### PATCH `/competitions/:id/status`
대회 상태 변경

### GET `/competitions/templates`
대회 템플릿 조회

### POST `/competitions/from-template/:templateId`
템플릿으로 대회 생성

## ⚽ 경기 관리 API

### GET `/matches`
경기 목록 조회

**쿼리 매개변수:**
- `competition_id`: 대회 ID
- `status`: 경기 상태
- `date_from`, `date_to`: 날짜 범위

### POST `/matches`
경기 생성 (관리자)

### GET `/matches/:id`
경기 조회

### PUT `/matches/:id`
경기 수정 (관리자)

### POST `/matches/:id/events`
경기 이벤트 추가 (기록원)

**요청:**
```json
{
  "event_type": "goal",
  "minute": 25,
  "player_name": "홍길동",
  "description": "페널티킥 골"
}
```

### GET `/matches/:id/events`
경기 이벤트 조회

## 📅 스케줄링 API

### POST `/scheduling/competitions/:id/auto-schedule`
자동 스케줄링 (관리자)

**요청:**
```json
{
  "start_date": "2025-03-01",
  "end_date": "2025-11-30",
  "preferred_times": ["15:00", "19:00"],
  "venues": ["경기장A", "경기장B"]
}
```

### POST `/scheduling/matches/:id/schedule`
개별 경기 스케줄링

### PUT `/scheduling/matches/:id/reschedule`
경기 재스케줄링

### POST `/scheduling/matches/:id/check-conflict`
스케줄 충돌 확인

### GET `/scheduling/competitions/:id/stats`
스케줄링 통계

## 🔴 라이브 스코어링 API

### POST `/live/:matchId/start`
라이브 경기 시작 (기록원)

### POST `/live/:matchId/end`
라이브 경기 종료 (기록원)

### PUT `/live/:matchId/score`
스코어 업데이트 (기록원)

**요청:**
```json
{
  "home_score": 2,
  "away_score": 1,
  "minute": 45
}
```

### POST `/live/:matchId/event`
라이브 이벤트 추가 (기록원)

### GET `/live/:matchId`
라이브 경기 정보

### GET `/live/matches/live`
진행 중인 라이브 경기 목록

## 🎯 관리자 API

### GET `/admin/dashboard/stats`
대시보드 통계 (관리자)

**응답:**
```json
{
  "user_stats": {
    "total_users": 150,
    "active_users": 120
  },
  "competition_stats": {
    "total_competitions": 8,
    "active_competitions": 3
  },
  "system_health": {
    "database": "healthy",
    "api": "healthy"
  }
}
```

### GET `/admin/users`
사용자 관리 (관리자)

### GET `/admin/system/status`
시스템 상태 (관리자)

## 🔌 WebSocket API

### 연결
```javascript
const socket = io('http://localhost:3001');
```

### 이벤트

#### 클라이언트 → 서버
- `join-match`: 경기 채널 입장
- `leave-match`: 경기 채널 퇴장

#### 서버 → 클라이언트
- `score-update`: 스코어 업데이트
- `event-added`: 새 이벤트 추가
- `match-started`: 경기 시작
- `match-ended`: 경기 종료

### 예시
```javascript
// 경기 채널 입장
socket.emit('join-match', { matchId: 'uuid' });

// 스코어 업데이트 수신
socket.on('score-update', (data) => {
  console.log('스코어:', data);
});
```

## 🚨 오류 코드

### HTTP 상태 코드
- `200`: 성공
- `201`: 생성됨
- `400`: 잘못된 요청
- `401`: 인증 실패
- `403`: 권한 없음
- `404`: 찾을 수 없음
- `409`: 충돌 (중복)
- `422`: 유효성 검증 실패
- `429`: 요청 제한 초과
- `500`: 서버 오류

### 오류 응답
```json
{
  "success": false,
  "message": "오류 메시지",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "email",
      "message": "유효하지 않은 이메일"
    }
  }
}
```

## 🔒 보안

### Rate Limiting
- **인증 API**: 5회/분
- **일반 API**: 100회/분
- **관리자 API**: 50회/분

### 권한 시스템
- `user`: 기본 사용자
- `recorder`: 경기 기록원
- `club_admin`: 클럽 관리자
- `moderator`: 운영자
- `admin`: 시스템 관리자

### 데이터 보안
- 모든 입력 XSS 보호
- SQL Injection 방지
- 비밀번호 bcrypt 암호화

---

## 🔗 Related Documentation

### System Design
- **[Architecture Guide](./ARCHITECTURE.md)** - Complete system design and technical architecture
- **[Logging System](./backend/LOGGING.md)** - Request tracking and debugging guide

### Development
- **[Setup Guide](./README.md#-설치-및-실행)** - Development environment configuration
- **[Test Accounts](./backend/docs/dummy-users.md)** - API testing credentials

### Security Implementation
- **[XSS Protection](./docs/security-implementation.md)** - Security middleware and validation
- **[Rate Limiting](./docs/performance-optimization.md)** - API throttling configuration

---

📝 **최종 업데이트**: 2025-09-24 | 📚 **API Version**: v1.0