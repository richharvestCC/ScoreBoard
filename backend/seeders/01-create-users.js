'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const saltRounds = 12;

    // 더미 사용자들 생성
    const users = [
      // 슈퍼 관리자
      {
        user_id: 'superadmin',
        email: 'admin@scoreboard.com',
        password_hash: await bcrypt.hash('development123', saltRounds),
        name: 'Super Admin',
        role: 'admin',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 클럽 관리자들 (WK리그 프로팀)
      {
        user_id: 'club_1_admin',
        email: 'admin1@fc.com',
        password_hash: await bcrypt.hash('admin123', saltRounds),
        name: '수원FC위민 관리자',
        role: 'club_admin',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 'club_2_admin',
        email: 'admin2@club2.com',
        password_hash: await bcrypt.hash('admin123', saltRounds),
        name: '세종스포츠토토 관리자',
        role: 'club_admin',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 'club_3_admin',
        email: 'admin3@club3.com',
        password_hash: await bcrypt.hash('admin123', saltRounds),
        name: '인천현대제철 관리자',
        role: 'club_admin',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 'club_4_admin',
        email: 'admin4@club4.com',
        password_hash: await bcrypt.hash('admin123', saltRounds),
        name: '상무여자축구단 관리자',
        role: 'club_admin',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 'club_5_admin',
        email: 'admin5@kspo.com',
        password_hash: await bcrypt.hash('admin123', saltRounds),
        name: '화천KSPO 관리자',
        role: 'club_admin',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 조직 관리자
      {
        user_id: 'club_9_admin',
        email: 'admin9@club9.com',
        password_hash: await bcrypt.hash('admin123', saltRounds),
        name: '한국여자축구연맹 관리자',
        role: 'org_admin',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 일반 클럽 관리자
      {
        user_id: 'sangbong_admin',
        email: 'admin@sangbong.com',
        password_hash: await bcrypt.hash('admin123', saltRounds),
        name: '상봉조기축구회 관리자',
        role: 'club_admin',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 토너먼트 관리자
      {
        user_id: '2025_wk_admin',
        email: 'admin@2025_wk.com',
        password_hash: await bcrypt.hash('admin123', saltRounds),
        name: '2025 WK리그 관리자',
        role: 'tournament_admin',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 기록원
      {
        user_id: '2025_wk_recorder',
        email: 'recorder@2025_wk.com',
        password_hash: await bcrypt.hash('recorder123', saltRounds),
        name: '2025 WK리그 기록원',
        role: 'recorder',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('users', users, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};