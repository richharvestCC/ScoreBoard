import React from 'react';
import { ToggleButton, ToggleButtonGroup, Typography, Stack } from '@mui/material';

const SegmentedButtonsDemo: React.FC = () => {
  const [value, setValue] = React.useState<string>('day');
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">Segmented buttons</Typography>
      <ToggleButtonGroup
        color="primary"
        value={value}
        exclusive
        onChange={(_, v) => v && setValue(v)}
        aria-label="segmented"
        size="small"
      >
        <ToggleButton value="day" aria-label="day">일간</ToggleButton>
        <ToggleButton value="week" aria-label="week">주간</ToggleButton>
        <ToggleButton value="month" aria-label="month">월간</ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  );
};

export default SegmentedButtonsDemo;

