const matchSchedulingService = require('../services/matchSchedulingService');
const { Match, Club, Competition, Tournament } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment-timezone');

/**
 * 자동 스케줄링 실행
 */
const autoScheduleMatches = async (req, res) => {
  try {
    const { competitionId } = req.params;
    const {
      startDate,
      endDate,
      preferredTimes,
      excludeDays,
      venueIds,
      timezone
    } = req.body;

    // 권한 확인
    const competition = await Competition.findByPk(competitionId);
    if (!competition) {
      return res.status(404).json({
        success: false,
        message: '대회를 찾을 수 없습니다.'
      });
    }

    if (!req.user.hasAnyRole(['admin', 'moderator', 'organizer'])) {
      return res.status(403).json({
        success: false,
        message: '스케줄링 권한이 없습니다.'
      });
    }

    // 필수 파라미터 검증
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: '시작일과 종료일을 지정해야 합니다.'
      });
    }

    const result = await matchSchedulingService.autoScheduleMatches(competitionId, {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      preferredTimes: preferredTimes || ['14:00', '16:00', '18:00', '20:00'],
      excludeDays: excludeDays || [],
      venueIds: venueIds || [],
      timezone: timezone || 'Asia/Seoul'
    });

    res.json({
      success: true,
      message: '자동 스케줄링이 완료되었습니다.',
      data: result
    });

  } catch (error) {
    console.error('Auto scheduling error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '자동 스케줄링 중 오류가 발생했습니다.'
    });
  }
};

/**
 * 수동 경기 스케줄링
 */
const scheduleMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { match_date, venue, estimated_duration } = req.body;

    // 권한 확인
    const match = await Match.findByPk(matchId, {
      include: [{ model: Competition, as: 'competition' }]
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: '경기를 찾을 수 없습니다.'
      });
    }

    if (!req.user.hasAnyRole(['admin', 'moderator', 'organizer'])) {
      return res.status(403).json({
        success: false,
        message: '스케줄링 권한이 없습니다.'
      });
    }

    // 필수 파라미터 검증
    if (!match_date) {
      return res.status(400).json({
        success: false,
        message: '경기 날짜를 지정해야 합니다.'
      });
    }

    const result = await matchSchedulingService.scheduleMatch(
      matchId,
      { match_date: new Date(match_date), venue, estimated_duration },
      req.user.id
    );

    if (result.success) {
      res.json({
        success: true,
        message: '경기가 성공적으로 스케줄되었습니다.',
        data: result.match
      });
    } else {
      res.status(409).json({
        success: false,
        message: result.reason,
        conflict: result.conflict,
        conflictDetails: result.conflictDetails
      });
    }

  } catch (error) {
    console.error('Schedule match error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '경기 스케줄링 중 오류가 발생했습니다.'
    });
  }
};

/**
 * 경기 재스케줄링
 */
const rescheduleMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { match_date, venue, estimated_duration, reason } = req.body;

    // 권한 확인
    const match = await Match.findByPk(matchId);
    if (!match) {
      return res.status(404).json({
        success: false,
        message: '경기를 찾을 수 없습니다.'
      });
    }

    if (!req.user.hasAnyRole(['admin', 'moderator', 'organizer'])) {
      return res.status(403).json({
        success: false,
        message: '재스케줄링 권한이 없습니다.'
      });
    }

    const result = await matchSchedulingService.rescheduleMatch(
      matchId,
      { match_date: new Date(match_date), venue, estimated_duration },
      req.user.id,
      reason || '재스케줄링 요청'
    );

    if (result.success) {
      res.json({
        success: true,
        message: '경기가 성공적으로 재스케줄되었습니다.',
        data: result.match
      });
    } else {
      res.status(409).json({
        success: false,
        message: result.reason,
        conflict: result.conflict,
        conflictDetails: result.conflictDetails
      });
    }

  } catch (error) {
    console.error('Reschedule match error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '경기 재스케줄링 중 오류가 발생했습니다.'
    });
  }
};

/**
 * 스케줄 충돌 확인
 */
const checkScheduleConflict = async (req, res) => {
  try {
    const { match_date, venue, estimated_duration, club_ids } = req.body;
    const { matchId } = req.params;

    if (!match_date || !club_ids || !Array.isArray(club_ids)) {
      return res.status(400).json({
        success: false,
        message: '경기 날짜와 클럽 ID들을 제공해야 합니다.'
      });
    }

    const conflictResult = await matchSchedulingService.checkScheduleConflict(
      new Date(match_date),
      estimated_duration || 90,
      venue,
      club_ids,
      matchId
    );

    res.json({
      success: true,
      hasConflict: conflictResult.hasConflict,
      reason: conflictResult.reason,
      details: conflictResult.details
    });

  } catch (error) {
    console.error('Check conflict error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '충돌 확인 중 오류가 발생했습니다.'
    });
  }
};

/**
 * 스케줄링 통계 조회
 */
const getSchedulingStats = async (req, res) => {
  try {
    const { competitionId } = req.params;

    const competition = await Competition.findByPk(competitionId);
    if (!competition) {
      return res.status(404).json({
        success: false,
        message: '대회를 찾을 수 없습니다.'
      });
    }

    const stats = await matchSchedulingService.getSchedulingStats(competitionId);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get scheduling stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '스케줄링 통계 조회 중 오류가 발생했습니다.'
    });
  }
};

/**
 * 대회별 경기 스케줄 조회
 */
const getCompetitionSchedule = async (req, res) => {
  try {
    const { competitionId } = req.params;
    const {
      startDate,
      endDate,
      status,
      page = 1,
      limit = 20,
      sortBy = 'match_date',
      sortOrder = 'ASC'
    } = req.query;

    const competition = await Competition.findByPk(competitionId);
    if (!competition) {
      return res.status(404).json({
        success: false,
        message: '대회를 찾을 수 없습니다.'
      });
    }

    // 조건 구성
    const whereConditions = { competition_id: competitionId };

    if (startDate && endDate) {
      whereConditions.match_date = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    if (status) {
      whereConditions.scheduling_status = status;
    }

    // 페이지네이션
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { rows: matches, count: total } = await Match.findAndCountAll({
      where: whereConditions,
      include: [
        { model: Club, as: 'homeClub', attributes: ['id', 'name', 'logo_url'] },
        { model: Club, as: 'awayClub', attributes: ['id', 'name', 'logo_url'] },
        { model: Competition, as: 'competition', attributes: ['id', 'name', 'competition_type'] }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      data: {
        matches,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get competition schedule error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '스케줄 조회 중 오류가 발생했습니다.'
    });
  }
};

/**
 * 스케줄링 상태별 경기 조회
 */
const getMatchesByStatus = async (req, res) => {
  try {
    const { competitionId, status } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const competition = await Competition.findByPk(competitionId);
    if (!competition) {
      return res.status(404).json({
        success: false,
        message: '대회를 찾을 수 없습니다.'
      });
    }

    const validStatuses = ['pending', 'confirmed', 'rescheduled', 'conflicted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 스케줄링 상태입니다.'
      });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { rows: matches, count: total } = await Match.findAndCountAll({
      where: {
        competition_id: competitionId,
        scheduling_status: status
      },
      include: [
        { model: Club, as: 'homeClub', attributes: ['id', 'name', 'logo_url'] },
        { model: Club, as: 'awayClub', attributes: ['id', 'name', 'logo_url'] }
      ],
      order: [['priority', 'DESC'], ['createdAt', 'ASC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      data: {
        matches,
        status,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get matches by status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '상태별 경기 조회 중 오류가 발생했습니다.'
    });
  }
};

/**
 * 가용 시간대 조회
 */
const getAvailableTimeSlots = async (req, res) => {
  try {
    const { date, venue, duration = 90 } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: '날짜를 지정해야 합니다.'
      });
    }

    const targetDate = moment.tz(date, 'Asia/Seoul');
    const businessHours = [
      '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
      '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
    ];

    // 해당 날짜의 기존 경기들 조회
    const existingMatches = await Match.findAll({
      where: {
        match_date: {
          [Op.between]: [
            targetDate.clone().startOf('day').toDate(),
            targetDate.clone().endOf('day').toDate()
          ]
        },
        venue: venue || { [Op.ne]: null },
        scheduling_status: ['confirmed', 'in_progress']
      },
      attributes: ['match_date', 'estimated_duration', 'venue']
    });

    // 가용 시간대 계산
    const availableSlots = [];
    const occupiedSlots = existingMatches.map(match => {
      const start = moment.tz(match.match_date, 'Asia/Seoul');
      const end = start.clone().add((match.estimated_duration || 90) + 30, 'minutes');
      return { start: start.format('HH:mm'), end: end.format('HH:mm') };
    });

    for (const hour of businessHours) {
      const slotStart = moment(hour, 'HH:mm');
      const slotEnd = slotStart.clone().add(parseInt(duration) + 30, 'minutes');

      let isAvailable = true;
      for (const occupied of occupiedSlots) {
        const occupiedStart = moment(occupied.start, 'HH:mm');
        const occupiedEnd = moment(occupied.end, 'HH:mm');

        if (slotStart.isBefore(occupiedEnd) && slotEnd.isAfter(occupiedStart)) {
          isAvailable = false;
          break;
        }
      }

      if (isAvailable && slotEnd.format('HH:mm') <= '22:30') {
        availableSlots.push({
          startTime: hour,
          endTime: slotEnd.format('HH:mm'),
          duration: parseInt(duration)
        });
      }
    }

    res.json({
      success: true,
      data: {
        date,
        venue: venue || '모든 경기장',
        availableSlots,
        occupiedSlots
      }
    });

  } catch (error) {
    console.error('Get available time slots error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '가용 시간대 조회 중 오류가 발생했습니다.'
    });
  }
};

module.exports = {
  autoScheduleMatches,
  scheduleMatch,
  rescheduleMatch,
  checkScheduleConflict,
  getSchedulingStats,
  getCompetitionSchedule,
  getMatchesByStatus,
  getAvailableTimeSlots
};