import React from 'react';
import { Box, LinearProgress, CircularProgress, Stack, Typography, Button } from '@mui/material';

const ProgressDemo: React.FC = () => {
  const [value, setValue] = React.useState(40);

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2">Progress</Typography>
      <Stack spacing={1}>
        <Typography variant="caption" color="text.secondary">Linear – determinate</Typography>
        <LinearProgress variant="determinate" value={value} />
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={() => setValue((v) => Math.max(0, v - 10))}>-10%</Button>
          <Button size="small" variant="contained" onClick={() => setValue((v) => Math.min(100, v + 10))}>+10%</Button>
        </Stack>
      </Stack>
      <Stack spacing={1}>
        <Typography variant="caption" color="text.secondary">Linear – indeterminate</Typography>
        <LinearProgress />
      </Stack>
      <Stack direction="row" spacing={3} alignItems="center">
        <Box>
          <Typography variant="caption" color="text.secondary">Circular – determinate</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 0.5 }}>
            <CircularProgress variant="determinate" value={value} />
          </Box>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">Circular – indeterminate</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 0.5 }}>
            <CircularProgress />
          </Box>
        </Box>
      </Stack>
    </Stack>
  );
};

export default ProgressDemo;

