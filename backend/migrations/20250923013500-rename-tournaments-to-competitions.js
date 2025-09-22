'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('🏆 Tournament를 Competition으로 리네이밍 및 구조 개선...');

      // 1. competitions 테이블 생성 (향상된 구조)
      await queryInterface.createTable('competitions', {
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
        competition_type: {
          type: Sequelize.ENUM('league', 'tournament', 'cup'),
          allowNull: false,
          comment: 'league: 리그전, tournament: 토너먼트, cup: 컵대회'
        },
        format: {
          type: Sequelize.ENUM('round_robin', 'knockout', 'mixed', 'group_knockout'),
          allowNull: false,
          defaultValue: 'knockout',
          comment: 'round_robin: 총당리그, knockout: 토너먼트, mixed: 혼합형, group_knockout: 조별예선+결승토너먼트'
        },
        has_group_stage: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: '조별 예선 여부'
        },
        group_stage_format: {
          type: Sequelize.ENUM('round_robin', 'single_elimination'),
          allowNull: true,
          comment: '조별 예선 방식 (has_group_stage=true일 때)'
        },
        knockout_stage_format: {
          type: Sequelize.ENUM('single_elimination', 'double_elimination'),
          allowNull: true,
          comment: '결승 토너먼트 방식'
        },
        level: {
          type: Sequelize.ENUM('local', 'regional', 'national', 'international'),
          allowNull: false,
          defaultValue: 'local'
        },
        season: {
          type: Sequelize.STRING,
          allowNull: true,
          comment: '시즌 정보 (예: 2025, 2025-Spring, 2025-1차)'
        },
        start_date: {
          type: Sequelize.DATE,
          allowNull: true
        },
        end_date: {
          type: Sequelize.DATE,
          allowNull: true
        },
        registration_start: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: '참가 신청 시작일'
        },
        registration_end: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: '참가 신청 마감일'
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        rules: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: '대회 규정 및 규칙'
        },
        max_participants: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        min_participants: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 2
        },
        entry_fee: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true
        },
        prize_description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        venue_info: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: '경기장 정보 및 안내사항'
        },
        is_public: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        status: {
          type: Sequelize.ENUM('draft', 'open_registration', 'registration_closed', 'in_progress', 'completed', 'cancelled'),
          allowNull: false,
          defaultValue: 'draft',
          comment: 'draft: 초안, open_registration: 신청중, registration_closed: 신청마감, in_progress: 진행중, completed: 완료, cancelled: 취소'
        },
        organization_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'organizations',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
          comment: '주최 조직'
        },
        admin_user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
          comment: '대회 관리자'
        },
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
          comment: '대회 생성자'
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW
        }
      }, { transaction });

      // 2. 기존 tournaments 데이터를 competitions로 이전
      const tournaments = await queryInterface.sequelize.query(
        'SELECT * FROM tournaments ORDER BY id',
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );

      if (tournaments.length > 0) {
        const competitionsData = tournaments.map(tournament => ({
          id: tournament.id,
          name: tournament.name,
          competition_type: tournament.tournament_type, // league, tournament
          format: tournament.format,
          has_group_stage: tournament.has_group_stage,
          group_stage_format: tournament.has_group_stage ? 'round_robin' : null,
          knockout_stage_format: tournament.format === 'knockout' ? 'single_elimination' : null,
          level: tournament.level,
          season: '2025', // 기본값
          start_date: tournament.start_date,
          end_date: tournament.end_date,
          registration_start: null,
          registration_end: null,
          description: tournament.description,
          rules: tournament.rules,
          max_participants: tournament.max_participants,
          min_participants: 2,
          entry_fee: tournament.entry_fee,
          prize_description: tournament.prize_description,
          venue_info: null,
          is_public: tournament.is_public,
          status: tournament.status === 'open' ? 'open_registration' :
                  tournament.status === 'closed' ? 'registration_closed' : tournament.status,
          organization_id: tournament.organization_id,
          admin_user_id: tournament.admin_user_id,
          created_by: tournament.admin_user_id, // 기존 admin을 creator로 설정
          createdAt: tournament.createdAt,
          updatedAt: tournament.updatedAt
        }));

        await queryInterface.bulkInsert('competitions', competitionsData, { transaction });
        console.log(`✅ ${tournaments.length}개 토너먼트를 competitions로 이전 완료`);
      }

      // 3. matches 테이블의 foreign key 제약조건 제거
      await queryInterface.removeConstraint('matches', 'matches_tournament_id_fkey', { transaction });

      // 4. matches 테이블의 tournament_id를 competition_id로 변경
      await queryInterface.renameColumn('matches', 'tournament_id', 'competition_id', { transaction });

      // 5. matches 테이블에 새로운 foreign key 제약조건 추가
      await queryInterface.addConstraint('matches', {
        fields: ['competition_id'],
        type: 'foreign key',
        name: 'matches_competition_id_fkey',
        references: {
          table: 'competitions',
          field: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        transaction
      });

      // 6. user_roles 테이블 업데이트 (tournament_admin -> competition_admin)
      await queryInterface.sequelize.query(`
        ALTER TABLE user_roles ALTER COLUMN role_type DROP DEFAULT;
        DROP TYPE IF EXISTS "enum_user_roles_role_type_new";
        CREATE TYPE "enum_user_roles_role_type_new" AS ENUM('competition_admin', 'organization_admin', 'club_admin', 'federation_admin');
        ALTER TABLE user_roles ALTER COLUMN role_type TYPE "enum_user_roles_role_type_new" USING
          CASE
            WHEN role_type = 'tournament_admin' THEN 'competition_admin'::enum_user_roles_role_type_new
            ELSE role_type::text::enum_user_roles_role_type_new
          END;
        DROP TYPE IF EXISTS "enum_user_roles_role_type";
        ALTER TYPE "enum_user_roles_role_type_new" RENAME TO "enum_user_roles_role_type";
      `, { transaction });

      // 7. 인덱스 추가
      await queryInterface.addIndex('competitions', ['competition_type'], { transaction });
      await queryInterface.addIndex('competitions', ['format'], { transaction });
      await queryInterface.addIndex('competitions', ['status'], { transaction });
      await queryInterface.addIndex('competitions', ['season'], { transaction });
      await queryInterface.addIndex('competitions', ['level'], { transaction });
      await queryInterface.addIndex('competitions', ['admin_user_id'], { transaction });
      await queryInterface.addIndex('competitions', ['created_by'], { transaction });
      await queryInterface.addIndex('matches', ['competition_id'], { transaction });

      // 8. 기존 tournaments 테이블 삭제
      await queryInterface.dropTable('tournaments', { transaction });

      await transaction.commit();
      console.log('🎉 Competition 구조 개선 완료!');

    } catch (error) {
      await transaction.rollback();
      console.error('❌ Competition 구조 개선 실패:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // 역순으로 복원
      await queryInterface.createTable('tournaments', {
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
        tournament_type: {
          type: Sequelize.ENUM('league', 'tournament'),
          allowNull: false
        },
        format: {
          type: Sequelize.ENUM('round_robin', 'knockout', 'mixed'),
          allowNull: false,
          defaultValue: 'knockout'
        },
        has_group_stage: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        level: {
          type: Sequelize.ENUM('local', 'national', 'international'),
          allowNull: false,
          defaultValue: 'local'
        },
        start_date: {
          type: Sequelize.DATE,
          allowNull: true
        },
        end_date: {
          type: Sequelize.DATE,
          allowNull: true
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        max_participants: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        entry_fee: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true
        },
        prize_description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        rules: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        is_public: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        status: {
          type: Sequelize.ENUM('draft', 'open', 'closed', 'in_progress', 'completed', 'cancelled'),
          allowNull: false,
          defaultValue: 'draft'
        },
        organization_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'organizations',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        admin_user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW
        }
      }, { transaction });

      // 데이터 복원
      const competitions = await queryInterface.sequelize.query(
        'SELECT * FROM competitions ORDER BY id',
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );

      if (competitions.length > 0) {
        const tournamentsData = competitions.map(comp => ({
          id: comp.id,
          name: comp.name,
          tournament_type: comp.competition_type === 'cup' ? 'tournament' : comp.competition_type,
          format: comp.format === 'group_knockout' ? 'mixed' : comp.format,
          has_group_stage: comp.has_group_stage,
          level: comp.level === 'regional' ? 'local' : comp.level,
          start_date: comp.start_date,
          end_date: comp.end_date,
          description: comp.description,
          max_participants: comp.max_participants,
          entry_fee: comp.entry_fee,
          prize_description: comp.prize_description,
          rules: comp.rules,
          is_public: comp.is_public,
          status: comp.status === 'open_registration' ? 'open' :
                  comp.status === 'registration_closed' ? 'closed' : comp.status,
          organization_id: comp.organization_id,
          admin_user_id: comp.admin_user_id,
          createdAt: comp.createdAt,
          updatedAt: comp.updatedAt
        }));

        await queryInterface.bulkInsert('tournaments', tournamentsData, { transaction });
      }

      await queryInterface.renameColumn('matches', 'competition_id', 'tournament_id', { transaction });

      // user_roles enum 복원
      await queryInterface.sequelize.query(`
        ALTER TABLE user_roles ALTER COLUMN role_type DROP DEFAULT;
        DROP TYPE IF EXISTS "enum_user_roles_role_type_old";
        CREATE TYPE "enum_user_roles_role_type_old" AS ENUM('tournament_admin', 'organization_admin');
        ALTER TABLE user_roles ALTER COLUMN role_type TYPE "enum_user_roles_role_type_old" USING
          CASE
            WHEN role_type = 'competition_admin' THEN 'tournament_admin'::enum_user_roles_role_type_old
            ELSE role_type::text::enum_user_roles_role_type_old
          END;
        DROP TYPE IF EXISTS "enum_user_roles_role_type";
        ALTER TYPE "enum_user_roles_role_type_old" RENAME TO "enum_user_roles_role_type";
      `, { transaction });

      await queryInterface.dropTable('competitions', { transaction });

      await transaction.commit();
      console.log('🔄 Tournament 구조로 롤백 완료');

    } catch (error) {
      await transaction.rollback();
      console.error('❌ 롤백 실패:', error);
      throw error;
    }
  }
};