import React from 'react';
import { Alert, Button, Collapse, Stack, Typography } from '@mui/material';

const BannersAdvancedDemo: React.FC = () => {
  const [open, setOpen] = React.useState(true);
  const [queued, setQueued] = React.useState<string[]>([]);

  const enqueue = (msg: string) => setQueued((q) => [...q, msg]);
  const dequeue = () => setQueued((q) => q.slice(1));

  React.useEffect(() => {
    if (queued.length > 0) {
      const timer = setTimeout(dequeue, 2500);
      return () => clearTimeout(timer);
    }
  }, [queued]);

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Banners – advanced</Typography>
      <Stack direction="row" spacing={1}>
        <Button variant="contained" color="warning" onClick={() => setOpen((o) => !o)}>
          배너 토글
        </Button>
        <Button variant="outlined" onClick={() => enqueue('백그라운드 동기화 완료')}>큐 추가</Button>
        <Button variant="outlined" color="success" onClick={() => enqueue('새 버전이 배포되었습니다')}>성공 큐</Button>
      </Stack>

      <Collapse in={open}>
        <Alert severity="warning" onClose={() => setOpen(false)} sx={{ borderRadius: 1 }} action={<Button color="inherit" size="small">자세히</Button>}>
          오늘 예정된 점검이 있습니다. 일부 기능이 제한될 수 있습니다.
        </Alert>
      </Collapse>

      <Stack spacing={1}>
        {queued.map((m, i) => (
          <Alert key={`${m}-${i}`} severity="info" sx={{ borderRadius: 1 }}>
            {m}
          </Alert>
        ))}
      </Stack>
    </Stack>
  );
};

export default BannersAdvancedDemo;

