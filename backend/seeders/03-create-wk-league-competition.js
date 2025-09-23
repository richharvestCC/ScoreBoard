'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 2025 WK리그 대회 생성
    await queryInterface.bulkInsert('competitions', [
      {
        competition_id: '2025_league_wk',
        name: '2025 WK리그',
        description: '2025년 한국여자축구 프로리그 정규 시즌',
        competition_type: 'league',
        format: 'round_robin',
        season: '2025',
        status: 'in_progress',
        start_date: '2025-03-01',
        end_date: '2025-11-30',
        max_participants: 8,
        entry_fee: null,
        prize_description: '우승팀: 5000만원, 준우승팀: 3000만원, 3위팀: 2000만원',
        rules: `2025 WK리그 경기 규정:
1. 참가팀: 8개 프로팀
2. 경기 방식: 홈앤어웨이 더블 라운드 로빈 (총 112경기)
3. 각 팀은 시즌 중 14경기 진행 (홈 7경기, 어웨이 7경기)
4. 승점: 승리 3점, 무승부 1점, 패배 0점
5. 최종 순위는 승점 > 골득실 > 다득점 > 상대전적 순으로 결정
6. 상위 4팀은 WK리그 챔피언십 플레이오프 진출`,
        location: '전국 각 팀 홈구장',
        organizer_id: 'korea-womens-football-federation',
        level: 'national',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // 참가팀 등록 (Competition Participants)
    const teams = [
      'suwon-fc-women',
      'sejong-sportstoto',
      'incheon-hyundai-steel',
      'mungyeong-sangmu',
      'hwacheon-kspo',
      'changnyeong-wfc',
      'gyeongju-khnp',
      'seoul-city-hall'
    ];

    const participants = teams.map((team_id, index) => ({
      competition_id: '2025_league_wk',
      club_id: team_id,
      registration_date: '2025-02-01',
      status: 'confirmed',
      seed_number: index + 1,
      group_name: null, // 리그전이므로 그룹 없음
      created_at: new Date(),
      updated_at: new Date()
    }));

    await queryInterface.bulkInsert('competition_participants', participants);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('competition_participants', { competition_id: '2025_league_wk' });
    await queryInterface.bulkDelete('competitions', { competition_id: '2025_league_wk' });
  }
};