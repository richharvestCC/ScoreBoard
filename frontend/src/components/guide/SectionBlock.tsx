import React from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';

type Pattern = {
  title: string;
  description: string;
  tokens?: string[];
  content: React.ReactNode;
  fullWidth?: boolean;
};

type SectionProps = {
  id: string;
  icon: React.ReactNode;
  title: string;
  summary: string;
  patterns: Pattern[];
};

const SectionBlock: React.FC<SectionProps> = ({ id, icon, title, summary, patterns }) => (
  <Box id={id} sx={{ mb: 8 }}>
    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 1.5,
          bgcolor: 'primary.50',
          border: '1px solid',
          borderColor: 'primary.100',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'primary.600',
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {summary}
        </Typography>
      </Box>
    </Stack>
    <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' } }}>
      {patterns.map((p, idx) => (
        <Box key={`${id}-${idx}`} sx={{ gridColumn: p.fullWidth ? '1 / -1' : 'auto' }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {p.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {p.description}
              </Typography>
            </Box>
            <Box sx={{ borderRadius: 1, border: '1px dashed', borderColor: 'divider', bgcolor: 'background.default', p: 2 }}>{p.content}</Box>
          </Paper>
        </Box>
      ))}
    </Box>
  </Box>
);

export default SectionBlock;

