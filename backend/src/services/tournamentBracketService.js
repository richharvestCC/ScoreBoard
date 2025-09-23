const { Tournament, TournamentBracket, TournamentParticipant, Match, sequelize } = require('../models');
const { Op } = require('sequelize');
const { NotFoundError, ValidationError } = require('../utils/errors');

class TournamentBracketService {
  // Generate knockout bracket for tournament
  async generateBracket(tournamentId, userId) {
    const transaction = await sequelize.transaction();

    try {
      const tournament = await Tournament.findByPk(tournamentId, {
        include: [
          {
            model: TournamentParticipant,
            as: 'participants',
            where: { status: 'active' },
            required: false
          }
        ],
        transaction
      });

      if (!tournament) {
        throw new NotFoundError('Tournament');
      }

      // Check if user is admin
      if (tournament.admin_user_id !== userId) {
        throw new ValidationError('Only tournament admin can generate bracket');
      }

      // Check if bracket already exists
      const existingBracket = await TournamentBracket.findOne({
        where: { tournament_id: tournamentId },
        transaction
      });

      if (existingBracket) {
        throw new ValidationError('Bracket already exists for this tournament');
      }

      // Check tournament format
      if (tournament.format !== 'knockout' && tournament.format !== 'mixed') {
        throw new ValidationError('Bracket can only be generated for knockout or mixed format tournaments');
      }

      const participants = tournament.participants || [];
      const participantCount = participants.length;

      if (participantCount < 2) {
        throw new ValidationError('At least 2 participants required to generate bracket');
      }

      // Calculate number of rounds
      const rounds = Math.ceil(Math.log2(participantCount));
      const totalSlots = Math.pow(2, rounds);
      const byesCount = totalSlots - participantCount;

      // Sort participants by seed
      participants.sort((a, b) => (a.seed_number || 999) - (b.seed_number || 999));

      // Generate bracket matches
      const brackets = [];
      const matches = [];

      // Create first round matches
      const firstRoundMatches = Math.floor(participantCount / 2);
      const firstRoundWithByes = totalSlots / 2;

      for (let i = 0; i < firstRoundWithByes; i++) {
        const homeIndex = i;
        const awayIndex = totalSlots - 1 - i;

        // Handle bye matches - automatically advance the participant to next round
        if (homeIndex >= participantCount || awayIndex >= participantCount) {
          const advancingParticipant = homeIndex < participantCount ? participants[homeIndex] : participants[awayIndex];

          // Create a bye match record for bracket completeness
          const byeMatch = await Match.create({
            tournament_id: tournamentId,
            match_type: 'tournament',
            stage: this.getRoundName(rounds, rounds),
            round_number: rounds,
            match_number: `R${rounds}M${i + 1}`,
            home_club_id: advancingParticipant.participant_type === 'club' ? advancingParticipant.participant_id : null,
            away_club_id: null, // No opponent in bye match
            status: 'completed', // Bye matches are automatically completed
            home_score: 1, // Winner by default
            away_score: 0,
            created_by_user_id: userId
          }, { transaction });

          matches.push(byeMatch);

          // Create bracket entry for bye match
          const byeBracket = {
            tournament_id: tournamentId,
            match_id: byeMatch.id,
            round_number: rounds,
            bracket_position: i + 1,
            home_seed: advancingParticipant.seed_number,
            away_seed: null, // No opponent seed
            next_match_id: null, // Will be updated later
            is_bye: true // Mark as bye match
          };
          brackets.push(byeBracket);
          bracketMap.set(byeMatch.id, byeBracket);
          continue;
        }

        const homeParticipant = participants[homeIndex];
        const awayParticipant = participants[awayIndex];

        // Create match
        const match = await Match.create({
          tournament_id: tournamentId,
          match_type: 'tournament',
          stage: this.getRoundName(rounds, rounds),
          round_number: rounds,
          match_number: `R${rounds}M${i + 1}`,
          home_club_id: homeParticipant.participant_type === 'club' ? homeParticipant.participant_id : null,
          away_club_id: awayParticipant.participant_type === 'club' ? awayParticipant.participant_id : null,
          status: 'scheduled',
          created_by_user_id: userId
        }, { transaction });

        matches.push(match);

        // Create bracket entry
        brackets.push({
          tournament_id: tournamentId,
          match_id: match.id,
          round_number: rounds,
          bracket_position: i + 1,
          home_seed: homeParticipant.seed_number,
          away_seed: awayParticipant.seed_number,
          next_match_id: null // Will be updated later
        });
      }

      // Create subsequent round matches
      let previousRoundMatches = matches;

      for (let round = rounds - 1; round >= 1; round--) {
        const matchesInRound = Math.pow(2, round - 1);
        const roundMatches = [];

        for (let i = 0; i < matchesInRound; i++) {
          // Create match for this round
          const match = await Match.create({
            tournament_id: tournamentId,
            match_type: 'tournament',
            stage: this.getRoundName(rounds, round),
            round_number: round,
            match_number: `R${round}M${i + 1}`,
            status: 'scheduled',
            created_by_user_id: userId
          }, { transaction });

          roundMatches.push(match);

          // Create bracket entry
          brackets.push({
            tournament_id: tournamentId,
            match_id: match.id,
            round_number: round,
            bracket_position: i + 1,
            next_match_id: null
          });

          // Update previous round matches to point to this match
          if (previousRoundMatches.length > i * 2) {
            const match1Index = i * 2;
            const match2Index = i * 2 + 1;

            if (match1Index < brackets.length) {
              const bracket1 = brackets.find(b => b.match_id === previousRoundMatches[match1Index].id);
              if (bracket1) bracket1.next_match_id = match.id;
            }

            if (match2Index < brackets.length && match2Index < previousRoundMatches.length) {
              const bracket2 = brackets.find(b => b.match_id === previousRoundMatches[match2Index].id);
              if (bracket2) bracket2.next_match_id = match.id;
            }
          }
        }

        previousRoundMatches = roundMatches;
      }

      // Create third place match if needed
      if (participantCount >= 4) {
        const thirdPlaceMatch = await Match.create({
          tournament_id: tournamentId,
          match_type: 'tournament',
          stage: '3rd_place',
          match_number: '3RD',
          status: 'scheduled',
          created_by_user_id: userId
        }, { transaction });

        brackets.push({
          tournament_id: tournamentId,
          match_id: thirdPlaceMatch.id,
          round_number: 0,
          bracket_position: 1,
          is_consolation: true,
          next_match_id: null
        });
      }

      // Save all bracket entries
      await TournamentBracket.bulkCreate(brackets, { transaction });

      // Update tournament status
      await tournament.update({ status: 'in_progress' }, { transaction });

      await transaction.commit();

      return {
        message: 'Bracket generated successfully',
        totalMatches: brackets.length,
        rounds: rounds
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Get bracket for tournament
  async getBracket(tournamentId) {
    const tournament = await Tournament.findByPk(tournamentId);

    if (!tournament) {
      throw new NotFoundError('Tournament');
    }

    const brackets = await TournamentBracket.findAll({
      where: { tournament_id: tournamentId },
      include: [
        {
          model: Match,
          as: 'match',
          include: [
            {
              model: require('../models').Club,
              as: 'homeClub',
              attributes: ['id', 'name']
            },
            {
              model: require('../models').Club,
              as: 'awayClub',
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: Match,
          as: 'nextMatch',
          attributes: ['id', 'match_number', 'stage']
        }
      ],
      order: [
        ['round_number', 'DESC'],
        ['bracket_position', 'ASC']
      ]
    });

    // Group by rounds
    const bracketByRounds = {};
    brackets.forEach(bracket => {
      const round = bracket.round_number;
      if (!bracketByRounds[round]) {
        bracketByRounds[round] = [];
      }
      bracketByRounds[round].push(bracket);
    });

    return {
      tournament,
      bracket: bracketByRounds,
      totalMatches: brackets.length
    };
  }

  // Update bracket match result and advance winner
  async updateBracketMatch(matchId, userId) {
    const transaction = await sequelize.transaction();

    try {
      // Find the bracket entry for this match
      const bracket = await TournamentBracket.findOne({
        where: { match_id: matchId },
        include: [
          {
            model: Match,
            as: 'match'
          }
        ],
        transaction
      });

      if (!bracket) {
        throw new NotFoundError('Bracket match');
      }

      const match = bracket.match;

      // Check if match is completed
      if (match.status !== 'completed') {
        throw new ValidationError('Match must be completed to advance winner');
      }

      // Determine winner
      let winnerId = null;
      let winnerType = null;

      if (match.home_score > match.away_score) {
        winnerId = match.home_club_id;
        winnerType = 'club';
      } else if (match.away_score > match.home_score) {
        winnerId = match.away_club_id;
        winnerType = 'club';
      } else {
        throw new ValidationError('Match ended in a draw - tiebreaker needed');
      }

      // If there's a next match, update it with the winner
      if (bracket.next_match_id) {
        const nextMatch = await Match.findByPk(bracket.next_match_id, { transaction });

        if (!nextMatch) {
          throw new NotFoundError('Next match');
        }

        // Determine if winner goes to home or away side
        const nextBracket = await TournamentBracket.findOne({
          where: { match_id: bracket.next_match_id },
          transaction
        });

        const previousMatches = await TournamentBracket.findAll({
          where: {
            next_match_id: bracket.next_match_id,
            match_id: { [Op.ne]: matchId }
          },
          include: [
            {
              model: Match,
              as: 'match'
            }
          ],
          order: [['bracket_position', 'ASC']],
          transaction
        });

        // Winner of lower bracket position goes to home side
        const isHomeSide = bracket.bracket_position % 2 === 1;

        const updateData = {};
        if (isHomeSide) {
          updateData.home_club_id = winnerId;
        } else {
          updateData.away_club_id = winnerId;
        }

        await nextMatch.update(updateData, { transaction });
      }

      // Check if tournament is complete
      const remainingMatches = await Match.count({
        where: {
          tournament_id: bracket.tournament_id,
          status: { [Op.ne]: 'completed' }
        },
        transaction
      });

      if (remainingMatches === 0) {
        const tournament = await Tournament.findByPk(bracket.tournament_id, { transaction });
        await tournament.update({ status: 'completed' }, { transaction });
      }

      await transaction.commit();

      return {
        message: 'Bracket updated successfully',
        winnerId,
        nextMatchId: bracket.next_match_id
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Get round name based on round number
  getRoundName(totalRounds, currentRound) {
    const roundsFromFinal = totalRounds - currentRound + 1;

    switch (roundsFromFinal) {
      case 1: return 'final';
      case 2: return 'semi_final';
      case 3: return 'quarter_final';
      case 4: return 'round_16';
      case 5: return 'round_32';
      case 6: return 'round_64';
      default: return `round_${currentRound}`;
    }
  }
}

module.exports = new TournamentBracketService();