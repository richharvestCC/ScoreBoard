import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';

interface ColorTokenProps {
  name: string;
  value: string;
  description?: string;
}

interface SpacingTokenProps {
  name: string;
  value: number;
  description?: string;
}

interface TypographyTokenProps {
  variant: string;
  example: string;
  description?: string;
}

/**
 * ColorToken Component
 * 색상 토큰을 시각적으로 표시하는 컴포넌트
 */
export const ColorToken: React.FC<ColorTokenProps> = ({ name, value, description }) => {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        borderRadius: 2,
        height: '100%',
      }}
    >
      <Box
        sx={{
          height: 80,
          backgroundColor: value,
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.getContrastText(value),
            fontWeight: 500,
            textShadow: '0 1px 2px rgba(0,0,0,0.1)',
          }}
        >
          {name}
        </Typography>
      </Box>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {value}
        </Typography>
        {description && (
          <Typography variant="caption" color="textSecondary">
            {description}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * SpacingToken Component
 * 간격 토큰을 시각적으로 표시하는 컴포넌트
 */
export const SpacingToken: React.FC<SpacingTokenProps> = ({ name, value, description }) => {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        borderRadius: 2,
        p: 2,
        height: '100%',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" fontWeight={600} sx={{ mr: 1 }}>
          {name}
        </Typography>
        <Chip
          label={`${value}px`}
          size="small"
          sx={{
            height: 20,
            fontSize: '0.75rem',
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
          }}
        />
      </Box>

      {/* Visual representation */}
      <Box
        sx={{
          position: 'relative',
          height: 40,
          backgroundColor: alpha(theme.palette.background.default, 0.5),
          borderRadius: 1,
          mb: 1,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: 0,
            transform: 'translateY(-50%)',
            width: value,
            height: 4,
            backgroundColor: theme.palette.primary.main,
            borderRadius: 1,
          }}
        />
      </Box>

      {description && (
        <Typography variant="caption" color="textSecondary">
          {description}
        </Typography>
      )}
    </Card>
  );
};

/**
 * TypographyToken Component
 * 타이포그래피 토큰을 시각적으로 표시하는 컴포넌트
 */
export const TypographyToken: React.FC<TypographyTokenProps> = ({
  variant,
  example,
  description,
}) => {
  const theme = useTheme();
  const variantKey = variant as keyof typeof theme.typography;
  const typographyStyle = theme.typography[variantKey];

  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        borderRadius: 2,
        p: 3,
        height: '100%',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" fontWeight={600} sx={{ mr: 1 }}>
          {variant}
        </Typography>
        <Chip
          label={typeof typographyStyle === 'object' ? typographyStyle.fontSize : ''}
          size="small"
          sx={{
            height: 20,
            fontSize: '0.75rem',
            backgroundColor: alpha(theme.palette.secondary.main, 0.1),
            color: theme.palette.secondary.main,
          }}
        />
      </Box>

      <Typography variant={variant as any} sx={{ mb: 2, lineHeight: 1.4 }}>
        {example}
      </Typography>

      <Box>
        <Typography variant="caption" color="textSecondary" display="block">
          Font Size: {typeof typographyStyle === 'object' ? typographyStyle.fontSize : 'inherit'}
        </Typography>
        <Typography variant="caption" color="textSecondary" display="block">
          Font Weight: {typeof typographyStyle === 'object' ? typographyStyle.fontWeight : 'inherit'}
        </Typography>
        <Typography variant="caption" color="textSecondary" display="block">
          Line Height: {typeof typographyStyle === 'object' ? typographyStyle.lineHeight : 'inherit'}
        </Typography>
      </Box>

      {description && (
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
          {description}
        </Typography>
      )}
    </Card>
  );
};

/**
 * TokenGrid Component
 * 토큰들을 그리드 형태로 정렬하여 표시하는 컨테이너 컴포넌트
 */
interface TokenGridProps {
  title: string;
  children: React.ReactNode;
  columns?: { xs?: number; sm?: number; md?: number; lg?: number };
}

export const TokenGrid: React.FC<TokenGridProps> = ({
  title,
  children,
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="h5"
        component="h2"
        sx={{
          mb: 3,
          fontWeight: 600,
          color: theme.palette.text.primary,
        }}
      >
        {title}
      </Typography>
      <Grid container spacing={3}>
        {React.Children.map(children, (child, index) => (
          <Grid item {...(columns as any)} key={index}>
            {child}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};