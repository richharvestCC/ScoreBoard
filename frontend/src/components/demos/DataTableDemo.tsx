import React from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TableSortLabel, Typography } from '@mui/material';

type Row = { team: string; pts: number; rank: number };

const rows: Row[] = [
  { team: 'Falcons', pts: 24, rank: 1 },
  { team: 'Dragons', pts: 21, rank: 2 },
  { team: 'Lions', pts: 18, rank: 3 },
];

const DataTableDemo: React.FC = () => {
  const [orderBy, setOrderBy] = React.useState<keyof Row>('rank');
  const [order, setOrder] = React.useState<'asc' | 'desc'>('asc');

  const sorted = React.useMemo(() => {
    return [...rows].sort((a, b) => {
      const dir = order === 'asc' ? 1 : -1;
      return a[orderBy] < b[orderBy] ? -1 * dir : a[orderBy] > b[orderBy] ? 1 * dir : 0;
    });
  }, [order, orderBy]);

  const handleSort = (key: keyof Row) => {
    setOrderBy(key);
    setOrder((p) => (key === orderBy ? (p === 'asc' ? 'desc' : 'asc') : 'asc'));
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>Data table</Typography>
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
        <Table size="small" aria-label="data table">
          <TableHead>
            <TableRow>
              <TableCell sortDirection={orderBy === 'team' ? order : false}>
                <TableSortLabel active={orderBy === 'team'} direction={orderBy === 'team' ? order : 'asc'} onClick={() => handleSort('team')}>
                  Team
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'pts' ? order : false} align="right">
                <TableSortLabel active={orderBy === 'pts'} direction={orderBy === 'pts' ? order : 'asc'} onClick={() => handleSort('pts')}>
                  Pts
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'rank' ? order : false} align="right">
                <TableSortLabel active={orderBy === 'rank'} direction={orderBy === 'rank' ? order : 'asc'} onClick={() => handleSort('rank')}>
                  Rank
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map((row, idx) => (
              <TableRow key={row.team} sx={{ bgcolor: idx % 2 ? 'background.default' : 'background.paper' }}>
                <TableCell>{row.team}</TableCell>
                <TableCell align="right">{row.pts}</TableCell>
                <TableCell align="right">{row.rank}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DataTableDemo;

