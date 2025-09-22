const { Competition, Club, User, Match, CompetitionParticipant } = require('../models');
const { Op } = require('sequelize');

class ParticipationService {
  // 대회 참가 신청
  async joinCompetition(competitionId, clubId, participantData = {}) {
    try {
      // 대회 정보 조회
      const competition = await Competition.findByPk(competitionId);
      if (!competition) {
        throw new Error('존재하지 않는 대회입니다.');
      }

      // 대회 상태 확인
      if (competition.status !== 'open') {
        throw new Error('참가 신청이 마감된 대회입니다.');
      }

      // 클럽 정보 조회
      const club = await Club.findByPk(clubId);
      if (!club) {
        throw new Error('존재하지 않는 클럽입니다.');
      }

      // 중복 참가 확인
      const existingParticipation = await CompetitionParticipant.findOne({
        where: {
          competition_id: competitionId,
          club_id: clubId
        }
      });

      if (existingParticipation) {
        throw new Error('이미 해당 대회에 참가 신청한 클럽입니다.');
      }

      // 최대 참가 팀 수 확인
      if (competition.max_participants) {
        const currentParticipants = await CompetitionParticipant.count({
          where: { competition_id: competitionId }
        });

        if (currentParticipants >= competition.max_participants) {
          throw new Error('참가 신청 가능한 팀 수를 초과했습니다.');
        }
      }

      // 참가 신청 등록
      const participation = await CompetitionParticipant.create({
        competition_id: competitionId,
        club_id: clubId,
        registration_date: new Date(),
        status: 'registered',
        ...participantData
      });

      return {
        participation,
        competition,
        club
      };
    } catch (error) {
      throw new Error(`대회 참가 신청 실패: ${error.message}`);
    }
  }

  // 대회 참가 취소
  async leaveCompetition(competitionId, clubId) {
    try {
      // 참가 정보 조회
      const participation = await CompetitionParticipant.findOne({
        where: {
          competition_id: competitionId,
          club_id: clubId
        }
      });

      if (!participation) {
        throw new Error('해당 대회에 참가하지 않은 클럽입니다.');
      }

      // 대회 상태 확인
      const competition = await Competition.findByPk(competitionId);
      if (competition.status === 'in_progress' || competition.status === 'completed') {
        throw new Error('진행 중이거나 완료된 대회는 참가 취소할 수 없습니다.');
      }

      // 참가 취소 처리
      await participation.destroy();

      return {
        success: true,
        message: '대회 참가가 취소되었습니다.'
      };
    } catch (error) {
      throw new Error(`대회 참가 취소 실패: ${error.message}`);
    }
  }

  // 대회 참가 팀 목록 조회
  async getParticipants(competitionId, options = {}) {
    try {
      const { page = 1, limit = 20, search = '' } = options;
      const offset = (page - 1) * limit;

      const whereClause = {
        competition_id: competitionId
      };

      const includeClause = {
        model: Club,
        attributes: ['id', 'name', 'club_type', 'logo_url', 'description'],
        where: search ? {
          name: {
            [Op.iLike]: `%${search}%`
          }
        } : undefined
      };

      const { count, rows: participants } = await CompetitionParticipant.findAndCountAll({
        where: whereClause,
        include: [includeClause],
        order: [['registration_date', 'ASC']],
        limit,
        offset
      });

      return {
        participants: participants.map(p => ({
          id: p.id,
          registration_date: p.registration_date,
          status: p.status,
          club: {
            id: p.Club.id,
            name: p.Club.name,
            club_type: p.Club.club_type,
            logo_url: p.Club.logo_url,
            description: p.Club.description
          }
        })),
        pagination: {
          current_page: page,
          total_pages: Math.ceil(count / limit),
          total_count: count,
          per_page: limit
        }
      };
    } catch (error) {
      throw new Error(`참가 팀 목록 조회 실패: ${error.message}`);
    }
  }

  // 특정 클럽의 참가 상태 확인
  async getParticipationStatus(competitionId, clubId) {
    try {
      const participation = await CompetitionParticipant.findOne({
        where: {
          competition_id: competitionId,
          club_id: clubId
        },
        include: [
          {
            model: Competition,
            attributes: ['id', 'name', 'status', 'competition_type']
          },
          {
            model: Club,
            attributes: ['id', 'name', 'club_type']
          }
        ]
      });

      if (!participation) {
        return {
          is_participating: false,
          participation: null
        };
      }

      return {
        is_participating: true,
        participation: {
          id: participation.id,
          registration_date: participation.registration_date,
          status: participation.status,
          competition: participation.Competition,
          club: participation.Club
        }
      };
    } catch (error) {
      throw new Error(`참가 상태 확인 실패: ${error.message}`);
    }
  }

  // 대회 참가 가능 여부 확인
  async checkEligibility(competitionId, clubId) {
    try {
      const competition = await Competition.findByPk(competitionId);
      if (!competition) {
        return {
          eligible: false,
          reason: '존재하지 않는 대회입니다.'
        };
      }

      // 대회 상태 확인
      if (competition.status !== 'open') {
        return {
          eligible: false,
          reason: '참가 신청이 마감된 대회입니다.'
        };
      }

      // 중복 참가 확인
      const existingParticipation = await CompetitionParticipant.findOne({
        where: {
          competition_id: competitionId,
          club_id: clubId
        }
      });

      if (existingParticipation) {
        return {
          eligible: false,
          reason: '이미 참가 신청한 대회입니다.'
        };
      }

      // 최대 참가 팀 수 확인
      if (competition.max_participants) {
        const currentParticipants = await CompetitionParticipant.count({
          where: { competition_id: competitionId }
        });

        if (currentParticipants >= competition.max_participants) {
          return {
            eligible: false,
            reason: '참가 신청 가능한 팀 수를 초과했습니다.'
          };
        }
      }

      // 클럽 정보 확인
      const club = await Club.findByPk(clubId);
      if (!club) {
        return {
          eligible: false,
          reason: '존재하지 않는 클럽입니다.'
        };
      }

      return {
        eligible: true,
        competition,
        club,
        current_participants: await CompetitionParticipant.count({
          where: { competition_id: competitionId }
        })
      };
    } catch (error) {
      throw new Error(`참가 자격 확인 실패: ${error.message}`);
    }
  }

  // 참가 신청 상태 변경 (관리자용)
  async updateParticipationStatus(competitionId, clubId, status, adminUserId) {
    try {
      const participation = await CompetitionParticipant.findOne({
        where: {
          competition_id: competitionId,
          club_id: clubId
        }
      });

      if (!participation) {
        throw new Error('참가 신청 정보를 찾을 수 없습니다.');
      }

      const validStatuses = ['registered', 'approved', 'rejected', 'withdrawn'];
      if (!validStatuses.includes(status)) {
        throw new Error('유효하지 않은 상태입니다.');
      }

      await participation.update({
        status,
        updated_by: adminUserId,
        updated_at: new Date()
      });

      return participation;
    } catch (error) {
      throw new Error(`참가 상태 변경 실패: ${error.message}`);
    }
  }

  // 대회별 참가 통계
  async getParticipationStatistics(competitionId) {
    try {
      const [
        totalParticipants,
        registeredCount,
        approvedCount,
        rejectedCount,
        withdrawnCount
      ] = await Promise.all([
        CompetitionParticipant.count({
          where: { competition_id: competitionId }
        }),
        CompetitionParticipant.count({
          where: { competition_id: competitionId, status: 'registered' }
        }),
        CompetitionParticipant.count({
          where: { competition_id: competitionId, status: 'approved' }
        }),
        CompetitionParticipant.count({
          where: { competition_id: competitionId, status: 'rejected' }
        }),
        CompetitionParticipant.count({
          where: { competition_id: competitionId, status: 'withdrawn' }
        })
      ]);

      const competition = await Competition.findByPk(competitionId, {
        attributes: ['id', 'name', 'max_participants', 'status']
      });

      return {
        competition_info: competition,
        statistics: {
          total_participants: totalParticipants,
          registered: registeredCount,
          approved: approvedCount,
          rejected: rejectedCount,
          withdrawn: withdrawnCount,
          available_slots: competition.max_participants
            ? competition.max_participants - totalParticipants
            : null
        }
      };
    } catch (error) {
      throw new Error(`참가 통계 조회 실패: ${error.message}`);
    }
  }
}

module.exports = new ParticipationService();