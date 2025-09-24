/**
 * MatchCard - Individual Match Display Component
 * Material Design 3 + React 18 + TypeScript
 */

import React, { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  useTheme
} from '@mui/material';
import {
  Edit as EditIcon,
  Sports as SportsIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import {
  Match,
  Team,
  MatchStatus
} from '../../../../types/tournament';
import { useResponsive } from '../shared/ResponsiveLayout';

// Styled Components
const StyledMatchCard = styled(Card)<{ status: MatchStatus; isCompact?: boolean }>(
  ({ theme, status, isCompact }) => ({
    background: alpha(theme.palette.background.paper, 0.8),
    backdropFilter: 'blur(10px)',
    border: `1px solid ${
      status === 'completed'
        ? alpha(theme.palette.success.main, 0.3)
        : status === 'in_progress'
        ? alpha(theme.palette.warning.main, 0.3)
        : alpha(theme.palette.divider, 0.12)
    }`,
    borderRadius: theme.shape.borderRadius * 1.5,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'visible',

    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[4],
      background: alpha(theme.palette.background.paper, 0.9)
    },

    '&::before': status === 'in_progress' ? {
      content: '""',
      position: 'absolute',
      top: -1,
      left: -1,
      right: -1,
      bottom: -1,
      borderRadius: 'inherit',
      background: `linear-gradient(45deg, ${theme.palette.warning.main}, ${theme.palette.warning.light})`,
      zIndex: -1,
      animation: 'pulse 2s ease-in-out infinite alternate'
    } : {},

    '@keyframes pulse': {
      '0%': {
        opacity: 0.5
      },
      '100%': {
        opacity: 1
      }
    }
  })
);

const TeamSection = styled(Box)<{ isWinner?: boolean }>(({ theme, isWinner }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  background: isWinner
    ? alpha(theme.palette.primary.main, 0.1)
    : 'transparent',
  border: isWinner
    ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
    : '1px solid transparent',
  transition: 'all 0.3s ease',
  position: 'relative',

  '&::before': isWinner ? {
    content: '"🏆"',
    position: 'absolute',
    top: -8,
    right: -8,
    fontSize: '16px',
    background: theme.palette.primary.main,
    borderRadius: '50%',
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  } : {}
}));

const ScoreDisplay = styled(Typography)<{ isWinner?: boolean; isLarge?: boolean }>(
  ({ theme, isWinner, isLarge }) => ({
    fontWeight: 700,
    fontSize: isLarge ? '2rem' : '1.5rem',
    color: isWinner
      ? theme.palette.primary.main
      : theme.palette.text.primary,
    textAlign: 'center',
    minWidth: isLarge ? '60px' : '40px',
    textShadow: isWinner ? `0 2px 4px ${alpha(theme.palette.primary.main, 0.3)}` : 'none'
  })
);

const StatusIndicator = styled(Box)<{ status: MatchStatus }>(({ theme, status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          color: theme.palette.success.main,
          icon: CheckIcon,
          text: '경기 종료'
        };
      case 'in_progress':
        return {
          color: theme.palette.warning.main,
          icon: SportsIcon,
          text: '경기 중'
        };
      case 'pending':
        return {
          color: theme.palette.info.main,
          icon: ScheduleIcon,
          text: '예정'
        };
      case 'cancelled':
        return {
          color: theme.palette.error.main,
          icon: CancelIcon,
          text: '취소'
        };
      default:
        return {
          color: theme.palette.grey[500],
          icon: ScheduleIcon,
          text: '알 수 없음'
        };
    }
  };

  const config = getStatusConfig();

  return {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    color: config.color,
    '& .status-icon': {
      fontSize: '1rem'
    }
  };
});

// Utility Functions
const getTeamInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const formatMatchDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Props Interfaces
interface MatchCardProps {
  match: Match;
  onScoreUpdate?: (matchId: string, team1Score: number, team2Score: number) => void;
  onMatchClick?: (match: Match) => void;
  compact?: boolean;
  showDate?: boolean;
  editable?: boolean;
}

interface ScoreEditDialogProps {
  open: boolean;
  match: Match;
  onClose: () => void;
  onSave: (team1Score: number, team2Score: number) => void;
}

// Score Edit Dialog Component
const ScoreEditDialog: React.FC<ScoreEditDialogProps> = ({
  open,
  match,
  onClose,
  onSave
}) => {
  const [team1Score, setTeam1Score] = useState(match.score1?.toString() || '');
  const [team2Score, setTeam2Score] = useState(match.score2?.toString() || '');

  const handleSave = useCallback(() => {
    const score1 = parseInt(team1Score) || 0;
    const score2 = parseInt(team2Score) || 0;
    onSave(score1, score2);
    onClose();
  }, [team1Score, team2Score, onSave, onClose]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="score-edit-dialog-title"
    >
      <DialogTitle id="score-edit-dialog-title">
        경기 결과 입력
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={5}>
            <Box textAlign="center">
              <Typography variant="h6" gutterBottom>
                {match.team1?.name || 'TBD'}
              </Typography>
              <TextField
                label="득점"
                type="number"
                value={team1Score}
                onChange={(e) => setTeam1Score(e.target.value)}
                inputProps={{ min: 0, 'aria-label': `${match.team1?.name || 'TBD'} 득점` }}
                fullWidth
              />
            </Box>
          </Grid>
          <Grid item xs={2}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              height="100%"
            >
              <Typography variant="h4" color="text.secondary">
                :
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={5}>
            <Box textAlign="center">
              <Typography variant="h6" gutterBottom>
                {match.team2?.name || 'TBD'}
              </Typography>
              <TextField
                label="득점"
                type="number"
                value={team2Score}
                onChange={(e) => setTeam2Score(e.target.value)}
                inputProps={{ min: 0, 'aria-label': `${match.team2?.name || 'TBD'} 득점` }}
                fullWidth
              />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          취소
        </Button>
        <Button onClick={handleSave} variant="contained">
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Component
const MatchCard: React.FC<MatchCardProps> = ({
  match,
  onScoreUpdate,
  onMatchClick,
  compact = false,
  showDate = true,
  editable = true
}) => {
  const theme = useTheme();
  const { config } = useResponsive();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const isCompact = compact || config.device !== 'desktop';

  const handleCardClick = useCallback(() => {
    onMatchClick?.(match);
  }, [match, onMatchClick]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  }, [handleCardClick]);

  const handleEditClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setEditDialogOpen(true);
  }, []);

  const handleScoreSave = useCallback((team1Score: number, team2Score: number) => {
    onScoreUpdate?.(match.id, team1Score, team2Score);
  }, [match.id, onScoreUpdate]);

  const getStatusConfig = () => {
    switch (match.status) {
      case 'completed':
        return {
          color: 'success' as const,
          icon: CheckIcon,
          text: '완료'
        };
      case 'in_progress':
        return {
          color: 'warning' as const,
          icon: SportsIcon,
          text: '진행중'
        };
      case 'pending':
        return {
          color: 'info' as const,
          icon: ScheduleIcon,
          text: '대기'
        };
      case 'cancelled':
        return {
          color: 'error' as const,
          icon: CancelIcon,
          text: '취소'
        };
      default:
        return {
          color: 'default' as const,
          icon: ScheduleIcon,
          text: '알 수 없음'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <>
      <StyledMatchCard
        status={match.status}
        isCompact={isCompact}
        onClick={handleCardClick}
        onKeyDown={handleKeyPress}
        elevation={2}
        role="button"
        tabIndex={0}
        aria-label={`경기: ${match.team1?.name || 'TBD'} vs ${match.team2?.name || 'TBD'}, 상태: ${getStatusConfig().text}`}
      >
        <CardContent sx={{ p: isCompact ? 1.5 : 2 }}>
          {/* Header with status and edit button */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Chip
              icon={<StatusIcon className="status-icon" />}
              label={statusConfig.text}
              color={statusConfig.color}
              size="small"
              variant="outlined"
            />

            <Box display="flex" alignItems="center" gap={1}>
              {showDate && match.matchDate && (
                <Typography variant="caption" color="text.secondary">
                  {formatMatchDate(match.matchDate)}
                </Typography>
              )}
              {editable && match.status !== 'cancelled' && (
                <IconButton
                  size="small"
                  onClick={handleEditClick}
                  aria-label="경기 결과 수정"
                  sx={{
                    opacity: 0.7,
                    '&:hover': { opacity: 1 }
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>

          {/* Teams and Scores */}
          <Box>
            {/* Team 1 */}
            <TeamSection isWinner={match.winner?.id === match.team1?.id}>
              <Avatar
                sx={{
                  bgcolor: match.team1?.logoUrl ? 'transparent' : 'primary.main',
                  width: isCompact ? 32 : 40,
                  height: isCompact ? 32 : 40,
                  mr: 1.5
                }}
                src={match.team1?.logoUrl}
              >
                {match.team1 ? getTeamInitials(match.team1.name) : '?'}
              </Avatar>

              <Box flex={1}>
                <Typography
                  variant={isCompact ? "body2" : "h6"}
                  fontWeight={match.winner?.id === match.team1?.id ? 600 : 400}
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {match.team1?.name || 'TBD'}
                </Typography>
              </Box>

              <ScoreDisplay
                isWinner={match.winner?.id === match.team1?.id}
                isLarge={!isCompact}
              >
                {match.score1 ?? '-'}
              </ScoreDisplay>
            </TeamSection>

            {/* VS Divider */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              py={1}
            >
              <Typography
                variant={isCompact ? "body2" : "h6"}
                color="text.secondary"
                fontWeight={600}
              >
                VS
              </Typography>
            </Box>

            {/* Team 2 */}
            <TeamSection isWinner={match.winner?.id === match.team2?.id}>
              <Avatar
                sx={{
                  bgcolor: match.team2?.logoUrl ? 'transparent' : 'secondary.main',
                  width: isCompact ? 32 : 40,
                  height: isCompact ? 32 : 40,
                  mr: 1.5
                }}
                src={match.team2?.logoUrl}
              >
                {match.team2 ? getTeamInitials(match.team2.name) : '?'}
              </Avatar>

              <Box flex={1}>
                <Typography
                  variant={isCompact ? "body2" : "h6"}
                  fontWeight={match.winner?.id === match.team2?.id ? 600 : 400}
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {match.team2?.name || 'TBD'}
                </Typography>
              </Box>

              <ScoreDisplay
                isWinner={match.winner?.id === match.team2?.id}
                isLarge={!isCompact}
              >
                {match.score2 ?? '-'}
              </ScoreDisplay>
            </TeamSection>
          </Box>

          {/* Match Type Indicator */}
          {match.type !== 'tournament' && (
            <Box mt={1} display="flex" justifyContent="center">
              <Chip
                label={match.type === 'group' ? '조별예선' : match.type}
                size="small"
                variant="filled"
                sx={{ fontSize: '0.7rem' }}
              />
            </Box>
          )}
        </CardContent>
      </StyledMatchCard>

      {/* Score Edit Dialog */}
      <ScoreEditDialog
        open={editDialogOpen}
        match={match}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleScoreSave}
      />
    </>
  );
};

export default MatchCard;