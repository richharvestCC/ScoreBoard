module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('⚽ 상봉조기축구회 일반 클럽 추가...');

      // 기존 슈퍼 관리자 조회
      const [superAdmin] = await queryInterface.sequelize.query(
        'SELECT id FROM users WHERE user_id = $1',
        {
          bind: ['superadmin'],
          type: Sequelize.QueryTypes.SELECT,
          transaction
        }
      );

      if (!superAdmin) {
        throw new Error('슈퍼 관리자를 찾을 수 없습니다');
      }

      // 상봉조기축구회 클럽 생성 (일반 클럽이므로 club_type 기본값 사용)
      const [sangbongClub] = await queryInterface.bulkInsert('clubs', [{
        name: '상봉조기축구회',
        description: '서울 상봉동 지역 아마추어 축구클럽',
        location: '서울특별시 중랑구 상봉동',
        founded_year: 2010,
        is_active: true,
        created_by: superAdmin.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }], { returning: true, transaction });

      console.log('✅ 상봉조기축구회 클럽 생성됨');

      // 상봉조기축구회 관리자 생성
      await queryInterface.bulkInsert('users', [{
        user_id: 'sangbong_admin',
        name: '상봉조기축구회 관리자',
        email: 'admin@sangbong.com',
        password_hash: '$2a$10$dummy.hash.for.development.only',
        createdAt: new Date(),
        updatedAt: new Date()
      }], { transaction });

      console.log('✅ 상봉조기축구회 관리자 생성됨');

      await transaction.commit();

      console.log(`
🎉 상봉조기축구회 클럽 설정 완료!
- ⚽ 클럽: 상봉조기축구회 (일반 아마추어 클럽)
- 👤 관리자: sangbong_admin
      `);

    } catch (error) {
      await transaction.rollback();
      console.error('❌ 상봉조기축구회 클럽 생성 실패:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.bulkDelete('users', { user_id: 'sangbong_admin' }, { transaction });
      await queryInterface.bulkDelete('clubs', { name: '상봉조기축구회' }, { transaction });

      await transaction.commit();
      console.log('🧹 상봉조기축구회 데이터 정리 완료');
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};