import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack, Typography } from '@mui/material';

const DialogsDemo: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [openConfirm, setOpenConfirm] = React.useState(false);

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Dialogs</Typography>
      <Stack direction="row" spacing={1}>
        <Button variant="outlined" onClick={() => setOpen(true)}>표준 다이얼로그</Button>
        <Button variant="contained" onClick={() => setOpenConfirm(true)}>확인 다이얼로그</Button>
      </Stack>

      <Dialog open={open} onClose={() => setOpen(false)} aria-labelledby="demo-dialog-title">
        <DialogTitle id="demo-dialog-title">환경 설정</DialogTitle>
        <DialogContent>
          <DialogContentText>
            매치카드 애플리케이션의 기본 설정을 조정할 수 있습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>닫기</Button>
          <Button variant="contained" onClick={() => setOpen(false)}>저장</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)} aria-labelledby="confirm-dialog-title">
        <DialogTitle id="confirm-dialog-title">삭제하시겠습니까?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            이 작업은 되돌릴 수 없습니다. 계속하시겠습니까?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setOpenConfirm(false)}>취소</Button>
          <Button variant="contained" color="error" onClick={() => setOpenConfirm(false)}>삭제</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default DialogsDemo;

