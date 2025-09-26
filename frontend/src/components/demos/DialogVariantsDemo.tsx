import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Slide, Stack, TextField, Typography } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DialogVariantsDemo: React.FC = () => {
  const [openForm, setOpenForm] = React.useState(false);
  const [openScroll, setOpenScroll] = React.useState(false);
  const [openTrans, setOpenTrans] = React.useState(false);

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Dialog variants</Typography>
      <Stack direction="row" spacing={1}>
        <Button variant="outlined" onClick={() => setOpenForm(true)}>폼 다이얼로그</Button>
        <Button variant="outlined" onClick={() => setOpenScroll(true)}>스크롤 다이얼로그</Button>
        <Button variant="contained" onClick={() => setOpenTrans(true)}>전환 다이얼로그</Button>
      </Stack>

      {/* Form dialog */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">팀 정보 수정</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField size="small" label="팀명" placeholder="Seoul Phoenix" fullWidth />
            <TextField size="small" label="감독" placeholder="홍길동" fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>취소</Button>
          <Button variant="contained" onClick={() => setOpenForm(false)}>저장</Button>
        </DialogActions>
      </Dialog>

      {/* Scroll dialog */}
      <Dialog open={openScroll} onClose={() => setOpenScroll(false)} scroll="paper" aria-labelledby="scroll-dialog-title">
        <DialogTitle id="scroll-dialog-title">대회 규정</DialogTitle>
        <DialogContent dividers>
          <DialogContentText>
            {Array.from({ length: 20 })
              .map((_, i) => `규정 항목 ${i + 1}. 경기 진행 및 참가자 준수사항. `)
              .join(' ')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenScroll(false)}>닫기</Button>
        </DialogActions>
      </Dialog>

      {/* Transition dialog */}
      <Dialog open={openTrans} TransitionComponent={Transition} onClose={() => setOpenTrans(false)} keepMounted aria-labelledby="transition-dialog-title">
        <DialogTitle id="transition-dialog-title">변경 사항 적용</DialogTitle>
        <DialogContent>
          <DialogContentText>변경 사항을 적용하기 위해 페이지가 새로고침됩니다.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTrans(false)}>취소</Button>
          <Button variant="contained" onClick={() => setOpenTrans(false)}>확인</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default DialogVariantsDemo;

