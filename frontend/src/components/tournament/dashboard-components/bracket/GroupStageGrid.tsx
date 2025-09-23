/**
 * GroupStageGrid - Group Stage Tournament Display Component
 * Material Design 3 + React 18 + TypeScript
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  useTheme,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Sports as SportsIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import {
  Group,
  GroupStanding,
  Match,
  GroupStageProps,
  MatchStatus
} from '../../../../types/tournament';
import { useResponsive } from '../shared/ResponsiveLayout';

// Styled Components
const GroupContainer = styled(Paper)(({ theme }) => ({
  background: alpha(theme.palette.surface?.container || theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',

  '&:hover': {
    background: alpha(theme.palette.surface?.containerHigh || theme.palette.background.paper, 0.9),
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4]
  }
}));

const GroupHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
}));

const StandingsTable = styled(Table)(({ theme }) => ({
  '& .MuiTableHead-root': {
    '& .MuiTableCell-head': {
      backgroundColor: alpha(theme.palette.surface?.containerLow || theme.palette.background.default, 0.5),
      fontWeight: 600,
      fontSize: '0.75rem',
      color: theme.palette.text.secondary
    }
  },
  '& .MuiTableBody-root': {
    '& .MuiTableRow-root': {
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.04)
      }
    }
  }
}));

const MatchCard = styled(Paper)<{ status: MatchStatus }>(({ theme, status }) => ({
  padding: theme.spacing(1.5),
  margin: theme.spacing(1, 0),
  background: status === 'completed'
    ? alpha(theme.palette.success.main, 0.1)
    : status === 'in_progress'
    ? alpha(theme.palette.warning.main, 0.1)
    : alpha(theme.palette.surface?.container || theme.palette.background.paper, 0.7),
  border: `1px solid ${
    status === 'completed'
      ? alpha(theme.palette.success.main, 0.3)
      : status === 'in_progress'
      ? alpha(theme.palette.warning.main, 0.3)
      : alpha(theme.palette.divider, 0.12)
  }`,
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',

  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: theme.shadows[2]
  }
}));

const TeamName = styled(Typography)<{ isWinner?: boolean }>(({ theme, isWinner }) => ({
  fontWeight: isWinner ? 600 : 400,
  color: isWinner ? theme.palette.primary.main : theme.palette.text.primary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
}));

const ScoreDisplay = styled(Typography)<{ isWinner?: boolean }>(({ theme, isWinner }) => ({
  fontWeight: 600,
  fontSize: '1.1rem',
  color: isWinner ? theme.palette.primary.main : theme.palette.text.primary,
  minWidth: '24px',
  textAlign: 'center'
}));

// Utility Functions
const getPositionColor = (position: number): string => {
  switch (position) {
    case 1:
      return '#FFD700'; // Gold
    case 2:
      return '#C0C0C0'; // Silver
    case 3:
      return '#CD7F32'; // Bronze
    default:
      return 'transparent';
  }
};

const getStatusColor = (status: MatchStatus): 'default' | 'success' | 'warning' | 'info' => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'in_progress':
      return 'warning';
    case 'pending':
      return 'default';
    default:
      return 'info';
  }
};

const getStatusText = (status: MatchStatus): string => {
  switch (status) {
    case 'completed':
      return '완료';
    case 'in_progress':
      return '진행중';
    case 'pending':
      return '대기';
    case 'cancelled':
      return '취소';
    default:
      return '알 수 없음';
  }
};

// Sub-components
interface MatchDisplayProps {
  match: Match;
  onMatchUpdate: (matchId: string, score1: number, score2: number) => void;
  isCompact: boolean;
}

const MatchDisplay: React.FC<MatchDisplayProps> = ({
  match,
  onMatchUpdate,
  isCompact
}) => {
  const handleClick = useCallback(() => {
    if (match.status === 'pending') {
      // Future: Open score input modal
      console.log('Open score input for match:', match.id);
    }
  }, [match]);

  return (
    <MatchCard status={match.status} onClick={handleClick}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box flex={1}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
            <TeamName
              variant={isCompact ? "caption" : "body2"}
              isWinner={match.winner?.id === match.team1?.id}
            >
              {match.team1?.name || 'TBD'}
            </TeamName>
            <ScoreDisplay
              variant={isCompact ? "caption" : "body2"}
              isWinner={match.winner?.id === match.team1?.id}
            >
              {match.score1 ?? '-'}
            </ScoreDisplay>
          </Box>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <TeamName
              variant={isCompact ? "caption" : "body2"}
              isWinner={match.winner?.id === match.team2?.id}
            >
              {match.team2?.name || 'TBD'}
            </TeamName>
            <ScoreDisplay
              variant={isCompact ? "caption" : "body2"}
              isWinner={match.winner?.id === match.team2?.id}
            >
              {match.score2 ?? '-'}
            </ScoreDisplay>
          </Box>
        </Box>

        <Box ml={2} display="flex" alignItems="center" gap={1}>
          <Chip
            label={getStatusText(match.status)}
            color={getStatusColor(match.status)}
            size="small"
            variant="outlined"
          />
          {match.matchDate && (
            <Typography variant="caption" color="text.secondary">
              {new Date(match.matchDate).toLocaleDateString('ko-KR')}
            </Typography>
          )}
        </Box>
      </Box>
    </MatchCard>
  );
};

interface GroupDisplayProps {
  group: Group;
  onMatchUpdate: (matchId: string, score1: number, score2: number) => void;
  onStandingsUpdate: (groupId: string) => void;
  isCompact: boolean;
}

const GroupDisplay: React.FC<GroupDisplayProps> = ({
  group,
  onMatchUpdate,
  onStandingsUpdate,
  isCompact
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = useCallback(() => {
    setExpanded(prev => !prev);
  }, []);

  const qualifiedTeams = useMemo(() => {
    return group.standings.filter(standing => standing.position <= 2); // Top 2 qualify
  }, [group.standings]);

  return (
    <GroupContainer elevation={2}>
      <GroupHeader>
        <Box display="flex" alignItems="center" gap={1}>
          <SportsIcon />
          <Typography variant="h6" fontWeight={600}>
            그룹 {group.name}
          </Typography>
          <Chip
            label={`${group.teams.length}팀`}
            size="small"
            sx={{ color: 'inherit', borderColor: 'currentColor' }}
            variant="outlined"
          />
        </Box>
        <IconButton
          onClick={handleToggle}
          sx={{ color: 'inherit' }}
        >
          <ExpandMoreIcon
            sx={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }}
          />
        </IconButton>
      </GroupHeader>

      <Accordion expanded={expanded} onChange={handleToggle} elevation={0}>
        <AccordionSummary sx={{ display: 'none' }} />
        <AccordionDetails sx={{ padding: 0 }}>
          <Grid container spacing={2} sx={{ p: 2 }}>
            {/* Standings Table */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                순위표
              </Typography>
              <StandingsTable size={isCompact ? "small" : "medium"}>
                <TableHead>
                  <TableRow>
                    <TableCell>순위</TableCell>
                    <TableCell>팀</TableCell>
                    <TableCell align="center">경기</TableCell>
                    <TableCell align="center">승</TableCell>
                    <TableCell align="center">무</TableCell>
                    <TableCell align="center">패</TableCell>
                    <TableCell align="center">득점</TableCell>
                    <TableCell align="center">실점</TableCell>
                    <TableCell align="center">득실차</TableCell>
                    <TableCell align="center">승점</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {group.standings.map((standing) => (
                    <TableRow key={standing.team.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: getPositionColor(standing.position)
                            }}
                          />
                          {standing.position}
                          {standing.position <= 2 && (
                            <TrophyIcon sx={{ fontSize: 16, color: 'gold' }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight={standing.position <= 2 ? 600 : 400}
                        >
                          {standing.team.name}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">{standing.played}</TableCell>
                      <TableCell align="center">{standing.won}</TableCell>
                      <TableCell align="center">{standing.drawn}</TableCell>
                      <TableCell align="center">{standing.lost}</TableCell>
                      <TableCell align="center">{standing.goalsFor}</TableCell>
                      <TableCell align="center">{standing.goalsAgainst}</TableCell>
                      <TableCell align="center">
                        <Typography
                          variant="body2"
                          color={standing.goalDifference > 0 ? 'success.main' :
                                standing.goalDifference < 0 ? 'error.main' : 'text.primary'}
                        >
                          {standing.goalDifference > 0 ? '+' : ''}{standing.goalDifference}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight={600}>
                          {standing.points}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </StandingsTable>
            </Grid>

            {/* Matches */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                경기 일정
              </Typography>
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {group.matches.map((match) => (
                  <MatchDisplay
                    key={match.id}
                    match={match}
                    onMatchUpdate={onMatchUpdate}
                    isCompact={isCompact}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </GroupContainer>
  );
};

// Main Component
const GroupStageGrid: React.FC<GroupStageProps> = ({
  groups,
  onMatchUpdate,
  onStandingsUpdate
}) => {
  const { config } = useResponsive();
  const isCompact = config.device !== 'desktop';

  const totalTeams = useMemo(() => {
    return groups.reduce((sum, group) => sum + group.teams.length, 0);
  }, [groups]);

  const completedMatches = useMemo(() => {
    return groups.reduce((sum, group) =>
      sum + group.matches.filter(match => match.status === 'completed').length, 0
    );
  }, [groups]);

  const totalMatches = useMemo(() => {
    return groups.reduce((sum, group) => sum + group.matches.length, 0);
  }, [groups]);

  return (
    <Box sx={{ p: 2 }}>
      {/* Header Stats */}
      <Box
        sx={{
          mb: 3,
          p: 2,
          background: (theme) => alpha(theme.palette.surface?.container || theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.12)}`
        }}
      >
        <Typography variant="h5" gutterBottom fontWeight={600}>
          조별 예선
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="text.secondary">
              총 그룹 수
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {groups.length}개
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="text.secondary">
              참가 팀
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {totalTeams}팀
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="text.secondary">
              경기 진행률
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0}%
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="text.secondary">
              완료 경기
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {completedMatches}/{totalMatches}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Groups Grid */}
      <Grid container spacing={3}>
        {groups.map((group) => (
          <Grid item xs={12} lg={6} key={group.id}>
            <GroupDisplay
              group={group}
              onMatchUpdate={onMatchUpdate}
              onStandingsUpdate={onStandingsUpdate}
              isCompact={isCompact}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default GroupStageGrid;