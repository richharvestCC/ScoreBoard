import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  useTheme,
  alpha,
  Avatar,
} from '@mui/material';
import { Sports, TrendingUp, TrendingDown } from '@mui/icons-material';

interface TeamStanding {
  position: number;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ('W' | 'L' | 'D')[];
  logo?: string;
}

interface StandingsTableProps {
  standings: TeamStanding[];
  title?: string;
  highlightPositions?: {
    champion?: number[];
    uefa?: number[];
    relegation?: number[];
  };
}

/**
 * StandingsTable Component
 * 리그 순위표를 표시하는 스포츠 전용 테이블 컴포넌트
 */
const StandingsTable: React.FC<StandingsTableProps> = ({
  standings,
  title = 'League Table',
  highlightPositions = {
    champion: [1],
    uefa: [2, 3, 4],
    relegation: [18, 19, 20],
  },
}) => {
  const theme = useTheme();

  const getPositionColor = (position: number) => {
    if (highlightPositions.champion?.includes(position)) {
      return theme.palette.warning.main; // Gold for champion
    }
    if (highlightPositions.uefa?.includes(position)) {
      return theme.palette.info.main; // Blue for UEFA
    }
    if (highlightPositions.relegation?.includes(position)) {
      return theme.palette.error.main; // Red for relegation
    }
    return 'transparent';
  };

  const getFormColor = (result: 'W' | 'L' | 'D') => {
    switch (result) {
      case 'W':
        return theme.palette.success.main;
      case 'L':
        return theme.palette.error.main;
      case 'D':
        return theme.palette.warning.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          backgroundColor: alpha(theme.palette.background.paper, 0.5),
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          {title}
        </Typography>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, width: 50 }}>Pos</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Team</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, width: 50 }}>
                P
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, width: 50 }}>
                W
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, width: 50 }}>
                D
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, width: 50 }}>
                L
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, width: 70 }}>
                GF
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, width: 70 }}>
                GA
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, width: 70 }}>
                GD
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, width: 60 }}>
                Pts
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, width: 120 }}>
                Form
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {standings.map((team, index) => (
              <TableRow
                key={team.position}
                sx={{
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  },
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    backgroundColor: getPositionColor(team.position),
                  },
                }}
              >
                {/* Position */}
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {team.position}
                    </Typography>
                    {index > 0 && (
                      <>
                        {team.position < standings[index - 1]?.position && (
                          <TrendingUp
                            fontSize="small"
                            sx={{ color: theme.palette.success.main }}
                          />
                        )}
                        {team.position > standings[index - 1]?.position && (
                          <TrendingDown
                            fontSize="small"
                            sx={{ color: theme.palette.error.main }}
                          />
                        )}
                      </>
                    )}
                  </Box>
                </TableCell>

                {/* Team */}
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 24,
                        height: 24,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      }}
                    >
                      {team.logo ? (
                        <img src={team.logo} alt={team.teamName} />
                      ) : (
                        <Sports fontSize="small" color="primary" />
                      )}
                    </Avatar>
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 150,
                      }}
                    >
                      {team.teamName}
                    </Typography>
                  </Box>
                </TableCell>

                {/* Stats */}
                <TableCell align="center">
                  <Typography variant="body2">{team.played}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" color="success.main">
                    {team.won}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" color="warning.main">
                    {team.drawn}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" color="error.main">
                    {team.lost}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">{team.goalsFor}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">{team.goalsAgainst}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography
                    variant="body2"
                    color={
                      team.goalDifference > 0
                        ? 'success.main'
                        : team.goalDifference < 0
                        ? 'error.main'
                        : 'textSecondary'
                    }
                    fontWeight={500}
                  >
                    {team.goalDifference > 0 ? '+' : ''}
                    {team.goalDifference}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color="primary.main"
                  >
                    {team.points}
                  </Typography>
                </TableCell>

                {/* Form */}
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                    {team.form.slice(-5).map((result, formIndex) => (
                      <Chip
                        key={formIndex}
                        label={result}
                        size="small"
                        sx={{
                          minWidth: 20,
                          height: 20,
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          backgroundColor: alpha(getFormColor(result), 0.1),
                          color: getFormColor(result),
                          '& .MuiChip-label': {
                            px: 0.5,
                          },
                        }}
                      />
                    ))}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Legend */}
      {highlightPositions && (
        <Box
          sx={{
            p: 2,
            backgroundColor: alpha(theme.palette.background.default, 0.3),
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          }}
        >
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {highlightPositions.champion && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    backgroundColor: theme.palette.warning.main,
                    borderRadius: 1,
                  }}
                />
                <Typography variant="caption" color="textSecondary">
                  Champion
                </Typography>
              </Box>
            )}
            {highlightPositions.uefa && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    backgroundColor: theme.palette.info.main,
                    borderRadius: 1,
                  }}
                />
                <Typography variant="caption" color="textSecondary">
                  UEFA
                </Typography>
              </Box>
            )}
            {highlightPositions.relegation && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    backgroundColor: theme.palette.error.main,
                    borderRadius: 1,
                  }}
                />
                <Typography variant="caption" color="textSecondary">
                  Relegation
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default StandingsTable;