import React from 'react';
import { Box, SpeedDial, SpeedDialAction, SpeedDialIcon, Typography, Stack } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ShareIcon from '@mui/icons-material/Share';
import AddIcon from '@mui/icons-material/Add';

const FABDemo: React.FC = () => (
  <Stack spacing={1}>
    <Typography variant="subtitle2">FAB & Speed dial</Typography>
    <Box sx={{ height: 160, position: 'relative', border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
      <SpeedDial ariaLabel="fab-demo" sx={{ position: 'absolute', bottom: 16, right: 16 }} icon={<SpeedDialIcon openIcon={<EditIcon />} /> }>
        <SpeedDialAction icon={<AddIcon />} tooltipTitle="새로 만들기" />
        <SpeedDialAction icon={<ShareIcon />} tooltipTitle="공유" />
      </SpeedDial>
    </Box>
  </Stack>
);

export default FABDemo;

