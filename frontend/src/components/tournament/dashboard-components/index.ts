/**
 * Tournament Dashboard Components - Export Index
 * Material Design 3 + React 18 + TypeScript
 */

// Main Dashboard Component
export { default as TournamentDashboard } from './TournamentDashboard';

// Shared Components
export { default as ResponsiveProvider } from './shared/ResponsiveLayout';
export {
  ResponsiveWrapper,
  useResponsive,
  useResponsiveVisibility,
  useResponsiveValue,
  createResponsiveStyles,
  BREAKPOINTS,
  DEVICE_CONFIGS,
  getDeviceType,
  getBreakpoint,
  isTouchDevice,
  supportsHover,
  getOrientation
} from './shared/ResponsiveLayout';

// Tournament Types
export type * from '../../../types/tournament';

// Component Placeholders (will be implemented in subsequent tasks)
// These exports will be uncommented as components are implemented

// Task 2: Material Design 3 Theme ✅
export { default as MaterialToggle, TournamentTypeToggle, GroupStageToggle, IconToggle, ToggleGroup } from './shared/MaterialToggle';

// Task 3: Responsive Layout (Already implemented)
// ✅ ResponsiveProvider and related utilities

// Task 4: SVG Bracket Rendering ✅
export { default as SVGTournamentBracket } from './bracket/SVGTournamentBracket';
export { default as GroupStageGrid } from './bracket/GroupStageGrid';
export { default as MatchCard } from './bracket/MatchCard';

// Task 5: Zoom/Pinch Gestures
// export { default as ZoomPanContainer } from './bracket/ZoomPanContainer';
// export { useZoomPan } from './bracket/ZoomPanContainer';

// Task 6: Safety & Modal System
// export { default as TournamentCreationModal } from './creation/TournamentCreationModal';
// export { default as CompetitionTypeToggle } from './creation/CompetitionTypeToggle';
// export { default as SafetyCheckDialog } from './creation/SafetyCheckDialog';
// export { default as TournamentConfigForm } from './creation/TournamentConfigForm';

// Task 7: Animation & Motion Graphics
// export { default as AnimatedModal } from './shared/AnimatedModal';
// export { useModalAnimation } from './shared/AnimatedModal';

// Task 8: Performance Optimization
// export { default as VirtualizedBracket } from './bracket/VirtualizedBracket';
// export { useBracketOptimization } from './shared/OptimizationHooks';

// Controls (Header & Control Panel)
// export { default as TournamentHeader } from './controls/TournamentHeader';
// export { default as ControlPanel } from './controls/ControlPanel';
// export { default as NavigationTabs } from './controls/NavigationTabs';

// Re-export key types for convenience
export type {
  Tournament,
  TournamentCreationConfig,
  TournamentUIState,
  ResponsiveConfig,
  DeviceType,
  BreakpointKey,
  TournamentDashboardProps
} from '../../../types/tournament';