# ScoreBoard 더미 사용자 계정 정보

## 🔑 로그인 방식
**사용자 ID + 비밀번호**로 로그인합니다. (이메일 로그인 아님)

## 🔐 슈퍼 관리자

| 사용자 ID | 이름 | 이메일 | 비밀번호 | 역할 |
|-----------|------|--------|----------|------|
| `superadmin` | Super Admin | admin@scoreboard.com | `development123` | 시스템 전체 관리자 |

## 🏛️ 클럽/조직 관리자 (10명)

### WK리그 프로팀 관리자 (8명)
| 사용자 ID | 클럽명 | 이메일 | 비밀번호 | 클럽 타입 |
|-----------|--------|--------|----------|-----------|
| `club_1_admin` | 수원FC위민 | admin1@fc.com | `admin123` | pro |
| `club_2_admin` | 세종스포츠토토여자축구단 | admin2@club2.com | `admin123` | pro |
| `club_3_admin` | 인천현대제철 | admin3@club3.com | `admin123` | pro |
| `club_4_admin` | 상무여자축구단 | admin4@club4.com | `admin123` | pro |
| `club_5_admin` | 화천 KSPO 여자축구단 | admin5@kspo.com | `admin123` | pro |
| `club_6_admin` | 경남창녕WFC | admin6@wfc.com | `admin123` | pro |
| `club_7_admin` | 경주한수원WFC | admin7@wfc.com | `admin123` | pro |
| `club_8_admin` | 서울시청 | admin8@club8.com | `admin123` | pro |

### 조직/연맹 관리자 (1명)
| 사용자 ID | 조직명 | 이메일 | 비밀번호 | 클럽 타입 |
|-----------|--------|--------|----------|-----------|
| `club_9_admin` | 한국여자축구연맹 | admin9@club9.com | `admin123` | org |

### 일반 클럽 관리자 (1명)
| 사용자 ID | 클럽명 | 이메일 | 비밀번호 | 클럽 타입 |
|-----------|--------|--------|----------|-----------|
| `club_10_admin` | 상봉조기축구회 | admin10@club10.com | `admin123` | 기본값 |
| `sangbong_admin` | 상봉조기축구회 | admin@sangbong.com | `admin123` | 기본값 |

## 🏆 토너먼트 관리자 및 기록원 (2명)

### 2025 WK리그
| 사용자 ID | 이름 | 이메일 | 비밀번호 | 역할 |
|-----------|------|--------|----------|------|
| `2025_wk_admin` | 2025 WK리그 관리자 | admin@2025_wk.com | `admin123` | 토너먼트 관리자 |
| `2025_wk_recorder` | 2025 WK리그 기록원 | recorder@2025_wk.com | `recorder123` | 경기 기록원 |

## 📝 사용 안내

### 개발 환경에서 로그인 테스트
**로그인 방법**: 사용자 ID (위 표의 첫 번째 컬럼) + 비밀번호

**예시:**
- 슈퍼 관리자: `superadmin` / `development123`
- 클럽 관리자: `club_1_admin` / `admin123`
- 토너먼트 관리자: `2025_wk_admin` / `admin123`

**역할별 권한:**
1. **슈퍼 관리자**: 전체 시스템 관리 및 설정
2. **클럽 관리자**: 해당 클럽의 선수, 경기 관리
3. **조직 관리자**: 연맹 차원의 토너먼트, 정책 관리
4. **토너먼트 관리자**: 특정 대회의 운영 및 관리
5. **기록원**: 경기 중 실시간 스코어 입력 및 통계 기록

### 보안 주의사항
- ⚠️ **개발 환경 전용**: 이 계정들은 개발/테스트 목적으로만 사용
- ⚠️ **운영 환경 금지**: 실제 운영 환경에서는 절대 사용하지 말 것
- ⚠️ **비밀번호 변경**: 운영 환경 배포 시 모든 더미 계정 삭제 또는 비밀번호 변경 필수

### 데이터베이스 정리
```sql
-- 더미 사용자 모두 삭제 (슈퍼어드민 제외)
DELETE FROM users WHERE user_id != 'superadmin';

-- 또는 시더 롤백으로 정리
npx sequelize-cli db:seed:undo --seed create-dummy-admins.js
npx sequelize-cli db:seed:undo --seed add-sangbong-club.js
```

---
**마지막 업데이트**: 2025-09-22
**생성된 더미 계정 수**: 총 14개 (슈퍼어드민 1 + 클럽관리자 11 + 토너먼트 관련 2)