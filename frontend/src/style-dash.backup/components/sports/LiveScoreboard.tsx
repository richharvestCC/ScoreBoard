import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
  LinearProgress,
  IconButton,
  useTheme,
  alpha,
  keyframes,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Sports,
  Timer,
} from '@mui/icons-material';

interface LiveScoreboardProps {
  homeTeam: {
    name: string;
    score: number;
    logo?: string;
  };
  awayTeam: {
    name: string;
    score: number;
    logo?: string;
  };
  matchTime: number; // minutes
  period: 'first-half' | 'second-half' | 'half-time' | 'full-time';
  isLive?: boolean;
  events?: Array<{
    time: number;
    type: 'goal' | 'yellow-card' | 'red-card' | 'substitution';
    team: 'home' | 'away';
    player: string;
  }>;
}

// Pulse animation for live indicator
const pulseAnimation = keyframes`
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

/**
 * LiveScoreboard Component
 * 실시간 경기 스코어보드를 표시하는 컴포넌트
 */
const LiveScoreboard: React.FC<LiveScoreboardProps> = ({
  homeTeam,
  awayTeam,
  matchTime,
  period,
  isLive = false,
  events = [],
}) => {
  const theme = useTheme();
  const [currentTime, setCurrentTime] = useState(matchTime);

  // Simulate live time updates
  useEffect(() => {
    if (isLive && period !== 'full-time' && period !== 'half-time') {
      const interval = setInterval(() => {
        setCurrentTime((prev) => prev + 1);
      }, 60000); // Update every minute for demo

      return () => clearInterval(interval);
    }
  }, [isLive, period]);

  const getPeriodText = (period: string) => {
    switch (period) {
      case 'first-half':
        return '1st Half';
      case 'second-half':
        return '2nd Half';
      case 'half-time':
        return 'HT';
      case 'full-time':
        return 'FT';
      default:
        return '';
    }
  };

  const getPeriodColor = (period: string) => {
    switch (period) {
      case 'first-half':
      case 'second-half':
        return isLive ? theme.palette.success.main : theme.palette.info.main;
      case 'half-time':
        return theme.palette.warning.main;
      case 'full-time':
        return theme.palette.text.secondary;
      default:
        return theme.palette.text.secondary;
    }
  };

  const getMatchProgress = () => {
    const maxTime = period === 'first-half' ? 45 : 90;
    return Math.min((currentTime / maxTime) * 100, 100);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: `2px solid ${
          isLive
            ? alpha(theme.palette.success.main, 0.3)
            : alpha(theme.palette.divider, 0.12)
        }`,
        borderRadius: 3,
        overflow: 'hidden',
        backgroundColor: isLive
          ? alpha(theme.palette.success.main, 0.02)
          : theme.palette.background.paper,
        ...(isLive && {
          animation: `${pulseAnimation} 2s ease-in-out infinite`,
        }),
      }}
    >
      {/* Header with live indicator and time */}
      <Box
        sx={{
          p: 2,
          backgroundColor: alpha(
            isLive ? theme.palette.success.main : theme.palette.background.default,
            0.05
          ),
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            label={getPeriodText(period)}
            size="small"
            sx={{
              backgroundColor: alpha(getPeriodColor(period), 0.1),
              color: getPeriodColor(period),
              fontWeight: 600,
            }}
          />
          {isLive && (
            <Chip
              label="LIVE"
              size="small"
              sx={{
                backgroundColor: alpha(theme.palette.success.main, 0.1),
                color: theme.palette.success.main,
                fontWeight: 700,
                animation: `${pulseAnimation} 2s ease-in-out infinite`,
              }}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Timer fontSize="small" color="action" />
          <Typography
            variant="h6"
            fontWeight={700}
            color="primary"
            sx={{ minWidth: 40, textAlign: 'center' }}
          >
            {currentTime}'
          </Typography>
        </Box>
      </Box>

      {/* Match progress bar */}
      {(period === 'first-half' || period === 'second-half') && (
        <LinearProgress
          variant="determinate"
          value={getMatchProgress()}
          sx={{
            height: 6,
            backgroundColor: alpha(theme.palette.divider, 0.1),
            '& .MuiLinearProgress-bar': {
              backgroundColor: isLive
                ? theme.palette.success.main
                : theme.palette.info.main,
            },
          }}
        />
      )}

      {/* Main scoreboard */}
      <Box sx={{ p: 4 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          {/* Home Team */}
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {homeTeam.logo ? (
                  <img
                    src={homeTeam.logo}
                    alt={homeTeam.name}
                    style={{ width: 32, height: 32 }}
                  />
                ) : (
                  <Sports fontSize="large" color="primary" />
                )}
              </Box>
            </Box>
            <Typography
              variant="h5"
              fontWeight={600}
              gutterBottom
              sx={{ lineHeight: 1.2 }}
            >
              {homeTeam.name}
            </Typography>
            <Typography
              variant="h2"
              fontWeight={700}
              color="primary"
              sx={{
                fontSize: { xs: '3rem', md: '4rem' },
                lineHeight: 1,
              }}
            >
              {homeTeam.score}
            </Typography>
          </Box>

          {/* VS Divider */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Divider
              orientation="vertical"
              sx={{
                height: 80,
                borderWidth: 2,
                borderColor: alpha(theme.palette.divider, 0.2),
              }}
            />
            <Typography
              variant="body2"
              color="textSecondary"
              fontWeight={500}
            >
              VS
            </Typography>
          </Box>

          {/* Away Team */}
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {awayTeam.logo ? (
                  <img
                    src={awayTeam.logo}
                    alt={awayTeam.name}
                    style={{ width: 32, height: 32 }}
                  />
                ) : (
                  <Sports fontSize="large" color="secondary" />
                )}
              </Box>
            </Box>
            <Typography
              variant="h5"
              fontWeight={600}
              gutterBottom
              sx={{ lineHeight: 1.2 }}
            >
              {awayTeam.name}
            </Typography>
            <Typography
              variant="h2"
              fontWeight={700}
              color="primary"
              sx={{
                fontSize: { xs: '3rem', md: '4rem' },
                lineHeight: 1,
              }}
            >
              {awayTeam.score}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Recent Events */}
      {events.length > 0 && (
        <>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Typography
              variant="subtitle2"
              color="textSecondary"
              gutterBottom
              fontWeight={600}
            >
              Recent Events
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {events.slice(-3).map((event, index) => (
                <Chip
                  key={index}
                  label={`${event.time}' ${event.player} ${
                    event.type === 'goal' ? '⚽' :
                    event.type === 'yellow-card' ? '🟨' :
                    event.type === 'red-card' ? '🟥' : '🔄'
                  }`}
                  size="small"
                  sx={{
                    backgroundColor: alpha(
                      event.type === 'goal'
                        ? theme.palette.success.main
                        : event.type === 'yellow-card'
                        ? theme.palette.warning.main
                        : event.type === 'red-card'
                        ? theme.palette.error.main
                        : theme.palette.info.main,
                      0.1
                    ),
                  }}
                />
              ))}
            </Box>
          </Box>
        </>
      )}

      {/* Control buttons (for demo purposes) */}
      {isLive && (
        <>
          <Divider />
          <Box
            sx={{
              p: 1,
              display: 'flex',
              justifyContent: 'center',
              gap: 1,
              backgroundColor: alpha(theme.palette.background.default, 0.3),
            }}
          >
            <IconButton size="small">
              <PlayArrow />
            </IconButton>
            <IconButton size="small">
              <Pause />
            </IconButton>
            <IconButton size="small">
              <Stop />
            </IconButton>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default LiveScoreboard;