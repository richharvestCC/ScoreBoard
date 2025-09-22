module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('👥 Creating dummy administrators and recorders...');

      // 1. 모든 클럽/조직 조회
      const clubs = await queryInterface.sequelize.query(
        'SELECT id, name, club_type FROM clubs ORDER BY id',
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );

      // 2. 모든 토너먼트 조회
      const tournaments = await queryInterface.sequelize.query(
        'SELECT id, name FROM tournaments ORDER BY id',
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );

      const dummyUsers = [];

      // 3. 각 클럽/조직별 관리자 생성
      for (const club of clubs) {
        // club.id를 기반으로 유니크한 user_id 생성
        const userId = `club_${club.id}_admin`;
        let clubSlug = club.name.replace(/\s+/g, '_').toLowerCase().replace(/[^a-z0-9_]/g, '');

        // 빈 문자열이나 너무 짧은 경우 기본값 사용
        if (!clubSlug || clubSlug.length < 2) {
          clubSlug = `club${club.id}`;
        }

        const roleType = club.club_type === 'org' ? 'federation_admin' : 'club_admin';

        dummyUsers.push({
          user_id: userId,
          name: `${club.name} 관리자`,
          email: `admin${club.id}@${clubSlug.replace(/_/g, '')}.com`,
          password_hash: '$2a$10$dummy.hash.for.development.only',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // 4. 각 대회별 관리자 및 기록원 생성
      for (const tournament of tournaments) {
        const tournamentSlug = tournament.name.replace(/\s+/g, '_').toLowerCase().replace(/[^a-z0-9_]/g, '');

        // 대회 관리자
        dummyUsers.push({
          user_id: `${tournamentSlug}_admin`,
          name: `${tournament.name} 관리자`,
          email: `admin@${tournamentSlug}.com`,
          password_hash: '$2a$10$dummy.hash.for.development.only',
          createdAt: new Date(),
          updatedAt: new Date()
        });

        // 대회 기록원
        dummyUsers.push({
          user_id: `${tournamentSlug}_recorder`,
          name: `${tournament.name} 기록원`,
          email: `recorder@${tournamentSlug}.com`,
          password_hash: '$2a$10$dummy.hash.for.development.only',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // 5. 더미 사용자들 생성
      const insertedUsers = await queryInterface.bulkInsert('users', dummyUsers, {
        returning: true,
        transaction
      });

      console.log(`✅ Created ${insertedUsers.length} dummy users:`);
      console.log(`   🏛️ ${clubs.length} club/organization admins`);
      console.log(`   🏆 ${tournaments.length} tournament admins`);
      console.log(`   📝 ${tournaments.length} tournament recorders`);

      await transaction.commit();

    } catch (error) {
      await transaction.rollback();
      console.error('❌ Failed to create dummy users:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // 더미 사용자들 삭제 (superadmin 제외)
      await queryInterface.bulkDelete('users', {
        user_id: { [Sequelize.Op.ne]: 'superadmin' }
      }, { transaction });

      await transaction.commit();
      console.log('🧹 Dummy users cleaned up');
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};