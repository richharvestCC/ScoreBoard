import React from 'react';
import { Box, LinearProgress, Stack, Typography, Stepper, Step, StepLabel } from '@mui/material';

function LinearWithLabel({ value }: { value: number }) {
  return (
    <Box sx={{ position: 'relative' }}>
      <LinearProgress variant="determinate" value={value} />
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="caption" color="text.secondary">{`${Math.round(value)}%`}</Typography>
      </Box>
    </Box>
  );
}

const ProgressAdvancedDemo: React.FC = () => {
  const [value, setValue] = React.useState(25);
  React.useEffect(() => {
    const id = setInterval(() => setValue((v) => (v >= 100 ? 0 : v + 5)), 800);
    return () => clearInterval(id);
  }, []);

  const steps = ['초기화', '데이터 수집', '검증', '완료'];
  const activeStep = Math.min(Math.floor(value / 25), steps.length - 1);

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2">Progress – labels & steps</Typography>
      <LinearWithLabel value={value} />
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Stack>
  );
};

export default ProgressAdvancedDemo;

