import React from 'react';
import { Box, Button, Paper, Stack } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

export type AnchorItem = { id: string; href: string; label: string };

type Props = {
  items: AnchorItem[];
  activeId: string | null;
  variant: 'sidebar' | 'quick';
  stickyOffset?: number;
  cta?: { label: string; href: string; endIcon?: React.ReactNode };
  sx?: SxProps<Theme>;
};

const AnchorNav: React.FC<Props> = ({ items, activeId, variant, stickyOffset = 88, cta, sx }) => {
  if (variant === 'quick') {
    return (
      <Stack direction="row" spacing={1} flexWrap="wrap" sx={sx}>
        {items.map((item) => (
          <Button key={item.href} size="small" variant={activeId === item.id ? 'contained' : 'outlined'} component="a" href={item.href}>
            {item.label}
          </Button>
        ))}
        {cta && (
          <Button size="small" variant="contained" endIcon={cta.endIcon} component="a" href={cta.href}>
            {cta.label}
          </Button>
        )}
      </Stack>
    );
  }

  // sidebar
  return (
    <Box sx={sx}>
      <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', position: 'sticky', top: stickyOffset }}>
        <Stack spacing={1}>
          {items.map((item) => (
            <Button
              key={item.href}
              component="a"
              href={item.href}
              color={activeId === item.id ? 'primary' : 'inherit'}
              variant={activeId === item.id ? 'contained' : 'text'}
              size="small"
              sx={{ justifyContent: 'flex-start' }}
            >
              {item.label}
            </Button>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
};

export default AnchorNav;

