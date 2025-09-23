const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('🏛️ Starting WK League setup...');

      // 1. 슈퍼 어드민 사용자 생성
      const [superAdminUser] = await queryInterface.bulkInsert('users', [{
        user_id: 'superadmin',
        name: 'Super Admin',
        email: 'admin@scoreboard.com',
        password_hash: '$2a$10$example.hash.for.development',
        createdAt: new Date(),
        updatedAt: new Date()
      }], { returning: true, transaction });

      console.log('✅ Super admin created');

      // 2. WK리그 토너먼트 생성
      const [wkTournament] = await queryInterface.bulkInsert('tournaments', [{
        name: '2025 WK리그',
        tournament_type: 'league',
        format: 'round_robin',
        has_group_stage: false,
        level: 'national',
        start_date: new Date('2025-03-01'),
        end_date: new Date('2025-11-30'),
        description: '한국여자축구연맹이 주관하는 2025년 WK리그',
        max_participants: 8,
        is_public: true,
        status: 'in_progress',
        admin_user_id: superAdminUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }], { returning: true, transaction });

      console.log('🏆 Tournament created');

      // 3. CSV에서 클럽 정보 추출
      const csvPath = path.join(__dirname, '../../data/wkl.csv');
      const teams = new Set();

      await new Promise((resolve, reject) => {
        fs.createReadStream(csvPath)
          .pipe(csv())
          .on('data', (row) => {
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

      // 4. 클럽 생성
      const clubsData = Array.from(teams).map(teamStr => {
        const team = JSON.parse(teamStr);
        return {
          name: team.name,
          description: `WK리그 소속 ${team.name}`,
          location: '대한민국',
          founded_year: 2000,
          is_active: true,
          created_by: superAdminUser.id,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      });

      const insertedClubs = await queryInterface.bulkInsert('clubs', clubsData, {
        returning: true,
        transaction
      });

      console.log(`⚽ ${insertedClubs.length} clubs created`);

      // 5. CSV ID와 DB ID 매핑
      const teamIdMap = new Map();
      insertedClubs.forEach((club, index) => {
        const teamData = JSON.parse(Array.from(teams)[index]);
        teamIdMap.set(teamData.id, club.id);
      });

      // 6. 매치 데이터 생성
      const matchesData = [];

      await new Promise((resolve, reject) => {
        fs.createReadStream(csvPath)
          .pipe(csv())
          .on('data', (row) => {
            const homeClubId = teamIdMap.get(row.home_id);
            const awayClubId = teamIdMap.get(row.away_id);

            if (homeClubId && awayClubId) {
              const matchDateTime = new Date(`${row.match_date}T${row.match_time}`);

              matchesData.push({
                home_club_id: homeClubId,
                away_club_id: awayClubId,
                match_type: 'league',
                match_date: matchDateTime,
                venue: row.venue || '미정',
                status: (parseInt(row.home_points) >= 0 && parseInt(row.away_points) >= 0) ? 'completed' : 'scheduled',
                home_score: parseInt(row.home_points) || 0,
                away_score: parseInt(row.away_points) || 0,
                duration_minutes: 90,
                notes: row.notes || null,
                created_by: superAdminUser.id,
                tournament_id: wkTournament.id,
                stage: 'regular_season',
                round_number: parseInt(row.round) || 1,
                createdAt: new Date(row.created_at || new Date()),
                updatedAt: new Date(row.updated_at || new Date())
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

      console.log(`📊 ${insertedMatches.length} matches imported`);

      await transaction.commit();

      console.log(`
🎉 WK League setup completed!
- 👤 1 admin user
- 🏆 1 tournament
- ⚽ ${insertedClubs.length} clubs
- 📊 ${insertedMatches.length} matches
      `);

    } catch (error) {
      await transaction.rollback();
      console.error('❌ Setup failed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.bulkDelete('matches', { tournament_id: { [Sequelize.Op.ne]: null } }, { transaction });
      await queryInterface.bulkDelete('tournaments', { name: '2025 WK리그' }, { transaction });
      await queryInterface.bulkDelete('clubs', { description: { [Sequelize.Op.like]: 'WK리그 소속%' } }, { transaction });
      await queryInterface.bulkDelete('users', { user_id: 'superadmin' }, { transaction });

      await transaction.commit();
      console.log('🧹 Cleanup completed');
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};