import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Sports,
  Schedule,
  LocationOn,
  EmojiEvents,
} from '@mui/icons-material';

interface Team {
  name: string;
  logo?: string;
  score?: number;
}

interface ScoreCardProps {
  homeTeam: Team;
  awayTeam: Team;
  status: 'upcoming' | 'live' | 'finished';
  matchTime: string;
  location?: string;
  competition?: string;
  variant?: 'compact' | 'detailed';
}

/**
 * ScoreCard Component
 * 경기 점수와 정보를 표시하는 스포츠 전용 카드 컴포넌트
 */
const ScoreCard: React.FC<ScoreCardProps> = ({
  homeTeam,
  awayTeam,
  status,
  matchTime,
  location,
  competition,
  variant = 'detailed',
}) => {
  const theme = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return theme.palette.success.main;
      case 'finished':
        return theme.palette.text.secondary;
      case 'upcoming':
        return theme.palette.info.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'live':
        return 'LIVE';
      case 'finished':
        return 'FT';
      case 'upcoming':
        return 'VS';
      default:
        return '';
    }
  };

  const isCompact = variant === 'compact';

  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        borderRadius: 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
          borderColor: alpha(theme.palette.primary.main, 0.3),
        },
        ...(status === 'live' && {
          borderColor: alpha(theme.palette.success.main, 0.3),
          backgroundColor: alpha(theme.palette.success.main, 0.02),
        }),
      }}
    >
      <CardContent sx={{ p: isCompact ? 2 : 3 }}>
        {/* Header: Competition & Status */}
        {!isCompact && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmojiEvents fontSize="small" color="action" />
              <Typography
                variant="caption"
                color="textSecondary"
                fontWeight={500}
              >
                {competition || 'Championship'}
              </Typography>
            </Box>
            <Chip
              label={getStatusText(status)}
              size="small"
              sx={{
                backgroundColor: alpha(getStatusColor(status), 0.1),
                color: getStatusColor(status),
                fontWeight: 600,
                fontSize: '0.75rem',
                ...(status === 'live' && {
                  animation: 'pulse 2s infinite',
                }),
              }}
            />
          </Box>
        )}

        {/* Teams & Score */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: isCompact ? 1 : 2 }}>
          {/* Home Team */}
          <Box sx={{ flex: 1, textAlign: 'left' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {homeTeam.logo && (
                <Box
                  sx={{
                    width: isCompact ? 24 : 32,
                    height: isCompact ? 24 : 32,
                    borderRadius: '50%',
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Sports fontSize="small" color="primary" />
                </Box>
              )}
              <Typography
                variant={isCompact ? 'body2' : 'h6'}
                fontWeight={600}
                noWrap
              >
                {homeTeam.name}
              </Typography>
            </Box>
          </Box>

          {/* Score or VS */}
          <Box
            sx={{
              mx: 2,
              textAlign: 'center',
              minWidth: isCompact ? 40 : 60,
            }}
          >
            {status === 'upcoming' ? (
              <Typography
                variant={isCompact ? 'body2' : 'h6'}
                color="textSecondary"
                fontWeight={500}
              >
                VS
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant={isCompact ? 'h6' : 'h4'}
                  fontWeight={700}
                  color="primary"
                >
                  {homeTeam.score}
                </Typography>
                <Typography
                  variant={isCompact ? 'body2' : 'h6'}
                  color="textSecondary"
                >
                  -
                </Typography>
                <Typography
                  variant={isCompact ? 'h6' : 'h4'}
                  fontWeight={700}
                  color="primary"
                >
                  {awayTeam.score}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Away Team */}
          <Box sx={{ flex: 1, textAlign: 'right' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 1,
              }}
            >
              <Typography
                variant={isCompact ? 'body2' : 'h6'}
                fontWeight={600}
                noWrap
              >
                {awayTeam.name}
              </Typography>
              {awayTeam.logo && (
                <Box
                  sx={{
                    width: isCompact ? 24 : 32,
                    height: isCompact ? 24 : 32,
                    borderRadius: '50%',
                    backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Sports fontSize="small" color="secondary" />
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {!isCompact && <Divider sx={{ my: 2 }} />}

        {/* Match Info */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Schedule fontSize="small" color="action" />
            <Typography variant="caption" color="textSecondary">
              {matchTime}
            </Typography>
          </Box>
          {location && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn fontSize="small" color="action" />
              <Typography variant="caption" color="textSecondary" noWrap>
                {location}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Compact mode status chip */}
        {isCompact && (
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
            <Chip
              label={getStatusText(status)}
              size="small"
              sx={{
                backgroundColor: alpha(getStatusColor(status), 0.1),
                color: getStatusColor(status),
                fontWeight: 600,
                fontSize: '0.75rem',
                height: 20,
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ScoreCard;