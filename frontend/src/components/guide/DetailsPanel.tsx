import React from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';

type Props = {
  code?: string;
  tokens?: string;
  accessibility?: string;
};

const DetailsPanel: React.FC<Props> = ({ code, tokens, accessibility }) => {
  const [tab, setTab] = React.useState(0);
  const tabs = [
    code ? { label: 'Code', content: code } : null,
    tokens ? { label: 'Tokens', content: tokens } : null,
    accessibility ? { label: 'A11y', content: accessibility } : null,
  ].filter(Boolean) as { label: string; content: string }[];

  if (tabs.length === 0) return null;

  return (
    <Box sx={{ mt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" aria-label="details tabs">
        {tabs.map((t, i) => (
          <Tab key={t.label} label={t.label} id={`details-tab-${i}`} />
        ))}
      </Tabs>
      <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
        <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
          {tabs[tab].content}
        </Typography>
      </Box>
    </Box>
  );
};

export default DetailsPanel;

