import React from 'react';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';

type PatternCardProps = {
  title: string;
  description: string;
  tokens?: string[];
  children: React.ReactNode;
};

const PatternCard: React.FC<PatternCardProps> = ({ title, description, tokens, children }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider',
      bgcolor: 'background.paper',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    }}
  >
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Box>
    <Box sx={{ borderRadius: 1, border: '1px dashed', borderColor: 'divider', bgcolor: 'background.default', p: 2 }}>
      {children}
    </Box>
    {tokens && tokens.length > 0 && (
      <Stack direction="row" spacing={1} flexWrap="wrap">
        {tokens.map((token) => (
          <Chip key={token} label={token} size="small" variant="outlined" />
        ))}
      </Stack>
    )}
  </Paper>
);

export default PatternCard;

