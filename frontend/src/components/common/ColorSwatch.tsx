import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface ColorSwatchProps {
  tone: string;
  color: string;
  groupName: string;
  onClick: (color: string) => void;
  onKeyDown: (event: React.KeyboardEvent, color: string) => void;
}

const ColorSwatch: React.FC<ColorSwatchProps> = React.memo(({
  tone,
  color,
  groupName,
  onClick,
  onKeyDown
}) => {
  const theme = useTheme();

  const getTextColor = (toneValue: string): string => {
    return parseInt(toneValue) >= 500 ? '#fff' : (theme.palette.primary[800] || '#212121');
  };

  const textColor = getTextColor(tone);

  return (
    <Box
      role="gridcell"
      tabIndex={0}
      aria-label={`${groupName} ${tone}: ${color}`}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        '&:focus': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: 2
        }
      }}
      onClick={() => onClick(color)}
      onKeyDown={(e) => onKeyDown(e, color)}
    >
      <Box
        sx={{
          width: '100%',
          aspectRatio: '1/1',
          bgcolor: color,
          borderRadius: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          p: 1,
          boxShadow: 1,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.02)',
            boxShadow: 2
          }
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            color: textColor,
            textAlign: 'center',
            fontSize: '0.875rem'
          }}
        >
          {tone}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontSize: '0.75rem',
            color: textColor,
            textAlign: 'center',
            wordBreak: 'break-all',
            lineHeight: 1.2
          }}
        >
          {color.toUpperCase()}
        </Typography>
      </Box>
    </Box>
  );
});

ColorSwatch.displayName = 'ColorSwatch';

export default ColorSwatch;