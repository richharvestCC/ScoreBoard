import React from 'react';
import { Slider, Stack, Typography } from '@mui/material';

const SlidersDemo: React.FC = () => {
  const [value, setValue] = React.useState<number>(30);
  const [range, setRange] = React.useState<number[]>([20, 60]);

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2">Sliders</Typography>
      <Stack spacing={1}>
        <Typography variant="caption" color="text.secondary">Single value</Typography>
        <Slider value={value} onChange={(_, v) => setValue(v as number)} aria-label="single-slider" />
      </Stack>
      <Stack spacing={1}>
        <Typography variant="caption" color="text.secondary">Range</Typography>
        <Slider value={range} onChange={(_, v) => setRange(v as number[])} aria-label="range-slider" />
      </Stack>
    </Stack>
  );
};

export default SlidersDemo;

