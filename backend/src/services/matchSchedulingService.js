const { Match, Club, Competition, Tournament, User } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment-timezone');

class MatchSchedulingService {
  constructor() {
    this.defaultTimeZone = 'Asia/Seoul';
    this.defaultMatchDuration = 90; // minutes
    this.bufferTime = 30; // minutes between matches
  }

  /**
   * 자동 스케줄링: 대회 또는 토너먼트의 경기를 자동으로 스케줄링
   */
  async autoScheduleMatches(competitionId, options = {}) {
    try {
      const {
        startDate,
        endDate,
        preferredTimes = ['14:00', '16:00', '18:00', '20:00'],
        excludeDays = [], // 0: Sunday, 1: Monday, etc.
        venueIds = [],
        timezone = this.defaultTimeZone
      } = options;

      // 1. 스케줄링이 필요한 경기들 조회
      const pendingMatches = await Match.findAll({
        where: {
          competition_id: competitionId,
          scheduling_status: 'pending',
          match_date: null
        },
        include: [
          { model: Club, as: 'homeClub' },
          { model: Club, as: 'awayClub' },
          { model: Competition, as: 'competition' }
        ],
        order: [['priority', 'DESC'], ['createdAt', 'ASC']]
      });

      if (pendingMatches.length === 0) {
        return { success: true, message: '스케줄링할 경기가 없습니다.', scheduledMatches: [] };
      }

      // 2. 스케줄링 알고리즘 실행
      const schedulingResult = await this.scheduleMatchesAlgorithm(
        pendingMatches,
        { startDate, endDate, preferredTimes, excludeDays, venueIds, timezone }
      );

      // 3. 스케줄링 결과 저장
      const scheduledMatches = [];
      const conflictedMatches = [];

      for (const result of schedulingResult) {
        if (result.success) {
          await Match.update(
            {
              match_date: result.scheduledDate,
              venue: result.venue,
              scheduling_status: 'confirmed',
              auto_scheduled: true,
              conflict_reason: null
            },
            { where: { id: result.matchId } }
          );
          scheduledMatches.push(result);
        } else {
          await Match.update(
            {
              scheduling_status: 'conflicted',
              conflict_reason: result.reason
            },
            { where: { id: result.matchId } }
          );
          conflictedMatches.push(result);
        }
      }

      return {
        success: true,
        scheduledMatches,
        conflictedMatches,
        totalProcessed: pendingMatches.length
      };

    } catch (error) {
      console.error('Auto scheduling error:', error);
      throw new Error('자동 스케줄링 중 오류가 발생했습니다: ' + error.message);
    }
  }

  /**
   * 스케줄링 알고리즘: 경기들을 최적으로 배치
   */
  async scheduleMatchesAlgorithm(matches, options) {
    const { startDate, endDate, preferredTimes, excludeDays, venueIds, timezone } = options;
    const results = [];
    const occupiedSlots = new Map(); // venue + date -> occupied times

    // 기존 스케줄된 경기들의 시간대 조회
    await this.loadExistingSchedules(occupiedSlots, startDate, endDate, venueIds);

    for (const match of matches) {
      const schedulingResult = await this.findBestSlot(
        match,
        { startDate, endDate, preferredTimes, excludeDays, venueIds, timezone },
        occupiedSlots
      );

      if (schedulingResult.success) {
        // 슬롯 점유 표시
        const slotKey = `${schedulingResult.venue}_${schedulingResult.date}`;
        if (!occupiedSlots.has(slotKey)) {
          occupiedSlots.set(slotKey, []);
        }
        occupiedSlots.get(slotKey).push({
          start: schedulingResult.startTime,
          end: schedulingResult.endTime
        });
      }

      results.push({
        matchId: match.id,
        success: schedulingResult.success,
        scheduledDate: schedulingResult.success ? schedulingResult.scheduledDate : null,
        venue: schedulingResult.success ? schedulingResult.venue : null,
        reason: schedulingResult.success ? '성공적으로 스케줄됨' : schedulingResult.reason
      });
    }

    return results;
  }

  /**
   * 경기에 최적의 시간대 찾기
   */
  async findBestSlot(match, options, occupiedSlots) {
    const { startDate, endDate, preferredTimes, excludeDays, venueIds, timezone } = options;
    const matchDuration = match.estimated_duration || this.defaultMatchDuration;

    let currentDate = moment.tz(startDate, timezone);
    const endMoment = moment.tz(endDate, timezone);

    while (currentDate.isBefore(endMoment)) {
      // 제외 요일 확인
      if (excludeDays.includes(currentDate.day())) {
        currentDate.add(1, 'day');
        continue;
      }

      // 각 선호 시간대에서 가능한 슬롯 확인
      for (const preferredTime of preferredTimes) {
        const [hour, minute] = preferredTime.split(':').map(Number);
        const slotStart = currentDate.clone().hour(hour).minute(minute);
        const slotEnd = slotStart.clone().add(matchDuration + this.bufferTime, 'minutes');

        // 각 경기장에서 가능성 확인
        const availableVenues = venueIds.length > 0 ? venueIds : [null];

        for (const venueId of availableVenues) {
          const venue = venueId || '미정';

          if (await this.isSlotAvailable(venue, slotStart, slotEnd, occupiedSlots, match)) {
            return {
              success: true,
              scheduledDate: slotStart.toDate(),
              venue: venue,
              date: slotStart.format('YYYY-MM-DD'),
              startTime: slotStart.format('HH:mm'),
              endTime: slotEnd.format('HH:mm')
            };
          }
        }
      }

      currentDate.add(1, 'day');
    }

    return {
      success: false,
      reason: '지정된 기간 내에서 적절한 시간대를 찾을 수 없습니다.'
    };
  }

  /**
   * 시간대 사용 가능 여부 확인
   */
  async isSlotAvailable(venue, startTime, endTime, occupiedSlots, match) {
    const dateKey = startTime.format('YYYY-MM-DD');
    const slotKey = `${venue}_${dateKey}`;

    // 기존 점유된 시간대와 충돌 확인
    if (occupiedSlots.has(slotKey)) {
      const occupiedTimes = occupiedSlots.get(slotKey);

      for (const occupied of occupiedTimes) {
        const occupiedStart = moment(occupied.start, 'HH:mm');
        const occupiedEnd = moment(occupied.end, 'HH:mm');
        const newStart = moment(startTime.format('HH:mm'), 'HH:mm');
        const newEnd = moment(endTime.format('HH:mm'), 'HH:mm');

        // 시간 겹침 확인
        if (newStart.isBefore(occupiedEnd) && newEnd.isAfter(occupiedStart)) {
          return false;
        }
      }
    }

    // 클럽별 연속 경기 간격 확인 (최소 1일)
    const recentMatches = await Match.findAll({
      where: {
        [Op.or]: [
          { home_club_id: match.home_club_id },
          { away_club_id: match.home_club_id },
          { home_club_id: match.away_club_id },
          { away_club_id: match.away_club_id }
        ],
        match_date: {
          [Op.between]: [
            startTime.clone().subtract(1, 'day').toDate(),
            startTime.clone().add(1, 'day').toDate()
          ]
        },
        id: { [Op.ne]: match.id }
      }
    });

    if (recentMatches.length > 0) {
      return false;
    }

    return true;
  }

  /**
   * 기존 스케줄 로드
   */
  async loadExistingSchedules(occupiedSlots, startDate, endDate, venueIds) {
    const existingMatches = await Match.findAll({
      where: {
        match_date: {
          [Op.between]: [startDate, endDate]
        },
        scheduling_status: 'confirmed'
      }
    });

    for (const match of existingMatches) {
      const matchMoment = moment.tz(match.match_date, this.defaultTimeZone);
      const duration = match.estimated_duration || this.defaultMatchDuration;
      const endTime = matchMoment.clone().add(duration + this.bufferTime, 'minutes');

      const venue = match.venue || '미정';
      const dateKey = matchMoment.format('YYYY-MM-DD');
      const slotKey = `${venue}_${dateKey}`;

      if (!occupiedSlots.has(slotKey)) {
        occupiedSlots.set(slotKey, []);
      }

      occupiedSlots.get(slotKey).push({
        start: matchMoment.format('HH:mm'),
        end: endTime.format('HH:mm')
      });
    }
  }

  /**
   * 수동 스케줄링: 특정 경기를 특정 시간에 스케줄링
   */
  async scheduleMatch(matchId, scheduleData, userId) {
    try {
      const { match_date, venue, estimated_duration } = scheduleData;

      const match = await Match.findByPk(matchId);
      if (!match) {
        throw new Error('경기를 찾을 수 없습니다.');
      }

      // 시간 충돌 확인
      const conflictCheck = await this.checkScheduleConflict(
        match_date,
        estimated_duration || this.defaultMatchDuration,
        venue,
        [match.home_club_id, match.away_club_id],
        matchId
      );

      if (conflictCheck.hasConflict) {
        await Match.update(
          {
            scheduling_status: 'conflicted',
            conflict_reason: conflictCheck.reason
          },
          { where: { id: matchId } }
        );

        return {
          success: false,
          conflict: true,
          reason: conflictCheck.reason,
          conflictDetails: conflictCheck.details
        };
      }

      // 스케줄링 실행
      await Match.update(
        {
          match_date,
          venue,
          estimated_duration: estimated_duration || this.defaultMatchDuration,
          scheduling_status: 'confirmed',
          auto_scheduled: false,
          conflict_reason: null
        },
        { where: { id: matchId } }
      );

      const updatedMatch = await Match.findByPk(matchId, {
        include: [
          { model: Club, as: 'homeClub' },
          { model: Club, as: 'awayClub' },
          { model: Competition, as: 'competition' }
        ]
      });

      return {
        success: true,
        match: updatedMatch
      };

    } catch (error) {
      console.error('Manual scheduling error:', error);
      throw new Error('경기 스케줄링 중 오류가 발생했습니다: ' + error.message);
    }
  }

  /**
   * 스케줄 충돌 확인
   */
  async checkScheduleConflict(matchDate, duration, venue, clubIds, excludeMatchId = null) {
    const startTime = moment.tz(matchDate, this.defaultTimeZone);
    const endTime = startTime.clone().add(duration + this.bufferTime, 'minutes');

    // 1. 같은 시간/장소 충돌 확인
    const venueConflicts = await Match.findAll({
      where: {
        venue: venue,
        match_date: {
          [Op.between]: [
            startTime.clone().subtract(this.bufferTime, 'minutes').toDate(),
            endTime.toDate()
          ]
        },
        id: excludeMatchId ? { [Op.ne]: excludeMatchId } : undefined,
        scheduling_status: ['confirmed', 'in_progress']
      }
    });

    if (venueConflicts.length > 0) {
      return {
        hasConflict: true,
        reason: '같은 시간대에 동일한 장소에서 다른 경기가 예정되어 있습니다.',
        details: venueConflicts
      };
    }

    // 2. 클럽 연속 경기 간격 확인
    const clubConflicts = await Match.findAll({
      where: {
        [Op.or]: [
          { home_club_id: { [Op.in]: clubIds } },
          { away_club_id: { [Op.in]: clubIds } }
        ],
        match_date: {
          [Op.between]: [
            startTime.clone().subtract(12, 'hours').toDate(),
            startTime.clone().add(12, 'hours').toDate()
          ]
        },
        id: excludeMatchId ? { [Op.ne]: excludeMatchId } : undefined,
        scheduling_status: ['confirmed', 'in_progress']
      }
    });

    if (clubConflicts.length > 0) {
      return {
        hasConflict: true,
        reason: '클럽의 연속 경기 간격이 부족합니다 (최소 12시간 간격 필요).',
        details: clubConflicts
      };
    }

    return { hasConflict: false };
  }

  /**
   * 스케줄 재조정
   */
  async rescheduleMatch(matchId, newScheduleData, userId, reason) {
    try {
      const match = await Match.findByPk(matchId);
      if (!match) {
        throw new Error('경기를 찾을 수 없습니다.');
      }

      if (match.status === 'completed') {
        throw new Error('완료된 경기는 재스케줄링할 수 없습니다.');
      }

      const oldDate = match.match_date;
      const scheduleResult = await this.scheduleMatch(matchId, newScheduleData, userId);

      if (scheduleResult.success) {
        await Match.update(
          {
            scheduling_status: 'rescheduled',
            conflict_reason: `재스케줄링: ${reason} (기존: ${oldDate})`
          },
          { where: { id: matchId } }
        );
      }

      return scheduleResult;

    } catch (error) {
      console.error('Reschedule error:', error);
      throw new Error('경기 재스케줄링 중 오류가 발생했습니다: ' + error.message);
    }
  }

  /**
   * 스케줄링 통계 조회
   */
  async getSchedulingStats(competitionId) {
    try {
      const stats = await Match.findAll({
        where: { competition_id: competitionId },
        attributes: [
          'scheduling_status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['scheduling_status'],
        raw: true
      });

      const total = await Match.count({ where: { competition_id: competitionId } });

      return {
        total,
        byStatus: stats.reduce((acc, stat) => {
          acc[stat.scheduling_status] = parseInt(stat.count);
          return acc;
        }, {}),
        completionRate: total > 0 ?
          ((stats.find(s => s.scheduling_status === 'confirmed')?.count || 0) / total * 100).toFixed(1) : 0
      };

    } catch (error) {
      console.error('Scheduling stats error:', error);
      throw new Error('스케줄링 통계 조회 중 오류가 발생했습니다: ' + error.message);
    }
  }
}

module.exports = new MatchSchedulingService();