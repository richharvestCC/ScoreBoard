const Competition = require('../models/Competition');
const User = require('../models/User');
const { Op } = require('sequelize');

class CompetitionService {
  /**
   * 모든 대회 조회 (페이지네이션 및 필터링 지원)
   */
  async getAllCompetitions(options = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      competition_type,
      level,
      season,
      search,
      includeTemplates = false
    } = options;

    const offset = (page - 1) * limit;
    const where = {};

    // 템플릿 제외 (기본값)
    if (!includeTemplates) {
      where.season = { [Op.ne]: 'template' };
    }

    // 필터 조건 추가
    if (status) where.status = status;
    if (competition_type) where.competition_type = competition_type;
    if (level) where.level = level;
    if (season) where.season = season;

    // 검색 조건 (이름 또는 설명)
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Competition.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return {
      competitions: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * 대회 템플릿 조회
   */
  async getTemplates() {
    return await Competition.findAll({
      where: {
        season: 'template'
      },
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'name']
        }
      ],
      order: [['id', 'ASC']]
    });
  }

  /**
   * 특정 대회 조회
   */
  async getCompetitionById(id) {
    const competition = await Competition.findByPk(id, {
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!competition) {
      throw new Error('Competition not found');
    }

    return competition;
  }

  /**
   * 새 대회 생성
   */
  async createCompetition(competitionData, userId) {
    // 필수 필드 검증
    const requiredFields = ['name', 'competition_type', 'format'];
    for (const field of requiredFields) {
      if (!competitionData[field]) {
        throw new Error(`${field} is required`);
      }
    }

    // 사용자 존재 확인
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // created_by와 admin_user_id 설정
    const dataWithUser = {
      ...competitionData,
      created_by: userId,
      admin_user_id: competitionData.admin_user_id || userId
    };

    // 날짜 검증
    if (dataWithUser.start_date && dataWithUser.end_date) {
      const startDate = new Date(dataWithUser.start_date);
      const endDate = new Date(dataWithUser.end_date);
      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }
    }

    // 등록 기간 검증
    if (dataWithUser.registration_start && dataWithUser.registration_end) {
      const regStartDate = new Date(dataWithUser.registration_start);
      const regEndDate = new Date(dataWithUser.registration_end);
      if (regEndDate <= regStartDate) {
        throw new Error('Registration end date must be after registration start date');
      }
    }

    return await Competition.create(dataWithUser);
  }

  /**
   * 템플릿으로부터 대회 생성
   */
  async createFromTemplate(templateId, competitionData, userId) {
    // 템플릿 조회
    const template = await Competition.findOne({
      where: {
        id: templateId,
        season: 'template'
      }
    });

    if (!template) {
      throw new Error('Template not found');
    }

    // 템플릿 데이터 복사
    const templateData = template.toJSON();
    delete templateData.id;
    delete templateData.createdAt;
    delete templateData.updatedAt;

    // 사용자 제공 데이터로 오버라이드
    const mergedData = {
      ...templateData,
      ...competitionData,
      season: competitionData.season || new Date().getFullYear().toString(),
      status: 'draft',
      created_by: userId,
      admin_user_id: competitionData.admin_user_id || userId
    };

    return await this.createCompetition(mergedData, userId);
  }

  /**
   * 대회 업데이트
   */
  async updateCompetition(id, updateData, userId) {
    const competition = await Competition.findByPk(id);

    if (!competition) {
      throw new Error('Competition not found');
    }

    // 권한 확인 (관리자 또는 생성자만 수정 가능)
    if (competition.admin_user_id !== userId && competition.created_by !== userId) {
      throw new Error('Unauthorized to update this competition');
    }

    // 상태에 따른 수정 제한
    if (competition.status === 'completed' || competition.status === 'cancelled') {
      throw new Error('Cannot update completed or cancelled competition');
    }

    // 진행 중인 대회는 제한적 수정만 가능
    if (competition.status === 'in_progress') {
      const allowedFields = ['description', 'venue_info', 'prize_description'];
      const updateFields = Object.keys(updateData);
      const unauthorizedFields = updateFields.filter(field => !allowedFields.includes(field));

      if (unauthorizedFields.length > 0) {
        throw new Error(`Cannot update these fields during in_progress status: ${unauthorizedFields.join(', ')}`);
      }
    }

    return await competition.update(updateData);
  }

  /**
   * 대회 삭제
   */
  async deleteCompetition(id, userId) {
    const competition = await Competition.findByPk(id);

    if (!competition) {
      throw new Error('Competition not found');
    }

    // 권한 확인
    if (competition.created_by !== userId) {
      throw new Error('Only the creator can delete this competition');
    }

    // 진행 중이거나 완료된 대회는 삭제 불가
    if (['in_progress', 'completed'].includes(competition.status)) {
      throw new Error('Cannot delete in_progress or completed competition');
    }

    return await competition.destroy();
  }

  /**
   * 대회 상태 변경
   */
  async updateCompetitionStatus(id, newStatus, userId) {
    const competition = await Competition.findByPk(id);

    if (!competition) {
      throw new Error('Competition not found');
    }

    // 권한 확인
    if (competition.admin_user_id !== userId) {
      throw new Error('Only the admin can change competition status');
    }

    // 상태 전환 유효성 검증
    const validTransitions = {
      'draft': ['open_registration', 'cancelled'],
      'open_registration': ['registration_closed', 'cancelled'],
      'registration_closed': ['in_progress', 'cancelled'],
      'in_progress': ['completed'],
      'completed': [],
      'cancelled': []
    };

    if (!validTransitions[competition.status].includes(newStatus)) {
      throw new Error(`Invalid status transition from ${competition.status} to ${newStatus}`);
    }

    return await competition.update({ status: newStatus });
  }

  /**
   * 활성 대회 조회
   */
  async getActiveCompetitions() {
    return await Competition.findAll({
      where: {
        status: ['open_registration', 'registration_closed', 'in_progress'],
        season: { [Op.ne]: 'template' }
      },
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'name']
        }
      ],
      order: [['start_date', 'ASC']]
    });
  }

  /**
   * 사용자별 대회 조회
   */
  async getUserCompetitions(userId, role = 'all') {
    const where = { season: { [Op.ne]: 'template' } };

    if (role === 'admin') {
      where.admin_user_id = userId;
    } else if (role === 'creator') {
      where.created_by = userId;
    } else if (role === 'managed') {
      where[Op.or] = [
        { admin_user_id: userId },
        { created_by: userId }
      ];
    }

    return await Competition.findAll({
      where,
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }
}

module.exports = new CompetitionService();