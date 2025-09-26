import React from 'react';
import { Stack, TextField, Typography } from '@mui/material';

const DateTimeInputsDemo: React.FC = () => {
  const [date, setDate] = React.useState<string>('');
  const [time, setTime] = React.useState<string>('');
  const [dt, setDt] = React.useState<string>('');

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Date / Time inputs</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label="날짜"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
        />
        <TextField
          label="시간"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
        />
        <TextField
          label="일시"
          type="datetime-local"
          value={dt}
          onChange={(e) => setDt(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
        />
      </Stack>
      <Typography variant="caption" color="text.secondary">
        브라우저 네이티브 컨트롤을 사용하며, 국제화/고급 피커가 필요하면 X Date Pickers로 교체하세요.
      </Typography>
    </Stack>
  );
};

export default DateTimeInputsDemo;

