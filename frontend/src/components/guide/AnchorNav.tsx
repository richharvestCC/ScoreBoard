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

const isSafeHref = (href: string) => {
  const trimmed = href.trim().toLowerCase();
  // allow in-page anchors, site-relative paths, and http(s) only
  return (
    trimmed.startsWith('#') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  );
};

const sanitizeHref = (href: string) => (isSafeHref(href) ? href : '#');

const AnchorNav: React.FC<Props> = ({ items, activeId, variant, stickyOffset = 88, cta, sx }) => {
  if (variant === 'quick') {
    return (
      <Stack direction="row" spacing={1} flexWrap="wrap" sx={sx}>
        {items.map((item) => {
          const href = sanitizeHref(item.href);
          const isExternal = href.startsWith('http');
          return (
            <Button
              key={item.href}
              size="small"
              variant={activeId === item.id ? 'contained' : 'outlined'}
              component="a"
              href={href}
              aria-current={activeId === item.id ? 'page' : undefined}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
            >
              {item.label}
            </Button>
          );
        })}
        {cta && (
          <Button size="small" variant="contained" endIcon={cta.endIcon} component="a" href={sanitizeHref(cta.href)}>
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
          {items.map((item) => {
            const href = sanitizeHref(item.href);
            const isExternal = href.startsWith('http');
            return (
              <Button
                key={item.href}
                component="a"
                href={href}
                color={activeId === item.id ? 'primary' : 'inherit'}
                variant={activeId === item.id ? 'contained' : 'text'}
                size="small"
                sx={{ justifyContent: 'flex-start' }}
                aria-current={activeId === item.id ? 'page' : undefined}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                role="link"
              >
                {item.label}
              </Button>
            );
          })}
        </Stack>
      </Paper>
    </Box>
  );
};

export default AnchorNav;
