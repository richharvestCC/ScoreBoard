/**
 * TournamentDashboard - Main Tournament UI Component
 * Material Design 3 + React 18 + TypeScript
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  useTheme,
  useMediaQuery,
  Fab,
  Fade,
  Slide
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { styled } from '@mui/material/styles';

// Types
import {
  Tournament,
  TournamentCreationConfig,
  TournamentUIState,
  ResponsiveConfig,
  DeviceType,
  BreakpointKey
} from '../../../types/tournament';

// Theme and Components
import MaterialToggle, { TournamentTypeToggle, GroupStageToggle } from './shared/MaterialToggle';
import TournamentCreationModal from './creation/TournamentCreationModal';

// Component Imports (will be implemented in subsequent tasks)
// import TournamentHeader from './controls/TournamentHeader';
// import ControlPanel from './controls/ControlPanel';
// import TournamentCreationModal from './creation/TournamentCreationModal';
// import SVGTournamentBracket from './bracket/SVGTournamentBracket';
// import GroupStageGrid from './bracket/GroupStageGrid';

// Styled Components
const DashboardContainer = styled(Container)(({ theme }) => ({
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  padding: 0,
  background: theme.palette.background.default,
  overflow: 'hidden',
  position: 'relative'
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: theme.zIndex.appBar,
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  backdropFilter: 'blur(20px)',
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2, 3),
  height: 80
}));

const ContentSection = styled(Box)(({ theme }) => ({
  flex: 1,
  marginTop: 80, // Header height
  marginBottom: 80, // Control panel height
  overflow: 'hidden',
  position: 'relative',
  background: theme.palette.background.paper
}));

const ControlPanelSection = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: theme.zIndex.appBar,
  background: theme.palette.surface?.main || theme.palette.background.paper,
  backdropFilter: 'blur(20px)',
  borderTop: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2, 3),
  height: 80
}));

const CreateTournamentFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(12),
  right: theme.spacing(3),
  zIndex: theme.zIndex.fab,
  background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.secondary.dark}, ${theme.palette.secondary.main})`,
    transform: 'scale(1.1)'
  },
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
}));

const PlaceholderContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  padding: theme.spacing(4),
  textAlign: 'center',
  color: theme.palette.text.secondary
}));

// Props Interface
interface TournamentDashboardProps {
  tournaments?: Tournament[];
  selectedTournament?: Tournament;
  onTournamentSelect?: (tournament: Tournament) => void;
  onTournamentCreate?: (config: TournamentCreationConfig) => void;
  className?: string;
}

// Custom Hooks
const useResponsiveConfig = (): ResponsiveConfig => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('xl')); // 1920px+
  const isTabletLandscape = useMediaQuery(theme.breakpoints.between('lg', 'xl')); // 1024-1919px
  const isTabletPortrait = useMediaQuery(theme.breakpoints.between('md', 'lg')); // 768-1023px
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // <768px

  const getDeviceType = (): DeviceType => {
    if (isDesktop) return 'desktop';
    if (isTabletLandscape) return 'tablet-landscape';
    if (isTabletPortrait) return 'tablet-portrait';
    return 'mobile';
  };

  const getBreakpoint = (): BreakpointKey => {
    if (isDesktop) return 'xl';
    if (isTabletLandscape) return 'lg';
    if (isTabletPortrait) return 'md';
    return 'sm';
  };

  return {
    device: getDeviceType(),
    breakpoint: getBreakpoint(),
    isTouchDevice: 'ontouchstart' in window,
    supportsHover: window.matchMedia('(hover: hover)').matches,
    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
  };
};

// Main Component
const TournamentDashboard: React.FC<TournamentDashboardProps> = ({
  tournaments = [],
  selectedTournament,
  onTournamentSelect,
  onTournamentCreate,
  className
}) => {
  const theme = useTheme();
  const responsiveConfig = useResponsiveConfig();

  // UI State
  const [uiState, setUIState] = useState<TournamentUIState>({
    currentTournament: selectedTournament,
    selectedTab: selectedTournament?.groupStageEnabled ? 'groups' : 'bracket',
    isCreationModalOpen: false,
    isCloneMode: false,
    zoomLevel: 1.0,
    viewportDimensions: {
      width: window.innerWidth,
      height: window.innerHeight
    }
  });

  // Event Handlers
  const handleCreateTournament = useCallback(() => {
    setUIState(prev => ({
      ...prev,
      isCreationModalOpen: true,
      isCloneMode: false
    }));
  }, []);

  const handleModalClose = useCallback(() => {
    setUIState(prev => ({
      ...prev,
      isCreationModalOpen: false,
      isCloneMode: false
    }));
  }, []);

  const handleTournamentCreated = useCallback((config: TournamentCreationConfig) => {
    onTournamentCreate?.(config);
    handleModalClose();
  }, [onTournamentCreate, handleModalClose]);

  const handleTournamentSelect = useCallback((tournament: Tournament) => {
    setUIState(prev => ({
      ...prev,
      currentTournament: tournament,
      selectedTab: tournament.groupStageEnabled ? 'groups' : 'bracket'
    }));
    onTournamentSelect?.(tournament);
  }, [onTournamentSelect]);

  // Responsive Updates
  useEffect(() => {
    const handleResize = () => {
      setUIState(prev => ({
        ...prev,
        viewportDimensions: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mobile Support Check
  if (responsiveConfig.device === 'mobile') {
    return (
      <DashboardContainer className={className}>
        <PlaceholderContent>
          <Typography variant=\"h4\" gutterBottom>
            📱 모바일 지원 예정
          </Typography>
          <Typography variant=\"body1\" color=\"text.secondary\">
            토너먼트 대시보드는 현재 데스크톱과 태블릿에서만 지원됩니다.
            <br />
            모바일 버전은 향후 업데이트에서 제공될 예정입니다.
          </Typography>
        </PlaceholderContent>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer className={className}>
      {/* Header Section */}
      <HeaderSection>
        <Slide direction=\"down\" in={true} timeout={800}>
          <Box display=\"flex\" alignItems=\"center\" justifyContent=\"space-between\" height=\"100%\">
            <Typography
              variant=\"h4\"
              component=\"h1\"
              sx={{
                color: 'white',
                fontWeight: 600,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              {uiState.currentTournament?.title || '🏆 토너먼트 대시보드'}
            </Typography>

            <Box display=\"flex\" alignItems=\"center\" gap={2}>
              <Typography variant=\"body2\" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                {responsiveConfig.device === 'desktop' ? '데스크톱' :
                 responsiveConfig.device === 'tablet-landscape' ? '태블릿 가로' : '태블릿 세로'}
              </Typography>
            </Box>
          </Box>
        </Slide>
      </HeaderSection>

      {/* Main Content Section */}
      <ContentSection>
        <Fade in={true} timeout={1000}>
          <PlaceholderContent>
            {uiState.currentTournament ? (
              <>
                <Typography variant=\"h5\" gutterBottom>
                  🏗️ 토너먼트 렌더링 준비 중
                </Typography>
                <Typography variant=\"body1\" color=\"text.secondary\">
                  토너먼트: {uiState.currentTournament.title}
                  <br />
                  유형: {uiState.currentTournament.type}
                  <br />
                  팀 수: {uiState.currentTournament.teamCount}
                  <br />
                  조별예선: {uiState.currentTournament.groupStageEnabled ? '활성화' : '비활성화'}
                </Typography>
              </>
            ) : (
              <>
                <Typography variant=\"h5\" gutterBottom>
                  🚀 토너먼트 대시보드
                </Typography>
                <Typography variant=\"body1\" color=\"text.secondary\">
                  새로운 토너먼트를 생성하거나 기존 토너먼트를 선택하세요.
                  <br />
                  우측 하단의 + 버튼을 클릭하여 시작할 수 있습니다.
                </Typography>
              </>
            )}
          </PlaceholderContent>
        </Fade>
      </ContentSection>

      {/* Control Panel Section */}
      <ControlPanelSection>
        <Slide direction=\"up\" in={true} timeout={800}>
          <Box display=\"flex\" alignItems=\"center\" justifyContent=\"space-between\" height=\"100%\">
            <Typography variant=\"body2\" color=\"text.secondary\">
              Ready for Tournament Management
            </Typography>

            <Box display=\"flex\" alignItems=\"center\" gap={2}>
              <Typography variant=\"caption\" color=\"text.secondary\">
                {tournaments.length}개 토너먼트
              </Typography>
            </Box>
          </Box>
        </Slide>
      </ControlPanelSection>

      {/* Create Tournament FAB */}
      <Fade in={true} timeout={1200}>
        <CreateTournamentFab
          color=\"secondary\"
          aria-label=\"새 토너먼트 생성\"
          onClick={handleCreateTournament}
        >
          <AddIcon />
        </CreateTournamentFab>
      </Fade>

      {/* Tournament Creation Modal - Will be implemented in Task 6 */}
      <TournamentCreationModal
        open={uiState.isCreationModalOpen}
        onClose={handleModalClose}
        onSubmit={handleTournamentCreated}
        isCloneMode={uiState.isCloneMode}
      />
    </DashboardContainer>
  );
};

export default TournamentDashboard;