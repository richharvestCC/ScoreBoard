import React from 'react';
import { Box, Button, Drawer, Stack, Typography } from '@mui/material';

const SheetsDemo: React.FC = () => {
  const [openBottom, setOpenBottom] = React.useState(false);
  const [openSide, setOpenSide] = React.useState(false);

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Sheets</Typography>
      <Stack direction="row" spacing={1}>
        <Button variant="outlined" onClick={() => setOpenBottom(true)}>Bottom Sheet</Button>
        <Button variant="contained" onClick={() => setOpenSide(true)}>Side Sheet</Button>
      </Stack>

      <Drawer anchor="bottom" open={openBottom} onClose={() => setOpenBottom(false)}>
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2">Bottom Sheet</Typography>
          <Typography variant="body2" color="text.secondary">간단한 액션이나 보조 설정에 사용합니다.</Typography>
        </Box>
      </Drawer>

      <Drawer anchor="right" open={openSide} onClose={() => setOpenSide(false)}>
        <Box sx={{ width: 320, p: 2, borderLeft: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2">Side Sheet</Typography>
          <Typography variant="body2" color="text.secondary">문맥 관련 상세정보를 표시합니다.</Typography>
        </Box>
      </Drawer>
    </Stack>
  );
};

export default SheetsDemo;

