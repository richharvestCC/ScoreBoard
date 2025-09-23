const { Competition, Match, Club, CompetitionParticipant } = require('../models');
const { Op } = require('sequelize');

class BracketService {
  // 토너먼트 대진표 생성
  async generateTournamentBracket(competitionId) {
    try {
      const competition = await Competition.findByPk(competitionId);
      if (!competition) {
        throw new Error('존재하지 않는 대회입니다.');
      }

      if (competition.competition_type !== 'tournament') {
        throw new Error('토너먼트 대회가 아닙니다.');
      }

      // 참가 팀 조회
      const participants = await CompetitionParticipant.findAll({
        where: {
          competition_id: competitionId,
          status: 'approved'
        },
        include: [{
          model: Club,
          attributes: ['id', 'name', 'logo_url']
        }],
        order: [['registration_date', 'ASC']]
      });

      if (participants.length < 2) {
        throw new Error('대진표 생성을 위해서는 최소 2개 팀이 필요합니다.');
      }

      // 토너먼트 형식에 따른 대진표 생성
      let bracket;
      switch (competition.format) {
        case 'knockout':
          bracket = await this.generateKnockoutBracket(competition, participants);
          break;
        case 'round_robin':
          bracket = await this.generateRoundRobinBracket(competition, participants);
          break;
        case 'mixed':
          bracket = await this.generateMixedBracket(competition, participants);
          break;
        default:
          throw new Error('지원하지 않는 토너먼트 형식입니다.');
      }

      return bracket;
    } catch (error) {
      throw new Error(`대진표 생성 실패: ${error.message}`);
    }
  }

  // 녹아웃 토너먼트 대진표 생성
  async generateKnockoutBracket(competition, participants) {
    const teams = participants.map(p => ({
      id: p.Club.id,
      name: p.Club.name,
      logo_url: p.Club.logo_url,
      participant_id: p.id
    }));

    // 2의 제곱수로 맞추기 위한 계산
    const totalTeams = teams.length;
    const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(totalTeams)));
    const byesNeeded = nextPowerOfTwo - totalTeams;

    // 시드 배치 (랜덤 또는 등록 순서)
    const seededTeams = this.seedTeams(teams, competition.seeding_method || 'registration');

    // 첫 라운드에서 부전승 처리
    const firstRoundTeams = [...seededTeams];
    for (let i = 0; i < byesNeeded; i++) {
      firstRoundTeams.push(null); // null은 부전승을 의미
    }

    // 라운드별 경기 생성
    const rounds = [];
    let currentRound = 1;
    let currentTeams = firstRoundTeams;

    while (currentTeams.length > 1) {
      const roundMatches = [];
      const nextRoundTeams = [];

      for (let i = 0; i < currentTeams.length; i += 2) {
        const team1 = currentTeams[i];
        const team2 = currentTeams[i + 1];

        if (!team1 && !team2) {
          // 둘 다 부전승인 경우 (발생하지 않아야 함)
          continue;
        } else if (!team1) {
          // team1이 부전승, team2가 다음 라운드 진출
          nextRoundTeams.push(team2);
        } else if (!team2) {
          // team2가 부전승, team1이 다음 라운드 진출
          nextRoundTeams.push(team1);
        } else {
          // 정상 경기
          const match = {
            round: currentRound,
            match_number: roundMatches.length + 1,
            home_team: team1,
            away_team: team2,
            home_club_id: team1.id,
            away_club_id: team2.id,
            status: 'scheduled',
            competition_id: competition.id
          };
          roundMatches.push(match);
          nextRoundTeams.push(null); // 승자는 경기 후 결정
        }
      }

      if (roundMatches.length > 0) {
        rounds.push({
          round_number: currentRound,
          round_name: this.getRoundName(currentRound, Math.ceil(Math.log2(nextPowerOfTwo))),
          matches: roundMatches
        });
      }

      currentTeams = nextRoundTeams;
      currentRound++;
    }

    return {
      tournament_type: 'knockout',
      total_rounds: rounds.length,
      total_teams: totalTeams,
      bracket_size: nextPowerOfTwo,
      rounds: rounds,
      settings: {
        seeding_method: competition.seeding_method || 'registration',
        has_third_place: competition.has_third_place || false
      }
    };
  }

  // 리그전 대진표 생성
  async generateRoundRobinBracket(competition, participants) {
    const teams = participants.map(p => ({
      id: p.Club.id,
      name: p.Club.name,
      logo_url: p.Club.logo_url,
      participant_id: p.id
    }));

    const totalTeams = teams.length;
    const totalRounds = totalTeams % 2 === 0 ? totalTeams - 1 : totalTeams;
    const matchesPerRound = Math.floor(totalTeams / 2);

    // 원형 리그 알고리즘
    const rounds = [];
    const teamList = [...teams];

    // 팀 수가 홀수면 가상의 팀(부전승) 추가
    if (totalTeams % 2 === 1) {
      teamList.push(null);
    }

    for (let round = 1; round <= totalRounds; round++) {
      const roundMatches = [];

      for (let match = 0; match < matchesPerRound; match++) {
        const team1Index = match;
        const team2Index = teamList.length - 1 - match;

        const team1 = teamList[team1Index];
        const team2 = teamList[team2Index];

        // 부전승 경기는 제외
        if (team1 && team2) {
          roundMatches.push({
            round: round,
            match_number: match + 1,
            home_team: team1,
            away_team: team2,
            home_club_id: team1.id,
            away_club_id: team2.id,
            status: 'scheduled',
            competition_id: competition.id
          });
        }
      }

      rounds.push({
        round_number: round,
        round_name: `${round}라운드`,
        matches: roundMatches
      });

      // 첫 번째 팀은 고정, 나머지 팀들을 시계방향으로 회전
      const lastTeam = teamList.pop();
      teamList.splice(1, 0, lastTeam);
    }

    return {
      tournament_type: 'round_robin',
      total_rounds: rounds.length,
      total_teams: totalTeams,
      total_matches: (totalTeams * (totalTeams - 1)) / 2,
      rounds: rounds,
      settings: {
        double_round_robin: competition.double_round_robin || false
      }
    };
  }

  // 혼합 형식 대진표 생성 (조별 예선 + 결승 토너먼트)
  async generateMixedBracket(competition, participants) {
    if (!competition.has_group_stage) {
      throw new Error('혼합 형식은 조별 예선이 필요합니다.');
    }

    const teams = participants.map(p => ({
      id: p.Club.id,
      name: p.Club.name,
      logo_url: p.Club.logo_url,
      participant_id: p.id
    }));

    const totalTeams = teams.length;
    const groupSize = competition.group_size || 4;
    const numberOfGroups = Math.ceil(totalTeams / groupSize);

    // 그룹 분배
    const groups = [];
    for (let i = 0; i < numberOfGroups; i++) {
      groups.push([]);
    }

    // 팀을 그룹에 분배 (라운드 로빈 방식)
    teams.forEach((team, index) => {
      const groupIndex = index % numberOfGroups;
      groups[groupIndex].push(team);
    });

    // 각 그룹별 리그전 생성
    const groupStage = [];
    for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
      const groupTeams = groups[groupIndex];
      if (groupTeams.length < 2) continue;

      const groupBracket = await this.generateRoundRobinBracket(
        { ...competition, competition_type: 'league' },
        groupTeams.map(team => ({
          Club: {
            id: team.id,
            name: team.name,
            logo_url: team.logo_url
          },
          id: team.participant_id
        }))
      );

      groupStage.push({
        group_name: `Group ${String.fromCharCode(65 + groupIndex)}`,
        group_index: groupIndex,
        teams: groupTeams,
        ...groupBracket
      });
    }

    // 각 그룹에서 상위 팀들이 결승 토너먼트 진출
    const qualifiersPerGroup = competition.qualifiers_per_group || 2;
    const knockoutTeams = numberOfGroups * qualifiersPerGroup;

    return {
      tournament_type: 'mixed',
      total_teams: totalTeams,
      group_stage: {
        number_of_groups: numberOfGroups,
        group_size: groupSize,
        qualifiers_per_group: qualifiersPerGroup,
        groups: groupStage
      },
      knockout_stage: {
        total_teams: knockoutTeams,
        placeholder: true // 그룹 스테이지 완료 후 생성
      }
    };
  }

  // 시드 배치
  seedTeams(teams, method = 'registration') {
    switch (method) {
      case 'random':
        return this.shuffleArray([...teams]);
      case 'rating':
        // 추후 팀 레이팅 시스템 구현 시 사용
        return [...teams].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'registration':
      default:
        return [...teams];
    }
  }

  // 배열 섞기 (Fisher-Yates 알고리즘)
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // 라운드 이름 생성
  getRoundName(roundNumber, totalRounds) {
    const roundsFromEnd = totalRounds - roundNumber + 1;

    switch (roundsFromEnd) {
      case 1:
        return '결승';
      case 2:
        return '준결승';
      case 3:
        return '준준결승';
      case 4:
        return '8강';
      case 5:
        return '16강';
      case 6:
        return '32강';
      default:
        return `${roundNumber}라운드`;
    }
  }

  // 대진표를 실제 경기로 저장
  async saveBracketMatches(competitionId, bracket) {
    try {
      const matches = [];

      if (bracket.tournament_type === 'mixed') {
        // 그룹 스테이지 경기들
        for (const group of bracket.group_stage.groups) {
          for (const round of group.rounds) {
            for (const match of round.matches) {
              matches.push({
                ...match,
                round_type: 'group',
                group_name: group.group_name
              });
            }
          }
        }
      } else {
        // 일반 토너먼트나 리그전
        for (const round of bracket.rounds) {
          for (const match of round.matches) {
            matches.push({
              ...match,
              round_type: bracket.tournament_type === 'round_robin' ? 'league' : 'knockout'
            });
          }
        }
      }

      // 경기 일정 계산 (기본적으로 7일 간격)
      const startDate = new Date(competition.start_date || new Date());
      const daysBetweenRounds = 7;

      const savedMatches = [];
      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const matchDate = new Date(startDate);
        matchDate.setDate(startDate.getDate() + (match.round - 1) * daysBetweenRounds);

        const savedMatch = await Match.create({
          competition_id: competitionId,
          home_club_id: match.home_club_id,
          away_club_id: match.away_club_id,
          match_date: matchDate,
          venue: match.venue || null,
          status: match.status || 'scheduled',
          round: match.round,
          match_number: match.match_number,
          round_type: match.round_type,
          group_name: match.group_name || null
        });

        savedMatches.push(savedMatch);
      }

      return {
        bracket,
        matches: savedMatches,
        total_matches: savedMatches.length
      };
    } catch (error) {
      throw new Error(`대진표 저장 실패: ${error.message}`);
    }
  }

  // 기존 대진표 조회
  async getBracket(competitionId) {
    try {
      const matches = await Match.findAll({
        where: { competition_id: competitionId },
        include: [
          {
            model: Club,
            as: 'homeClub',
            attributes: ['id', 'name', 'logo_url']
          },
          {
            model: Club,
            as: 'awayClub',
            attributes: ['id', 'name', 'logo_url']
          }
        ],
        order: [['round', 'ASC'], ['match_number', 'ASC']]
      });

      if (matches.length === 0) {
        return null;
      }

      // 라운드별로 그룹화
      const rounds = {};
      matches.forEach(match => {
        const roundKey = match.round_type === 'group'
          ? `${match.round_type}_${match.group_name}`
          : match.round;

        if (!rounds[roundKey]) {
          rounds[roundKey] = [];
        }

        rounds[roundKey].push({
          id: match.id,
          round: match.round,
          match_number: match.match_number,
          home_team: match.homeClub,
          away_team: match.awayClub,
          home_score: match.home_score,
          away_score: match.away_score,
          status: match.status,
          match_date: match.match_date,
          round_type: match.round_type,
          group_name: match.group_name
        });
      });

      return {
        competition_id: competitionId,
        rounds: rounds,
        total_matches: matches.length
      };
    } catch (error) {
      throw new Error(`대진표 조회 실패: ${error.message}`);
    }
  }
}

module.exports = new BracketService();