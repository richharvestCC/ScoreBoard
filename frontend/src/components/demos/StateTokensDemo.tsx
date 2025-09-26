import React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';

const StateTokensDemo: React.FC = () => (
  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
    <Box sx={{ flex: 1, borderRadius: 1, border: '1px solid', borderColor: 'divider', p: 2, bgcolor: 'action.hover' }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Hover state
      </Typography>
      <Button fullWidth>Hover example</Button>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Background: rgba(0,0,0,0.04)
      </Typography>
    </Box>
    <Box sx={{ flex: 1, borderRadius: 1, border: '1px solid', borderColor: 'divider', p: 2, bgcolor: 'action.selected' }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Pressed state
      </Typography>
      <Button fullWidth>Pressed example</Button>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Background: rgba(0,0,0,0.08)
      </Typography>
    </Box>
    <Box sx={{ flex: 1, borderRadius: 1, border: '1px solid', borderColor: 'divider', p: 2 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Focus state
      </Typography>
      <Box sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', outline: '2px solid', outlineColor: 'primary.main', outlineOffset: '2px', p: 1 }}>
        <Button fullWidth>Focus example</Button>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Outline: 2px primary.main
      </Typography>
    </Box>
  </Stack>
);

export default StateTokensDemo;

