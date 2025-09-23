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
  Avatar,
  Chip
} from '@mui/material';
import { EmojiEvents, TrendingUp, TrendingDown } from '@mui/icons-material';

const LeagueStandings = ({ standings, loading = false }) => {
  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>순위표를 불러오는 중...</Typography>
      </Box>
    );
  }

  if (!standings || standings.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>순위 데이터가 없습니다.</Typography>
      </Box>
    );
  }

  const getPositionColor = (position) => {
    if (position <= 3) return 'gold';
    if (position <= 6) return 'primary';
    if (position >= standings.length - 2) return 'error';
    return 'default';
  };

  const getPositionIcon = (position) => {
    if (position === 1) return <EmojiEvents sx={{ color: '#FFD700' }} />;
    if (position === 2) return <EmojiEvents sx={{ color: '#C0C0C0' }} />;
    if (position === 3) return <EmojiEvents sx={{ color: '#CD7F32' }} />;
    return null;
  };

  return (
    <Paper elevation={2} sx={{ overflow: 'hidden' }}>
      <Box sx={{ p: 2, backgroundColor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" component="h3">
          리그 순위표
        </Typography>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.50' }}>
              <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 60 }}>
                순위
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 200 }}>
                팀명
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 60 }}>
                경기
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 60 }}>
                승
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 60 }}>
                무
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 60 }}>
                패
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 80 }}>
                득점
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 80 }}>
                실점
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 80 }}>
                득실차
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 60 }}>
                승점
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {standings.map((team, index) => (
              <TableRow
                key={team.club_id}
                sx={{
                  '&:hover': { backgroundColor: 'grey.50' },
                  backgroundColor: team.position <= 3 ? 'primary.50' :
                                  team.position >= standings.length - 2 ? 'error.50' : 'transparent'
                }}
              >
                <TableCell align="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <Chip
                      label={team.position}
                      size="small"
                      color={getPositionColor(team.position)}
                      variant={team.position <= 3 ? 'filled' : 'outlined'}
                    />
                    {getPositionIcon(team.position)}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                      sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
                    >
                      {team.club_name.charAt(0)}
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {team.club_name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">{team.matches_played}</TableCell>
                <TableCell align="center">
                  <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 500 }}>
                    {team.wins}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 500 }}>
                    {team.draws}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 500 }}>
                    {team.losses}
                  </Typography>
                </TableCell>
                <TableCell align="center">{team.goals_for}</TableCell>
                <TableCell align="center">{team.goals_against}</TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    {team.goal_difference > 0 && <TrendingUp sx={{ color: 'success.main', fontSize: 16 }} />}
                    {team.goal_difference < 0 && <TrendingDown sx={{ color: 'error.main', fontSize: 16 }} />}
                    <Typography
                      variant="body2"
                      sx={{
                        color: team.goal_difference > 0 ? 'success.main' :
                               team.goal_difference < 0 ? 'error.main' : 'text.primary',
                        fontWeight: 500
                      }}
                    >
                      {team.goal_difference > 0 ? '+' : ''}{team.goal_difference}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {team.points}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default LeagueStandings;