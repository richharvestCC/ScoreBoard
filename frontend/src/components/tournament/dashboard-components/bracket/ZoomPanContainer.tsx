/**
 * ZoomPanContainer - Zoom and Pan Gesture System for Tournament Brackets
 * Material Design 3 + React 18 + TypeScript
 */

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
  WheelEvent,
  MouseEvent
} from 'react';
import { Box, IconButton, Fab, Typography, Slider, useTheme } from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  CenterFocusStrong as CenterIcon,
  Fullscreen as FullscreenIcon,
  ZoomOutMap as FitIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { ZoomPanState } from '../../../../types/tournament';
import { useResponsive } from '../shared/ResponsiveLayout';

// Constants
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 3.0;
const ZOOM_STEP = 0.1;
const DOUBLE_TAP_DELAY = 300;
const MOMENTUM_THRESHOLD = 5;
const MOMENTUM_MULTIPLIER = 0.95;
const BOUNDARY_SPRING = 0.3;

// Styled Components
const ZoomContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  background: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  touchAction: 'none', // Prevent default touch behaviors
  userSelect: 'none'
}));

const ZoomContent = styled(Box)<{
  scale: number;
  translateX: number;
  translateY: number;
  isDragging: boolean;
}>(({ scale, translateX, translateY, isDragging }) => ({
  width: '100%',
  height: '100%',
  transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
  transformOrigin: '0 0',
  transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: isDragging ? 'grabbing' : 'grab'
}));

const ZoomControls = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: theme.zIndex.speedDial,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  background: alpha(theme.palette.background.paper || theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(10px)',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1),
  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`
}));

const ZoomSlider = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(2),
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: theme.zIndex.speedDial,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  background: alpha(theme.palette.background.paper || theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(10px)',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1, 2),
  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
  minWidth: 200
}));

const ZoomIndicator = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  left: theme.spacing(2),
  zIndex: theme.zIndex.speedDial,
  background: alpha(theme.palette.background.paper || theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(10px)',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1, 1.5),
  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`
}));

// Interfaces
interface ZoomPanContainerProps {
  children: ReactNode;
  initialZoom?: number;
  onZoomChange?: (zoom: number) => void;
  onPanChange?: (x: number, y: number) => void;
  bounds?: {
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
  };
  enableGestures?: boolean;
  showControls?: boolean;
  showSlider?: boolean;
  className?: string;
}

interface TouchData {
  id: number;
  x: number;
  y: number;
}

interface GestureState {
  touches: TouchData[];
  lastDistance: number;
  lastCenter: { x: number; y: number };
  lastTap: number;
  momentum: { x: number; y: number };
}

// Custom Hook
export const useZoomPan = (initialZoom = 1.0) => {
  const [zoomPanState, setZoomPanState] = useState<ZoomPanState>({
    scale: initialZoom,
    translateX: 0,
    translateY: 0,
    isDragging: false
  });

  const zoomTo = useCallback((newZoom: number) => {
    setZoomPanState(prev => ({
      ...prev,
      scale: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom))
    }));
  }, []);

  const panTo = useCallback((x: number, y: number) => {
    setZoomPanState(prev => ({
      ...prev,
      translateX: x,
      translateY: y
    }));
  }, []);

  const reset = useCallback(() => {
    setZoomPanState({
      scale: initialZoom,
      translateX: 0,
      translateY: 0,
      isDragging: false
    });
  }, [initialZoom]);

  const zoomIn = useCallback(() => {
    zoomTo(zoomPanState.scale + ZOOM_STEP);
  }, [zoomPanState.scale, zoomTo]);

  const zoomOut = useCallback(() => {
    zoomTo(zoomPanState.scale - ZOOM_STEP);
  }, [zoomPanState.scale, zoomTo]);

  return {
    zoomPanState,
    setZoomPanState,
    zoomTo,
    panTo,
    reset,
    zoomIn,
    zoomOut
  };
};

// Utility Functions
const getTouchData = (touches: React.TouchList): TouchData[] => {
  return Array.from(touches).map(touch => ({
    id: touch.identifier,
    x: touch.clientX,
    y: touch.clientY
  }));
};

const getDistance = (touch1: TouchData, touch2: TouchData): number => {
  const dx = touch1.x - touch2.x;
  const dy = touch1.y - touch2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const getCenter = (touch1: TouchData, touch2: TouchData): { x: number; y: number } => {
  return {
    x: (touch1.x + touch2.x) / 2,
    y: (touch1.y + touch2.y) / 2
  };
};

const applyBounds = (
  value: number,
  min?: number,
  max?: number
): number => {
  if (min !== undefined && value < min) {
    return min + (value - min) * BOUNDARY_SPRING;
  }
  if (max !== undefined && value > max) {
    return max + (value - max) * BOUNDARY_SPRING;
  }
  return value;
};

// Main Component
const ZoomPanContainer: React.FC<ZoomPanContainerProps> = ({
  children,
  initialZoom = 1.0,
  onZoomChange,
  onPanChange,
  bounds,
  enableGestures = true,
  showControls = true,
  showSlider = true,
  className
}) => {
  const theme = useTheme();
  const { config } = useResponsive();
  const containerRef = useRef<HTMLDivElement>(null);
  const gestureRef = useRef<GestureState>({
    touches: [],
    lastDistance: 0,
    lastCenter: { x: 0, y: 0 },
    lastTap: 0,
    momentum: { x: 0, y: 0 }
  });

  const {
    zoomPanState,
    setZoomPanState,
    zoomTo,
    panTo,
    reset,
    zoomIn,
    zoomOut
  } = useZoomPan(initialZoom);

  // Responsive zoom constraints
  const zoomConstraints = useMemo(() => {
    switch (config.device) {
      case 'tablet-portrait':
        return { min: 0.3, max: 2.0, step: 0.05 };
      case 'tablet-landscape':
        return { min: 0.5, max: 2.5, step: 0.05 };
      default:
        return { min: MIN_ZOOM, max: MAX_ZOOM, step: ZOOM_STEP };
    }
  }, [config.device]);

  // Wheel zoom handler
  const handleWheel = useCallback((event: WheelEvent) => {
    if (!enableGestures) return;

    event.preventDefault();

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const deltaY = event.deltaY;
    const zoomDelta = deltaY > 0 ? -zoomConstraints.step : zoomConstraints.step;
    const newZoom = Math.max(
      zoomConstraints.min,
      Math.min(zoomConstraints.max, zoomPanState.scale + zoomDelta)
    );

    // Zoom towards mouse position
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const scaleDiff = newZoom - zoomPanState.scale;
    const newTranslateX = zoomPanState.translateX - (mouseX * scaleDiff) / zoomPanState.scale;
    const newTranslateY = zoomPanState.translateY - (mouseY * scaleDiff) / zoomPanState.scale;

    setZoomPanState(prev => ({
      ...prev,
      scale: newZoom,
      translateX: applyBounds(newTranslateX, bounds?.minX, bounds?.maxX),
      translateY: applyBounds(newTranslateY, bounds?.minY, bounds?.maxY)
    }));

    onZoomChange?.(newZoom);
  }, [
    enableGestures,
    zoomConstraints,
    zoomPanState,
    setZoomPanState,
    onZoomChange,
    bounds
  ]);

  // Touch gesture handlers
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (!enableGestures) return;

    const touches = getTouchData(event.touches);
    gestureRef.current.touches = touches;

    if (touches.length === 1) {
      // Single touch - potential drag or double tap
      const now = Date.now();
      const isDoubleTap = now - gestureRef.current.lastTap < DOUBLE_TAP_DELAY;

      if (isDoubleTap) {
        // Double tap to zoom
        const newZoom = zoomPanState.scale < 1.5 ? 2.0 : 1.0;
        zoomTo(newZoom);
        onZoomChange?.(newZoom);
      }

      gestureRef.current.lastTap = now;
      setZoomPanState(prev => ({ ...prev, isDragging: true }));
    } else if (touches.length === 2) {
      // Two touches - pinch gesture
      const distance = getDistance(touches[0], touches[1]);
      const center = getCenter(touches[0], touches[1]);

      gestureRef.current.lastDistance = distance;
      gestureRef.current.lastCenter = center;
      setZoomPanState(prev => ({ ...prev, isDragging: true }));
    }
  }, [enableGestures, zoomPanState.scale, zoomTo, onZoomChange, setZoomPanState]);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (!enableGestures || !zoomPanState.isDragging) return;

    event.preventDefault();

    const touches = getTouchData(event.touches);

    if (touches.length === 1 && gestureRef.current.touches.length === 1) {
      // Single touch drag
      const touch = touches[0];
      const lastTouch = gestureRef.current.touches[0];

      const deltaX = touch.x - lastTouch.x;
      const deltaY = touch.y - lastTouch.y;

      gestureRef.current.momentum = { x: deltaX, y: deltaY };

      setZoomPanState(prev => ({
        ...prev,
        translateX: applyBounds(
          prev.translateX + deltaX / prev.scale,
          bounds?.minX,
          bounds?.maxX
        ),
        translateY: applyBounds(
          prev.translateY + deltaY / prev.scale,
          bounds?.minY,
          bounds?.maxY
        )
      }));

      onPanChange?.(zoomPanState.translateX, zoomPanState.translateY);
    } else if (touches.length === 2 && gestureRef.current.touches.length === 2) {
      // Two touch pinch
      const distance = getDistance(touches[0], touches[1]);
      const center = getCenter(touches[0], touches[1]);

      const scaleChange = distance / gestureRef.current.lastDistance;
      const newZoom = Math.max(
        zoomConstraints.min,
        Math.min(zoomConstraints.max, zoomPanState.scale * scaleChange)
      );

      // Center pinch around touch center
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const centerX = center.x - rect.left;
        const centerY = center.y - rect.top;

        const scaleDiff = newZoom - zoomPanState.scale;
        const newTranslateX = zoomPanState.translateX - (centerX * scaleDiff) / zoomPanState.scale;
        const newTranslateY = zoomPanState.translateY - (centerY * scaleDiff) / zoomPanState.scale;

        setZoomPanState(prev => ({
          ...prev,
          scale: newZoom,
          translateX: applyBounds(newTranslateX, bounds?.minX, bounds?.maxX),
          translateY: applyBounds(newTranslateY, bounds?.minY, bounds?.maxY)
        }));

        onZoomChange?.(newZoom);
      }

      gestureRef.current.lastDistance = distance;
      gestureRef.current.lastCenter = center;
    }

    gestureRef.current.touches = touches;
  }, [
    enableGestures,
    zoomPanState,
    setZoomPanState,
    zoomConstraints,
    onZoomChange,
    onPanChange,
    bounds
  ]);

  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    if (!enableGestures) return;

    setZoomPanState(prev => ({ ...prev, isDragging: false }));

    // Apply momentum if significant movement
    const momentum = gestureRef.current.momentum;
    if (Math.abs(momentum.x) > MOMENTUM_THRESHOLD || Math.abs(momentum.y) > MOMENTUM_THRESHOLD) {
      let momentumX = momentum.x;
      let momentumY = momentum.y;

      const applyMomentum = () => {
        momentumX *= MOMENTUM_MULTIPLIER;
        momentumY *= MOMENTUM_MULTIPLIER;

        if (Math.abs(momentumX) < 1 && Math.abs(momentumY) < 1) return;

        setZoomPanState(prev => ({
          ...prev,
          translateX: applyBounds(
            prev.translateX + momentumX / prev.scale,
            bounds?.minX,
            bounds?.maxX
          ),
          translateY: applyBounds(
            prev.translateY + momentumY / prev.scale,
            bounds?.minY,
            bounds?.maxY
          )
        }));

        requestAnimationFrame(applyMomentum);
      };

      requestAnimationFrame(applyMomentum);
    }

    gestureRef.current.touches = [];
    gestureRef.current.momentum = { x: 0, y: 0 };
  }, [enableGestures, setZoomPanState, bounds]);

  // Mouse drag handlers (for desktop)
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (!enableGestures || config.isTouchDevice) return;

    setZoomPanState(prev => ({ ...prev, isDragging: true }));

    const startX = event.clientX;
    const startY = event.clientY;
    const startTranslateX = zoomPanState.translateX;
    const startTranslateY = zoomPanState.translateY;

    const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      setZoomPanState(prev => ({
        ...prev,
        translateX: applyBounds(
          startTranslateX + deltaX / prev.scale,
          bounds?.minX,
          bounds?.maxX
        ),
        translateY: applyBounds(
          startTranslateY + deltaY / prev.scale,
          bounds?.minY,
          bounds?.maxY
        )
      }));

      onPanChange?.(zoomPanState.translateX, zoomPanState.translateY);
    };

    const handleMouseUp = () => {
      setZoomPanState(prev => ({ ...prev, isDragging: false }));
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [
    enableGestures,
    config.isTouchDevice,
    setZoomPanState,
    zoomPanState,
    onPanChange,
    bounds
  ]);

  // Fit to container
  const handleFitToContainer = useCallback(() => {
    reset();
    onZoomChange?.(initialZoom);
    onPanChange?.(0, 0);
  }, [reset, initialZoom, onZoomChange, onPanChange]);

  return (
    <ZoomContainer
      ref={containerRef}
      className={className}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
    >
      <ZoomContent
        scale={zoomPanState.scale}
        translateX={zoomPanState.translateX}
        translateY={zoomPanState.translateY}
        isDragging={zoomPanState.isDragging}
      >
        {children}
      </ZoomContent>

      {/* Zoom Indicator */}
      <ZoomIndicator>
        <Typography variant="caption" color="text.secondary">
          {Math.round(zoomPanState.scale * 100)}%
        </Typography>
      </ZoomIndicator>

      {/* Zoom Controls */}
      {showControls && (
        <ZoomControls>
          <IconButton size="small" onClick={zoomIn}>
            <ZoomInIcon />
          </IconButton>
          <IconButton size="small" onClick={zoomOut}>
            <ZoomOutIcon />
          </IconButton>
          <IconButton size="small" onClick={handleFitToContainer}>
            <FitIcon />
          </IconButton>
          <IconButton size="small" onClick={reset}>
            <CenterIcon />
          </IconButton>
        </ZoomControls>
      )}

      {/* Zoom Slider */}
      {showSlider && config.device === 'desktop' && (
        <ZoomSlider>
          <ZoomOutIcon fontSize="small" />
          <Slider
            value={zoomPanState.scale}
            min={zoomConstraints.min}
            max={zoomConstraints.max}
            step={zoomConstraints.step}
            onChange={(_, value) => {
              const newZoom = Array.isArray(value) ? value[0] : value;
              zoomTo(newZoom);
              onZoomChange?.(newZoom);
            }}
            sx={{ minWidth: 120 }}
            size="small"
          />
          <ZoomInIcon fontSize="small" />
        </ZoomSlider>
      )}
    </ZoomContainer>
  );
};

export default ZoomPanContainer;