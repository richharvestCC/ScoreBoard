import React from 'react';
import { Box, Chip, Stack, TextField, Typography } from '@mui/material';

const ChipsInputDemo: React.FC = () => {
  const [chips, setChips] = React.useState<string[]>(['서울', '부산']);
  const [input, setInput] = React.useState('');

  const addChip = () => {
    const v = input.trim();
    if (v && !chips.includes(v)) setChips((c) => [...c, v]);
    setInput('');
  };
  const removeChip = (v: string) => setChips((c) => c.filter((x) => x !== v));

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Chips – input variant</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <TextField
          label="지역 추가"
          placeholder="예: 대구"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addChip();
            }
          }}
          size="small"
        />
        <Box>
          <button style={{ display: 'none' }} />
        </Box>
      </Stack>
      <Stack direction="row" spacing={1} flexWrap="wrap">
        {chips.map((c) => (
          <Chip key={c} label={c} onDelete={() => removeChip(c)} />
        ))}
      </Stack>
    </Stack>
  );
};

export default ChipsInputDemo;

