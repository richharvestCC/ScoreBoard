import React from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  SxProps,
  Theme
} from '@mui/material';
import {
  Search as SearchIcon,
  Inbox as InboxIcon,
  Add as AddIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  CloudOff as CloudOffIcon,
  Lock as LockIcon
} from '@mui/icons-material';

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'contained' | 'outlined' | 'text';
  startIcon?: React.ReactElement;
  disabled?: boolean;
}

export interface EmptyStateProps {
  variant?: 'default' | 'search' | 'error' | 'offline' | 'access-denied' | 'filter' | 'create';
  title: string;
  description?: string;
  icon?: React.ReactElement;
  image?: string;
  actions?: EmptyStateAction[];
  sx?: SxProps<Theme>;
  compact?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'default',
  title,
  description,
  icon,
  image,
  actions = [],
  sx = {},
  compact = false
}) => {
  const getDefaultIcon = () => {
    switch (variant) {
      case 'search':
        return <SearchIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'offline':
        return <CloudOffIcon />;
      case 'access-denied':
        return <LockIcon />;
      case 'filter':
        return <FilterIcon />;
      case 'create':
        return <AddIcon />;
      default:
        return <InboxIcon />;
    }
  };

  const getDefaultActions = (): EmptyStateAction[] => {
    switch (variant) {
      case 'search':
        return [{
          label: '검색어를 변경해보세요',
          onClick: () => {},
          variant: 'outlined',
          startIcon: <SearchIcon />
        }];
      case 'error':
        return [{
          label: '다시 시도',
          onClick: () => window.location.reload(),
          variant: 'contained',
          startIcon: <RefreshIcon />
        }];
      case 'offline':
        return [{
          label: '새로고침',
          onClick: () => window.location.reload(),
          variant: 'contained',
          startIcon: <RefreshIcon />
        }];
      case 'create':
        return [{
          label: '새로 만들기',
          onClick: () => {},
          variant: 'contained',
          startIcon: <AddIcon />
        }];
      default:
        return [];
    }
  };

  const displayIcon = icon || getDefaultIcon();
  const displayActions = actions.length > 0 ? actions : getDefaultActions();

  const iconSize = compact ? 48 : 64;
  const titleVariant = compact ? 'h6' : 'h5';
  const bodyVariant = compact ? 'body2' : 'body1';
  const containerPy = compact ? 4 : 8;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        py: containerPy,
        px: 2,
        ...sx
      }}
      role="status"
      aria-live="polite"
    >
      {image ? (
        <Box
          component="img"
          src={image}
          alt=""
          sx={{
            width: compact ? 120 : 200,
            height: 'auto',
            mb: 3,
            opacity: 0.7
          }}
          aria-hidden="true"
        />
      ) : (
        <Box
          sx={{
            mb: 3,
            color: 'text.disabled',
            '& > svg': {
              fontSize: iconSize
            }
          }}
          aria-hidden="true"
        >
          {React.cloneElement(displayIcon, {
            sx: {
              fontSize: iconSize,
              color: 'text.disabled'
            }
          })}
        </Box>
      )}

      <Typography
        variant={titleVariant}
        component="h2"
        gutterBottom
        sx={{
          fontWeight: 600,
          color: 'text.primary',
          mb: description ? 1 : 3
        }}
      >
        {title}
      </Typography>

      {description && (
        <Typography
          variant={bodyVariant}
          color="text.secondary"
          sx={{
            mb: 3,
            maxWidth: 480,
            lineHeight: 1.6
          }}
        >
          {description}
        </Typography>
      )}

      {displayActions.length > 0 && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ mt: 1 }}
        >
          {displayActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'outlined'}
              onClick={action.onClick}
              startIcon={action.startIcon}
              disabled={action.disabled}
              size={compact ? 'medium' : 'large'}
            >
              {action.label}
            </Button>
          ))}
        </Stack>
      )}
    </Box>
  );
};

// Preset variants for common use cases
export const SearchEmptyState: React.FC<Omit<EmptyStateProps, 'variant'>> = (props) => (
  <EmptyState {...props} variant="search" />
);

export const ErrorEmptyState: React.FC<Omit<EmptyStateProps, 'variant'>> = (props) => (
  <EmptyState {...props} variant="error" />
);

export const CreateEmptyState: React.FC<Omit<EmptyStateProps, 'variant'>> = (props) => (
  <EmptyState {...props} variant="create" />
);

export const OfflineEmptyState: React.FC<Omit<EmptyStateProps, 'variant'>> = (props) => (
  <EmptyState {...props} variant="offline" />
);

export const AccessDeniedEmptyState: React.FC<Omit<EmptyStateProps, 'variant'>> = (props) => (
  <EmptyState {...props} variant="access-denied" />
);

export const FilterEmptyState: React.FC<Omit<EmptyStateProps, 'variant'>> = (props) => (
  <EmptyState {...props} variant="filter" />
);

export default EmptyState;