/**
 * MaterialToggle - Material Design 3 Toggle Switch Component
 * React 18 + TypeScript + Material-UI v5
 */

import React from 'react';
import {
  Switch,
  FormControlLabel,
  Box,
  Typography,
  styled,
  alpha,
  useTheme
} from '@mui/material';
import { SwitchProps } from '@mui/material/Switch';

// Styled Components
const StyledSwitch = styled(Switch)(({ theme }) => ({
  width: 52,
  height: 32,
  padding: 0,
  display: 'flex',
  '&:active': {
    '& .MuiSwitch-thumb': {
      width: 32
    },
    '& .MuiSwitch-switchBase.Mui-checked': {
      transform: 'translateX(16px)'
    }
  },
  '& .MuiSwitch-switchBase': {
    padding: 2,
    '&.Mui-checked': {
      transform: 'translateX(20px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.primary.main,
        border: 'none'
      }
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: theme.palette.primary.main,
      border: `6px solid ${alpha(theme.palette.primary.main, 0.12)}`
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: theme.palette.mode === 'light' ? 0.7 : 0.3
    }
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 28,
    height: 28,
    borderRadius: 14,
    transition: theme.transitions.create(['width'], {
      duration: 200
    }),
    backgroundColor: theme.palette.mode === 'light' ? '#ffffff' : theme.palette.grey[300],
    boxShadow: theme.shadows[2]
  },
  '& .MuiSwitch-track': {
    borderRadius: 16,
    backgroundColor: theme.palette.mode === 'light' ? '#E9E9EA' : '#39393D',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500
    }),
    border: `1px solid ${alpha(theme.palette.divider, 0.12)}`
  }
}));

const ToggleContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.shape.borderRadius,
  background: alpha((theme.palette as any).surface?.main || theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',

  '&:hover': {
    background: alpha(theme.palette.background.paper, 0.9),
    transform: 'translateY(-1px)',
    boxShadow: theme.shadows[2]
  }
}));

const LabelText = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  fontSize: '0.875rem',
  color: theme.palette.text.primary,
  userSelect: 'none',
  transition: 'color 0.3s ease'
}));

const DescriptionText = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.5),
  lineHeight: 1.4
}));

// Props Interface
interface MaterialToggleProps extends Omit<SwitchProps, 'size'> {
  label: string;
  description?: string;
  size?: 'small' | 'medium' | 'large';
  orientation?: 'horizontal' | 'vertical';
  showLabel?: boolean;
  containerProps?: React.ComponentProps<typeof Box>;
}

// Main Component
const MaterialToggle: React.FC<MaterialToggleProps> = ({
  label,
  description,
  size = 'medium',
  orientation = 'horizontal',
  showLabel = true,
  containerProps,
  disabled,
  checked,
  onChange,
  ...switchProps
}) => {
  const theme = useTheme();

  // Size variants
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          switch: { width: 42, height: 26 },
          thumb: { width: 22, height: 22, borderRadius: 11 },
          track: { borderRadius: 13 },
          translateX: '16px'
        };
      case 'large':
        return {
          switch: { width: 62, height: 38 },
          thumb: { width: 34, height: 34, borderRadius: 17 },
          track: { borderRadius: 19 },
          translateX: '24px'
        };
      default:
        return {
          switch: { width: 52, height: 32 },
          thumb: { width: 28, height: 28, borderRadius: 14 },
          track: { borderRadius: 16 },
          translateX: '20px'
        };
    }
  };

  const sizeStyles = getSizeStyles();

  // Custom styled switch for size variants
  const SizedSwitch = styled(StyledSwitch)({
    width: sizeStyles.switch.width,
    height: sizeStyles.switch.height,
    '& .MuiSwitch-switchBase.Mui-checked': {
      transform: `translateX(${sizeStyles.translateX})`
    },
    '& .MuiSwitch-thumb': {
      width: sizeStyles.thumb.width,
      height: sizeStyles.thumb.height,
      borderRadius: sizeStyles.thumb.borderRadius
    },
    '& .MuiSwitch-track': {
      borderRadius: sizeStyles.track.borderRadius
    }
  });

  if (!showLabel) {
    return (
      <SizedSwitch
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        {...switchProps}
      />
    );
  }

  if (orientation === 'vertical') {
    return (
      <ToggleContainer
        {...containerProps}
        sx={{
          flexDirection: 'column',
          alignItems: 'flex-start',
          ...containerProps?.sx
        }}
      >
        <Box display="flex" flexDirection="column" flex={1}>
          <LabelText>{label}</LabelText>
          {description && <DescriptionText>{description}</DescriptionText>}
        </Box>
        <SizedSwitch
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          {...switchProps}
        />
      </ToggleContainer>
    );
  }

  return (
    <ToggleContainer {...containerProps}>
      <Box flex={1}>
        <LabelText>{label}</LabelText>
        {description && <DescriptionText>{description}</DescriptionText>}
      </Box>
      <SizedSwitch
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        {...switchProps}
      />
    </ToggleContainer>
  );
};

// Enhanced Toggle with Icon Support
interface IconToggleProps extends MaterialToggleProps {
  icon?: React.ReactNode;
  checkedIcon?: React.ReactNode;
}

export const IconToggle: React.FC<IconToggleProps> = ({
  icon,
  checkedIcon,
  checked,
  ...props
}) => {
  return (
    <Box display="flex" alignItems="center" gap={1.5}>
      {(checked && checkedIcon) || icon}
      <MaterialToggle checked={checked} {...props} />
    </Box>
  );
};

// Group Toggle Component
interface ToggleGroupProps {
  children: React.ReactNode;
  title?: string;
  orientation?: 'horizontal' | 'vertical';
  spacing?: number;
}

export const ToggleGroup: React.FC<ToggleGroupProps> = ({
  children,
  title,
  orientation = 'vertical',
  spacing = 2
}) => {
  const theme = useTheme();

  return (
    <Box>
      {title && (
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            fontWeight: 600,
            color: theme.palette.text.primary
          }}
        >
          {title}
        </Typography>
      )}
      <Box
        display="flex"
        flexDirection={orientation === 'vertical' ? 'column' : 'row'}
        gap={spacing}
        sx={{
          flexWrap: orientation === 'horizontal' ? 'wrap' : 'nowrap'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

// Tournament-specific Toggle Variants
export const TournamentTypeToggle: React.FC<{
  value: 'league' | 'tournament' | 'group_tournament';
  onChange: (value: 'league' | 'tournament' | 'group_tournament') => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled }) => {
  return (
    <MaterialToggle
      label={value === 'tournament' ? '토너먼트' : value === 'group_tournament' ? '조별토너먼트' : '리그'}
      description={
        value === 'tournament'
          ? '녹아웃 방식의 토너먼트 대회'
          : value === 'group_tournament'
          ? '조별예선과 토너먼트를 결합한 대회'
          : '리그 방식의 정규 시즌 대회'
      }
      checked={value === 'tournament' || value === 'group_tournament'}
      onChange={(e) => onChange(e.target.checked ? 'tournament' : 'league')}
      disabled={disabled}
    />
  );
};

export const GroupStageToggle: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}> = ({ checked, onChange, disabled }) => {
  return (
    <MaterialToggle
      label="조별예선"
      description={
        checked
          ? '조별예선 후 토너먼트 진행'
          : '바로 토너먼트 진행'
      }
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      disabled={disabled}
    />
  );
};

export default MaterialToggle;