module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('🏆 대회 템플릿 시스템 구현...');

      // 슈퍼 관리자 조회
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

      // 1. 리그 템플릿 (총당리그)
      const leagueTemplate = {
        name: '리그 템플릿',
        competition_type: 'league',
        format: 'round_robin',
        has_group_stage: false,
        group_stage_format: null,
        knockout_stage_format: null,
        level: 'local',
        season: 'template',
        start_date: null,
        end_date: null,
        registration_start: null,
        registration_end: null,
        description: '총당리그 방식의 대회 템플릿입니다. 모든 팀이 서로 경기를 치르며 승점으로 순위를 결정합니다.',
        rules: `
# 리그 규정

## 경기 방식
- 총당리그 (Round Robin) 방식
- 모든 팀이 서로 1경기씩 실시
- 승점제: 승리 3점, 무승부 1점, 패배 0점

## 순위 결정
1. 승점
2. 득실차
3. 다득점
4. 상대전적
5. 추첨

## 경기 시간
- 경기시간: 90분 (전후반 각 45분)
- 하프타임: 15분
- 추가시간: 주심 재량

## 선수 교체
- 최대 5명 교체 가능
- 교체 창구는 3회로 제한
        `,
        max_participants: 16,
        min_participants: 4,
        entry_fee: null,
        prize_description: '1위: 우승 트로피 및 메달\n2위: 준우승 메달\n3위: 3위 메달',
        venue_info: '경기장 정보는 대회 개설 시 입력하세요.',
        is_public: true,
        status: 'draft',
        organization_id: null,
        admin_user_id: superAdmin.id,
        created_by: superAdmin.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 2. 토너먼트 템플릿 (단순 토너먼트)
      const tournamentTemplate = {
        name: '토너먼트 템플릿',
        competition_type: 'tournament',
        format: 'knockout',
        has_group_stage: false,
        group_stage_format: null,
        knockout_stage_format: 'single_elimination',
        level: 'local',
        season: 'template',
        start_date: null,
        end_date: null,
        registration_start: null,
        registration_end: null,
        description: '단일 토너먼트 방식의 대회 템플릿입니다. 패배하면 탈락하는 토너먼트 형태입니다.',
        rules: `
# 토너먼트 규정

## 경기 방식
- 단일 토너먼트 (Single Elimination)
- 패배 시 즉시 탈락
- 승부가 나지 않을 경우 연장전 및 승부차기

## 연장전 및 승부차기
- 90분 동점 시 연장전 30분 (전후반 각 15분)
- 연장전에도 동점 시 승부차기
- 승부차기: 각 팀 5명씩 → 서든데스

## 대진표
- 토너먼트 대진은 추첨으로 결정
- 부전승(bye)은 1라운드에만 적용
- 시드 배정은 대회 운영진 재량

## 선수 교체
- 최대 5명 교체 가능
- 교체 창구는 3회로 제한
- 연장전 시 추가 교체 1명 가능
        `,
        max_participants: 32,
        min_participants: 4,
        entry_fee: null,
        prize_description: '우승: 우승 트로피 및 메달\n준우승: 준우승 메달\n4강: 4강 메달',
        venue_info: '경기장 정보는 대회 개설 시 입력하세요.',
        is_public: true,
        status: 'draft',
        organization_id: null,
        admin_user_id: superAdmin.id,
        created_by: superAdmin.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 3. 조별예선+결승토너먼트 템플릿 (혼합형)
      const groupKnockoutTemplate = {
        name: '조별예선+결승토너먼트 템플릿',
        competition_type: 'tournament',
        format: 'group_knockout',
        has_group_stage: true,
        group_stage_format: 'round_robin',
        knockout_stage_format: 'single_elimination',
        level: 'local',
        season: 'template',
        start_date: null,
        end_date: null,
        registration_start: null,
        registration_end: null,
        description: '조별예선 후 결승토너먼트를 진행하는 혼합형 대회 템플릿입니다. 월드컵과 같은 방식입니다.',
        rules: `
# 조별예선+결승토너먼트 규정

## 1단계: 조별예선
- 조별 총당리그 방식
- 각 조 상위 2팀이 결승토너먼트 진출
- 승점제: 승리 3점, 무승부 1점, 패배 0점

### 조별 순위 결정
1. 승점
2. 득실차
3. 다득점
4. 상대전적
5. 추첨

## 2단계: 결승토너먼트
- 단일 토너먼트 (Single Elimination)
- 16강부터 시작 (조별 1,2위가 진출)
- 90분 동점 시 연장전 및 승부차기

## 대진 방식
- A조 1위 vs B조 2위
- B조 1위 vs A조 2위
- (이하 동일한 방식으로 대진 구성)

## 선수 교체
- 조별예선: 최대 5명 교체 (3회 창구)
- 결승토너먼트: 최대 5명 교체 + 연장전 시 1명 추가
        `,
        max_participants: 32,
        min_participants: 8,
        entry_fee: null,
        prize_description: '우승: 우승 트로피 및 골든볼\n준우승: 준우승 메달\n4강: 브론즈메달\n조별예선 돌파: 참가 메달',
        venue_info: '경기장 정보는 대회 개설 시 입력하세요.',
        is_public: true,
        status: 'draft',
        organization_id: null,
        admin_user_id: superAdmin.id,
        created_by: superAdmin.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 4. 컵 대회 템플릿 (FA컵 스타일)
      const cupTemplate = {
        name: '컵 대회 템플릿',
        competition_type: 'cup',
        format: 'knockout',
        has_group_stage: false,
        group_stage_format: null,
        knockout_stage_format: 'single_elimination',
        level: 'regional',
        season: 'template',
        start_date: null,
        end_date: null,
        registration_start: null,
        registration_end: null,
        description: 'FA컵 스타일의 컵 대회 템플릿입니다. 다양한 디비전의 팀들이 참가할 수 있는 오픈 토너먼트입니다.',
        rules: `
# 컵 대회 규정

## 참가 자격
- 모든 등급의 팀 참가 가능
- 프로팀, 아마추어팀 구분 없음
- 등록된 클럽만 참가 가능

## 경기 방식
- 단일 토너먼트 (Single Elimination)
- 홈&어웨이 없이 중립 구장에서 경기
- 1라운드부터 결승까지 원게임 승부

## 승부 결정
- 90분 정규시간 승부
- 동점 시 연장전 30분
- 연장전에도 동점 시 승부차기

## 대진 및 홈팀
- 전체 라운드 추첨으로 대진 결정
- 홈팀은 추첨으로 결정하거나 하위 디비전 팀 우선

## 특별 규정
- 상위 디비전 팀의 하위 디비전 원정 가능
- 경기 중계 및 관중 입장료는 홈팀 수입
- 대회 우승팀은 다음 시즌 상위 대회 출전권 획득
        `,
        max_participants: 64,
        min_participants: 8,
        entry_fee: 50000,
        prize_description: '우승: 500만원 + 트로피\n준우승: 200만원 + 메달\n4강: 100만원 + 메달\n8강: 50만원',
        venue_info: '중립 구장에서 경기를 진행합니다.',
        is_public: true,
        status: 'draft',
        organization_id: null,
        admin_user_id: superAdmin.id,
        created_by: superAdmin.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 5. 유스 대회 템플릿
      const youthTemplate = {
        name: '유스 대회 템플릿',
        competition_type: 'tournament',
        format: 'group_knockout',
        has_group_stage: true,
        group_stage_format: 'round_robin',
        knockout_stage_format: 'single_elimination',
        level: 'local',
        season: 'template',
        start_date: null,
        end_date: null,
        registration_start: null,
        registration_end: null,
        description: '유소년 축구팀을 위한 대회 템플릿입니다. 교육적 목적과 경쟁을 균형있게 추구합니다.',
        rules: `
# 유스 대회 규정

## 참가 자격
- U-15, U-17, U-19 등 연령별 구분
- 학교팀, 클럽팀 모두 참가 가능
- 선수등록증 및 학생증 필수

## 경기 방식
- 1단계: 조별 리그 (모든 팀 최소 3경기 보장)
- 2단계: 결승토너먼트 (조별 1,2위 진출)

## 경기 시간
- U-15: 70분 (전후반 각 35분)
- U-17: 80분 (전후반 각 40분)
- U-19: 90분 (전후반 각 45분)

## 특별 규정
- 교체 제한 없음 (모든 선수 출전 기회 제공)
- 페어플레이 상 별도 시상
- 모든 경기 무승부 허용 (조별예선)
- 결승토너먼트만 승부차기 적용

## 교육적 목표
- 모든 선수의 경기 출전을 권장
- 스포츠맨십과 페어플레이 강조
- 승부보다는 참여와 경험을 중시
        `,
        max_participants: 24,
        min_participants: 6,
        entry_fee: 30000,
        prize_description: '우승: 트로피 + 개인메달\n준우승: 메달\n페어플레이상: 특별상\n참가상: 모든 선수',
        venue_info: '유소년 경기에 적합한 안전한 경기장에서 진행합니다.',
        is_public: true,
        status: 'draft',
        organization_id: null,
        admin_user_id: superAdmin.id,
        created_by: superAdmin.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 템플릿들 생성
      const templates = [
        leagueTemplate,
        tournamentTemplate,
        groupKnockoutTemplate,
        cupTemplate,
        youthTemplate
      ];

      // 템플릿들을 하나씩 추가 (ID 자동 생성)
      const insertedTemplates = [];
      for (const template of templates) {
        const [inserted] = await queryInterface.bulkInsert('competitions', [template], {
          returning: true,
          transaction
        });
        insertedTemplates.push(inserted);
      }

      console.log(`✅ ${insertedTemplates.length}개 대회 템플릿 생성 완료:`);
      templates.forEach((template, index) => {
        console.log(`   ${index + 1}. ${template.name} (${template.competition_type}/${template.format})`);
      });

      await transaction.commit();

      console.log(`
🎉 대회 템플릿 시스템 구축 완료!

📋 생성된 템플릿:
1. 리그 템플릿 - 총당리그 방식
2. 토너먼트 템플릿 - 단순 토너먼트
3. 조별예선+결승토너먼트 템플릿 - 월드컵 방식
4. 컵 대회 템플릿 - FA컵 스타일
5. 유스 대회 템플릿 - 유소년 특화

💡 사용 방법:
- 템플릿을 복사하여 새 대회 생성
- 날짜, 참가팀, 상금 등만 수정하면 바로 사용 가능
- 규정과 형식이 미리 정의되어 있어 일관성 있는 대회 운영
      `);

    } catch (error) {
      await transaction.rollback();
      console.error('❌ 대회 템플릿 생성 실패:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // 템플릿들 삭제 (season='template'인 항목들)
      await queryInterface.bulkDelete('competitions', {
        season: 'template'
      }, { transaction });

      await transaction.commit();
      console.log('🧹 대회 템플릿 정리 완료');
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};