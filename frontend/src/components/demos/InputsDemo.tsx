import React from 'react';
import { Box, Button, Checkbox, CircularProgress, FormControl, FormControlLabel, InputLabel, MenuItem, Radio, Select, Stack, Switch, TextField, Typography } from '@mui/material';

const InputsDemo: React.FC = () => (
  <Stack spacing={3}>
    {/* Text fields */}
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Text fields</Typography>
      <TextField size="small" label="대회 이름" placeholder="MatchCard Cup" fullWidth />
      <TextField size="small" label="대회 이름" error helperText="이름을 입력하세요." fullWidth />
      <TextField size="small" label="대회 이름" disabled placeholder="Disabled" fullWidth />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <FormControl fullWidth size="small">
          <InputLabel id="inputs-demo-round">라운드</InputLabel>
          <Select labelId="inputs-demo-round" label="라운드" defaultValue={16}>
            {[16, 8, 4].map((v) => (
              <MenuItem key={v} value={v}>{v}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField label="경기 요약" multiline minRows={3} placeholder="핵심 내용을 입력" fullWidth />
      </Stack>
    </Stack>

    {/* Switch / Checkbox / Radio */}
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Selection controls</Typography>
      <Stack direction="row" spacing={3} flexWrap="wrap" alignItems="center">
        <Stack spacing={0.5} alignItems="center">
          <Switch defaultChecked />
          <Typography variant="caption" color="text.secondary">활성</Typography>
        </Stack>
        <Stack spacing={0.5} alignItems="center">
          <Switch />
          <Typography variant="caption" color="text.secondary">비활성</Typography>
        </Stack>
        <Stack spacing={0.5} alignItems="center">
          <Switch disabled defaultChecked />
          <Typography variant="caption" color="text.secondary">Disabled</Typography>
        </Stack>
        <FormControlLabel control={<Checkbox defaultChecked />} label="승인" />
        <FormControlLabel control={<Checkbox />} label="보류" />
        <FormControlLabel control={<Checkbox disabled />} label="Disabled" />
        <FormControlLabel control={<Radio defaultChecked />} label="옵션 A" />
        <FormControlLabel control={<Radio />} label="옵션 B" />
        <FormControlLabel control={<Radio disabled />} label="Disabled" />
      </Stack>
    </Stack>

    {/* Button states */}
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Buttons</Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap">
        <Button variant="contained">활성</Button>
        <Button variant="contained" disabled>비활성</Button>
        <Button variant="contained" color="secondary" startIcon={<CircularProgress size={16} color="inherit" />}>로딩</Button>
      </Stack>
    </Stack>
  </Stack>
);

export default InputsDemo;

