'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. 한국여자축구연맹 조직 생성
    // 1. 먼저 관리자 사용자 ID 가져오기
    const adminUser = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE user_id = 'club_9_admin'",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const adminUserId = adminUser[0].id;

    // 2. 조직 생성
    await queryInterface.bulkInsert('organizations', [
      {
        name: '한국여자축구연맹',
        description: '대한민국 여자축구를 총괄하는 연맹 기관',
        founded_year: 1988,
        location: '서울특별시',
        contact_email: 'info@kwff.or.kr',
        contact_phone: '02-2002-0000',
        website: 'https://kwff.or.kr',
        logo_url: null,
        is_active: true,
        created_by: adminUserId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // 3. 클럽 생성
    await queryInterface.bulkInsert('clubs', [
      {
        name: '수원FC위민',
        club_type: 'pro',
        description: 'WK리그 프로 여자축구팀',
        founded_year: 2009,
        location: '경기도 수원시',
        contact_email: 'info@suwonfc.com',
        contact_phone: '031-259-2000',
        logo_url: null,
        is_active: true,
        created_by: adminUserId,
        createdAt: new Date(),
        updatedAt: new Date()
      }

,
      {
        name: '세종스포츠토토여자축구단',
        club_type: 'pro',
        description: 'WK리그 프로 여자축구팀',
        founded_year: 2018,
        location: '세종특별자치시',
        contact_email: 'info@sejongfc.com',
        contact_phone: '044-864-1000',
        logo_url: null,
        is_active: true,
        created_by: adminUserId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        club_id: 'incheon-hyundai-steel',
        name: '인천현대제철',
        club_type: 'professional',
        description: 'WK리그 프로 여자축구팀',
        founded_year: 2010,
        location: '인천광역시',
        contact_email: 'info@hyundai-steel.com',
        contact_phone: '032-870-3000',
        website: 'https://hyundai-steel.com',
        logo_url: null,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        club_id: 'mungyeong-sangmu',
        name: '상무여자축구단',
        club_type: 'professional',
        description: 'WK리그 프로 여자축구팀',
        founded_year: 2003,
        location: '경상북도 문경시',
        contact_email: 'info@sangmufc.com',
        contact_phone: '054-550-6000',
        website: 'https://sangmufc.com',
        logo_url: null,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        club_id: 'hwacheon-kspo',
        name: '화천 KSPO 여자축구단',
        club_type: 'professional',
        description: 'WK리그 프로 여자축구팀',
        founded_year: 2019,
        location: '강원도 화천군',
        contact_email: 'info@kspo.or.kr',
        contact_phone: '033-460-8114',
        website: 'https://kspo.or.kr',
        logo_url: null,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        club_id: 'changnyeong-wfc',
        name: '경남창녕WFC',
        club_type: 'professional',
        description: 'WK리그 프로 여자축구팀',
        founded_year: 2021,
        location: '경상남도 창녕군',
        contact_email: 'info@changnyeongwfc.com',
        contact_phone: '055-530-1000',
        website: 'https://changnyeongwfc.com',
        logo_url: null,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        club_id: 'gyeongju-khnp',
        name: '경주한수원WFC',
        club_type: 'professional',
        description: 'WK리그 프로 여자축구팀',
        founded_year: 2015,
        location: '경상북도 경주시',
        contact_email: 'info@khnp.co.kr',
        contact_phone: '054-704-1000',
        website: 'https://khnp.co.kr',
        logo_url: null,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        club_id: 'seoul-city-hall',
        name: '서울시청',
        club_type: 'professional',
        description: 'WK리그 프로 여자축구팀',
        founded_year: 1996,
        location: '서울특별시',
        contact_email: 'info@seoul.go.kr',
        contact_phone: '02-120',
        website: 'https://seoul.go.kr',
        logo_url: null,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // 3. 아마추어 클럽 2개 추가
    await queryInterface.bulkInsert('clubs', [
      {
        club_id: 'sangbong-early-birds',
        name: '상봉조기축구회',
        club_type: 'amateur',
        description: '상봉지역 조기축구 동호회',
        founded_year: 2015,
        location: '서울시 중랑구 상봉동',
        contact_email: 'sangbong@gmail.com',
        contact_phone: '02-495-0000',
        website: null,
        logo_url: null,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        club_id: 'gangnam-sunday-fc',
        name: '강남썬데이FC',
        club_type: 'amateur',
        description: '강남지역 일요일 축구 동호회',
        founded_year: 2018,
        location: '서울시 강남구',
        contact_email: 'gangnamsunday@gmail.com',
        contact_phone: '02-555-1234',
        website: null,
        logo_url: null,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('clubs', null, {});
  }
};