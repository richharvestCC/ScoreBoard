import React from 'react';
import { Box, BoxProps, useTheme } from '@mui/material';
import { designTokens } from '../../theme/designTokens';

interface PageContainerProps extends BoxProps {
  children: React.ReactNode;
}

const PageContainer: React.FC<PageContainerProps> = ({ children, sx, ...rest }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: '100%',
        py: { xs: 2, md: 4 },
        [designTokens.mediaQueries.maxMobile]: {
          px: designTokens.spacing.scale.md,
        },
        [designTokens.mediaQueries.minTablet]: {
          px: designTokens.spacing.scale.lg,
        },
        [designTokens.mediaQueries.minDesktop]: {
          px: designTokens.spacing.scale.xl,
        },
        maxWidth: {
          xs: designTokens.containerMaxWidth.mobile,
          sm: designTokens.containerMaxWidth.tablet,
          md: designTokens.containerMaxWidth.desktop,
          lg: designTokens.containerMaxWidth.largeDesktop,
          xl: designTokens.containerMaxWidth.extraLarge,
        },
        mx: 'auto',
        color: theme.palette.text.primary,
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
};

export default React.memo(PageContainer);
