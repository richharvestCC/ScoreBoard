const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('🏛️ Starting WK League complete setup...');

      // 1. 슈퍼 어드민 사용자 생성 (실제 사용자)
      const [superAdminUser] = await queryInterface.bulkInsert('users', [{
        user_id: 'superadmin',
        name: 'Super Admin',
        email: 'admin@scoreboard.com',
        password_hash: '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // 실제 해시로 교체 필요
        createdAt: new Date(),
        updatedAt: new Date()
      }], { returning: true, transaction });

      console.log('✅ Super admin user created');

      // 2. 한국여자축구연맹 조직 생성 (추후 Organization 모델 구현 시)
      // const [organization] = await queryInterface.bulkInsert('organizations', [{
      //   name: '한국여자축구연맹',
      //   type: 'federation',
      //   created_at: new Date(),
      //   updated_at: new Date()
      // }], { returning: true, transaction });

      // 3. WK리그 토너먼트 생성
      const [wkTournament] = await queryInterface.bulkInsert('tournaments', [{
        name: '2025 WK리그',
        tournament_type: 'league',
        format: 'round_robin',
        has_group_stage: false,
        level: 'national',
        start_date: new Date('2025-03-01'),
        end_date: new Date('2025-11-30'),
        description: '한국여자축구연맹이 주관하는 2025년 WK리그 (여자축구 프로리그)',
        max_participants: 8,
        is_public: true,
        status: 'in_progress',
        admin_user_id: superAdminUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }], { returning: true, transaction });

      console.log('🏆 WK League tournament created');

      // 4. CSV에서 팀 정보 추출 및 Club 생성
      const csvPath = path.join(__dirname, '../../data/wkl.csv');
      const teams = new Set();
      const teamIds = new Map();

      // CSV 파일 읽기 및 팀 정보 수집
      await new Promise((resolve, reject) => {
        fs.createReadStream(csvPath)
          .pipe(csv())
          .on('data', (row) => {
            // home_team과 away_team 정보 수집
            if (row.home_team && row.home_id) {
              teams.add(JSON.stringify({
                name: row.home_team,
                id: row.home_id
              }));
            }
            if (row.away_team && row.away_id) {
              teams.add(JSON.stringify({
                name: row.away_team,
                id: row.away_id
              }));
            }
          })
          .on('end', resolve)
          .on('error', reject);
      });

      // 팀 데이터 생성
      const clubsData = Array.from(teams).map(teamStr => {
        const team = JSON.parse(teamStr);
        return {
          name: team.name,
          description: `WK리그 소속 ${team.name}`,
          location: '대한민국',
          founded_year: 2000,
          is_active: true,
          created_by: superAdminUser.id,
          created_at: new Date(),
          updated_at: new Date()
        };
      });

      const insertedClubs = await queryInterface.bulkInsert('clubs', clubsData, {
        returning: true,
        transaction
      });

      // 팀 ID 매핑 생성
      insertedClubs.forEach((club, index) => {
        const teamData = JSON.parse(Array.from(teams)[index]);
        teamIds.set(teamData.id, club.id);
      });

      console.log(`⚽ ${insertedClubs.length} clubs created`);

      // 5. 더미 관리자 사용자들 생성
      const dummyUsers = [];

      // 한국여자축구연맹 관리자
      dummyUsers.push({
        user_id: 'kwfa_admin',
        name: '한국여자축구연맹 관리자',
        email: 'admin@kwfa.or.kr',
        password_hash: '$2a$10$dummy_hash_federation_admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // WK리그 대회 관리자
      dummyUsers.push({
        user_id: 'wk_league_admin',
        name: 'WK리그 대회 관리자',
        email: 'admin@wkleague.com',
        password_hash: '$2a$10$dummy_hash_tournament_admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // 각 클럽별 관리자 생성
      for (const club of insertedClubs) {
        const clubSlug = club.name.replace(/\s+/g, '_').toLowerCase();
        dummyUsers.push({
          user_id: `${clubSlug}_admin`,
          name: `${club.name} 관리자`,
          email: `admin@${clubSlug}.com`,
          password_hash: '$2a$10$dummy_hash_club_admin',
          createdAt: new Date(),
          updatedAt: new Date()
        });

        // 각 클럽별 경기 기록원
        dummyUsers.push({
          user_id: `${clubSlug}_recorder`,
          name: `${club.name} 기록원`,
          email: `recorder@${clubSlug}.com`,
          password_hash: '$2a$10$dummy_hash_match_recorder',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      const insertedUsers = await queryInterface.bulkInsert('users', dummyUsers, {
        returning: true,
        transaction
      });

      console.log(`👥 ${insertedUsers.length} dummy users created`);

      // 6. 토너먼트 참가자 등록 (TournamentParticipant 테이블이 없어서 주석 처리)
      // const participantData = insertedClubs.map(club => ({
      //   tournament_id: wkTournament.id,
      //   club_id: club.id,
      //   registration_date: new Date('2025-02-01'),
      //   status: 'confirmed',
      //   created_at: new Date(),
      //   updated_at: new Date()
      // }));

      // await queryInterface.bulkInsert('tournament_participants', participantData, { transaction });

      console.log('🎫 Tournament participants registration skipped (table not exists)');

      // 7. CSV에서 매치 데이터 가져와서 Match 생성
      const matchesData = [];

      await new Promise((resolve, reject) => {
        fs.createReadStream(csvPath)
          .pipe(csv())
          .on('data', (row) => {
            const homeClubId = teamIds.get(row.home_id);
            const awayClubId = teamIds.get(row.away_id);

            if (homeClubId && awayClubId) {
              // match_date와 match_time 조합
              const matchDateTime = new Date(`${row.match_date}T${row.match_time}`);

              matchesData.push({
                home_club_id: homeClubId,
                away_club_id: awayClubId,
                match_type: 'league',
                match_date: matchDateTime,
                venue: row.venue || '미정',
                status: parseInt(row.home_points) >= 0 && parseInt(row.away_points) >= 0 ? 'completed' : 'scheduled',
                home_score: parseInt(row.home_points) || 0,
                away_score: parseInt(row.away_points) || 0,
                duration_minutes: 90,
                notes: row.notes || null,
                created_by: superAdminUser.id,
                tournament_id: wkTournament.id,
                stage: 'regular_season',
                round_number: parseInt(row.round) || 1,
                createdAt: new Date(row.created_at),
                updatedAt: new Date(row.updated_at)
              });
            }
          })
          .on('end', resolve)
          .on('error', reject);
      });

      const insertedMatches = await queryInterface.bulkInsert('matches', matchesData, {
        returning: true,
        transaction
      });

      console.log(`📊 ${insertedMatches.length} matches imported from CSV`);

      await transaction.commit();

      console.log('🎉 WK League setup completed successfully!');
      console.log(`
📋 결과 요약:
👤 슈퍼 어드민: 1명 생성
🏛️ 한국여자축구연맹 조직: 설정 완료 (Organization 모델 구현 대기)
🏆 WK리그 토너먼트: 1개 생성
⚽ 클럽: ${insertedClubs.length}개 생성
👥 더미 관리자: ${insertedUsers.length}명 생성
🎫 토너먼트 참가자: ${participantData.length}개 등록
📊 경기: ${insertedMatches.length}경기 완벽 이식
      `);

    } catch (error) {
      await transaction.rollback();
      console.error('❌ WK League setup failed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // 역순으로 데이터 삭제
      await queryInterface.bulkDelete('matches', { tournament_id: { [Sequelize.Op.ne]: null } }, { transaction });
      // await queryInterface.bulkDelete('tournament_participants', {}, { transaction });
      await queryInterface.bulkDelete('tournaments', { name: '2025 WK리그' }, { transaction });
      await queryInterface.bulkDelete('clubs', { description: { [Sequelize.Op.like]: 'WK리그 소속%' } }, { transaction });
      await queryInterface.bulkDelete('users', {
        user_id: { [Sequelize.Op.in]: ['superadmin', 'kwfa_admin', 'wk_league_admin'] }
      }, { transaction });

      await transaction.commit();
      console.log('🧹 WK League data cleaned up');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Cleanup failed:', error);
      throw error;
    }
  }
};