# 🏗️ ScoreBoard Migration Guide

이 문서는 ScoreBoard 프로젝트의 데이터베이스 마이그레이션 시스템 사용법을 안내합니다.

## 📋 Migration 시스템 개요

- **Production**: Migration만 사용 (자동 sync 비활성화)
- **Development**: Migration 파일이 있으면 Migration 우선, 없으면 sync 사용
- **Migration Tool**: Umzug를 사용한 자동 migration 실행

## 🚀 Migration 명령어

### 기본 명령어
```bash
# 모든 pending migration 실행
npm run migrate

# 마지막 migration 되돌리기
npm run migrate:undo

# 모든 migration 리셋 후 재실행
npm run migrate:reset

# Migration 상태 확인
npm run migrate:status

# 새 migration 파일 생성
npm run migrate:create <migration-name>
```

### CLI 도구 사용
```bash
# Migration CLI 도구 사용
node scripts/migrate.js <command>

# 사용 가능한 명령어 보기
node scripts/migrate.js

# 새 migration 생성
node scripts/migrate.js create add-user-profile

# Migration 실행
node scripts/migrate.js up

# Migration 상태 확인
node scripts/migrate.js status
```

## 📝 Migration 파일 작성 가이드

### 기본 구조
```javascript
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 스키마 변경 작업 (예: 테이블 생성, 컬럼 추가)
    await queryInterface.createTable('TableName', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    // 롤백 작업 (up의 반대 작업)
    await queryInterface.dropTable('TableName');
  }
};
```

### 컬럼 추가 예시
```javascript
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'profileImage', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'profileImage');
  }
};
```

### 인덱스 추가 예시
```javascript
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('Users', ['email'], {
      unique: true,
      name: 'unique_user_email'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Users', 'unique_user_email');
  }
};
```

## 🛡️ Migration 베스트 프랙티스

### 1. 안전한 Migration 작성
- **항상 롤백 가능하도록** `down` 메서드 구현
- **데이터 손실 방지**를 위해 컬럼 삭제 전 백업
- **트랜잭션 사용**으로 원자성 보장

### 2. Migration 파일 네이밍
```bash
# 좋은 예시
20250922123000-add-user-profile-table.js
20250922123001-add-email-index-to-users.js
20250922123002-update-match-status-enum.js

# 나쁜 예시
migration1.js
update.js
fix.js
```

### 3. 순서 관리
- Migration 파일명의 타임스탬프로 **실행 순서 결정**
- **의존성이 있는 변경사항**은 올바른 순서로 생성
- **브랜치 병합 시** 타임스탬프 충돌 주의

## 🔧 개발 워크플로우

### 1. 새 기능 개발 시
```bash
# 1. 새 migration 생성
npm run migrate:create add-tournament-brackets

# 2. Migration 파일 편집
# migrations/20250922123000-add-tournament-brackets.js

# 3. Migration 실행 및 테스트
npm run migrate

# 4. 문제 발생 시 롤백
npm run migrate:undo

# 5. 수정 후 재실행
npm run migrate
```

### 2. 프로덕션 배포 시
```bash
# 1. Migration 상태 확인
npm run migrate:status

# 2. Migration 실행
npm run migrate

# 3. 서버 시작 (자동으로 migration 실행됨)
npm start
```

## 🚨 트러블슈팅

### Migration 실행 실패
```bash
# 1. 현재 상태 확인
npm run migrate:status

# 2. 마지막 migration 롤백
npm run migrate:undo

# 3. Migration 파일 수정 후 재실행
npm run migrate
```

### 개발 환경 리셋
```bash
# 전체 migration 리셋
npm run migrate:reset

# 또는 데이터베이스 완전 리셋
npm run db:reset
```

### Production 환경 문제
- **절대 sync 사용 금지** - Migration만 사용
- **롤백 계획** 미리 수립
- **백업** 후 migration 실행

## 📊 Migration 상태 모니터링

서버 시작 시 자동으로 migration 상태를 확인하고 실행합니다:

```bash
# 개발환경
🔄 No migrations found - using model sync for development
# 또는
📋 Migrations detected - running migrations instead of sync

# 프로덕션환경
🏭 Production mode - using migrations only
📋 Running pending migrations...
✅ Applied 2 migrations: [migration1, migration2]
```

---

💡 **팁**: Migration은 데이터베이스 스키마 변경의 **버전 관리**입니다. 코드와 마찬가지로 신중하게 관리하세요!