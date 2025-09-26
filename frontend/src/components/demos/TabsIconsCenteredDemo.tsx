import React from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import BarChartIcon from '@mui/icons-material/BarChart';
import ListAltIcon from '@mui/icons-material/ListAlt';

const TabsIconsCenteredDemo: React.FC = () => {
  const [value, setValue] = React.useState(0);
  return (
    <Box>
      <Tabs value={value} onChange={(_, v) => setValue(v)} centered aria-label="tabs icons centered">
        <Tab icon={<InfoIcon />} iconPosition="start" label="개요" />
        <Tab icon={<BarChartIcon />} iconPosition="start" label="통계" />
        <Tab icon={<ListAltIcon />} iconPosition="start" label="기록" />
      </Tabs>
    </Box>
  );
};

export default TabsIconsCenteredDemo;

