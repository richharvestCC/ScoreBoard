import React, { useMemo, useState, useCallback } from 'react';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const MotionDemo: React.FC = () => {
  const theme = useTheme();
  const [mode, setMode] = useState<'fast' | 'standard' | 'large'>('fast');
  const [active, setActive] = useState(false);

  const durations: Record<'fast' | 'standard' | 'large', number> = useMemo(
    () => ({ fast: 120, standard: 200, large: 240 }),
    []
  );

  const handleToggle = useCallback(() => setActive((v) => !v), []);
  const currentDuration = durations[mode];

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} flexWrap="wrap">
        {(['fast', 'standard', 'large'] as const).map((key) => (
          <Chip
            key={key}
            label={key === 'fast' ? 'Fast · 120ms' : key === 'standard' ? 'Standard · 200ms' : 'Large · 240ms'}
            color={mode === key ? 'primary' : 'default'}
            variant={mode === key ? 'filled' : 'outlined'}
            onClick={() => setMode(key)}
            sx={{ cursor: 'pointer' }}
          />
        ))}
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center">
        <Button variant="contained" size="small" onClick={handleToggle}>
          {active ? 'Animate (reverse)' : 'Animate'}
        </Button>
        <Typography variant="body2" color="text.secondary">
          Duration: {currentDuration}ms · easing: ease-out
        </Typography>
      </Stack>
      <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 120, px: 1 }}>
        <Box
          sx={{
            width: 160,
            height: 80,
            borderRadius: 2,
            bgcolor: active ? 'primary.300' : 'primary.100',
            transform: active ? 'translateX(140px)' : 'translateX(0)',
            transition: theme.transitions.create(['transform', 'background-color', 'box-shadow'], {
              duration: currentDuration,
              easing: theme.transitions.easing.easeOut,
            }),
            boxShadow: active ? 4 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
          }}
        >
          Card
        </Box>
      </Box>
    </Stack>
  );
};

export default MotionDemo;

