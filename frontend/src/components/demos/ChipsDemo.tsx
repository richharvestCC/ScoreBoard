import React from 'react';
import { Avatar, Chip, Stack, Typography } from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import AddIcon from '@mui/icons-material/Add';

const ChipsDemo: React.FC = () => {
  const [selected, setSelected] = React.useState<string[]>(['A']);
  const toggle = (v: string) => setSelected((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]));

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Chips</Typography>
      {/* Assist chips */}
      <Stack direction="row" spacing={1} flexWrap="wrap">
        <Chip icon={<AddIcon />} label="Assist" variant="outlined" />
        <Chip label="Assist (filled)" color="primary" />
      </Stack>
      {/* Input chips */}
      <Stack direction="row" spacing={1} flexWrap="wrap">
        <Chip avatar={<Avatar>MC</Avatar>} label="Input" onDelete={() => void 0} />
        <Chip label="Removable" onDelete={() => void 0} variant="outlined" />
      </Stack>
      {/* Filter chips */}
      <Stack direction="row" spacing={1} flexWrap="wrap">
        {['A', 'B', 'C'].map((k) => (
          <Chip
            key={k}
            label={`Filter ${k}`}
            variant={selected.includes(k) ? 'filled' : 'outlined'}
            color={selected.includes(k) ? 'primary' : 'default'}
            onClick={() => toggle(k)}
            icon={selected.includes(k) ? <DoneIcon /> : undefined}
          />
        ))}
      </Stack>
      {/* Suggestion chips (그냥 추천 스타일로 표기) */}
      <Stack direction="row" spacing={1} flexWrap="wrap">
        <Chip label="Suggestion" clickable />
        <Chip label="Suggestion" clickable variant="outlined" />
      </Stack>
    </Stack>
  );
};

export default ChipsDemo;

