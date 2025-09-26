import React from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';

function a11yProps(index: number) {
  return {
    id: `demo-tab-${index}`,
    'aria-controls': `demo-tabpanel-${index}`,
  } as const;
}

const TabsDemo: React.FC = () => {
  const [value, setValue] = React.useState(0);

  return (
    <Box>
      <Tabs value={value} onChange={(_, v) => setValue(v)} aria-label="tabs demo" variant="scrollable" scrollButtons allowScrollButtonsMobile>
        <Tab label="개요" {...a11yProps(0)} />
        <Tab label="통계" {...a11yProps(1)} />
        <Tab label="기록" {...a11yProps(2)} />
      </Tabs>
      <Box role="tabpanel" id={`demo-tabpanel-${value}`} aria-labelledby={`demo-tab-${value}`} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderTop: 'none', borderRadius: 1 }}>
        {value === 0 && <Typography variant="body2">대회 개요 정보를 표시합니다.</Typography>}
        {value === 1 && <Typography variant="body2">주요 지표와 차트를 표시합니다.</Typography>}
        {value === 2 && <Typography variant="body2">경기별 상세 기록을 표시합니다.</Typography>}
      </Box>
    </Box>
  );
};

export default TabsDemo;

