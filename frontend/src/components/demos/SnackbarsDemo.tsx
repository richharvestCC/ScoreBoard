import React from 'react';
import { Alert, Button, Snackbar, Stack, Typography } from '@mui/material';

const SnackbarsDemo: React.FC = () => {
  const [openInfo, setOpenInfo] = React.useState(false);
  const [openSuccess, setOpenSuccess] = React.useState(false);

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Snackbars & Banners</Typography>
      <Stack direction="row" spacing={1}>
        <Button variant="outlined" onClick={() => setOpenInfo(true)}>Snackbar</Button>
        <Button variant="contained" color="success" onClick={() => setOpenSuccess(true)}>Success Banner</Button>
      </Stack>

      <Snackbar open={openInfo} autoHideDuration={3000} onClose={() => setOpenInfo(false)} message="데이터를 불러왔습니다." />

      {openSuccess && (
        <Alert severity="success" onClose={() => setOpenSuccess(false)} sx={{ borderRadius: 1 }}>
          저장이 완료되었습니다.
        </Alert>
      )}
    </Stack>
  );
};

export default SnackbarsDemo;

