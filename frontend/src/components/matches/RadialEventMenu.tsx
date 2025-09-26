import React from 'react';
import { Box, Button, Paper } from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DangerousIcon from '@mui/icons-material/Dangerous';
import HealingIcon from '@mui/icons-material/Healing';
import SyncIcon from '@mui/icons-material/Sync';
import AssistWalkerIcon from '@mui/icons-material/AssistWalker';

export interface EventType {
  id: string;
  name: string;
  color: string;
  icon: React.ReactNode;
}

export interface RadialEventMenuProps {
  open: boolean;
  anchor: { x: number; y: number } | null; // percentage based within container
  onSelect: (event: EventType) => void;
  onClose: () => void;
  events?: EventType[];
}

const DEFAULT_EVENTS: EventType[] = [
  { id: 'goal', name: '득점', color: '#f44336', icon: <EmojiEventsIcon fontSize="small" /> },
  { id: 'shot', name: '슈팅', color: '#1976d2', icon: <SportsSoccerIcon fontSize="small" /> },
  { id: 'foul', name: '파울', color: '#8d6e63', icon: <AssistWalkerIcon fontSize="small" /> },
  { id: 'yellow', name: '경고', color: '#ffb300', icon: <WarningAmberIcon fontSize="small" /> },
  { id: 'red', name: '퇴장', color: '#d32f2f', icon: <DangerousIcon fontSize="small" /> },
  { id: 'injury', name: '부상', color: '#ab47bc', icon: <HealingIcon fontSize="small" /> },
  { id: 'substitution', name: '교체', color: '#26a69a', icon: <SyncIcon fontSize="small" /> },
];

export const RadialEventMenu: React.FC<RadialEventMenuProps> = ({
  open,
  anchor,
  onSelect,
  onClose,
  events = DEFAULT_EVENTS,
}) => {
  if (!open || !anchor) return null;

  const buttons = events;
  const angleStep = buttons.length ? (Math.PI * 2) / buttons.length : 0;

  return (
    <Box
      sx={{
        position: 'absolute',
        left: `${anchor.x}%`,
        top: `${anchor.y}%`,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'auto',
        zIndex: 10,
      }}
      onClick={(event) => event.stopPropagation()}
    >
      <Paper
        elevation={6}
        sx={{
          position: 'relative',
          width: 160,
          height: 160,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'visible',
        }}
      >
        <Button
          size="small"
          sx={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: (theme) => theme.palette.grey[100],
            color: 'text.secondary',
          }}
          onClick={onClose}
        >
          닫기
        </Button>
        {buttons.map((eventType, index) => {
          const angle = index * angleStep - Math.PI / 2;
          const radius = 60;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <Button
              key={eventType.id}
              size="small"
              variant="contained"
              onClick={() => onSelect(eventType)}
              sx={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                borderRadius: 999,
                backgroundColor: eventType.color,
                '&:hover': {
                  backgroundColor: eventType.color,
                  opacity: 0.85,
                },
                boxShadow: 2,
              }}
            >
              {eventType.name}
            </Button>
          );
        })}
      </Paper>
    </Box>
  );
};

export default RadialEventMenu;
