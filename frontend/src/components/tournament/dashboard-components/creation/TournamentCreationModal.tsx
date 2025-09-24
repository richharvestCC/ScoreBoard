/**
 * TournamentCreationModal - Tournament Creation Modal with Safety Mechanisms
 * Material Design 3 + React 18 + TypeScript
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Collapse,
  Alert,
  AlertTitle,
  Chip,
  Divider,
  Grid,
  useTheme
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  Sports as SportsIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import {
  TournamentCreationConfig,
  TournamentType,
  SafetyCheckResult,
  TournamentValidation
} from '../../../../types/tournament';
import { TournamentTypeToggle, GroupStageToggle } from '../shared/MaterialToggle';
import SafetyCheckDialog from './SafetyCheckDialog';
import { useResponsive } from '../shared/ResponsiveLayout';

// Styled Components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: alpha(theme.palette.background.paper || theme.palette.background.paper, 0.95),
    backdropFilter: 'blur(20px)',
    borderRadius: `${(theme.shape.borderRadius as number) * 2}px`,
    border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
    maxWidth: 600,
    minHeight: 400
  }
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(3),
  margin: theme.spacing(-3, -3, 3, -3),
  borderRadius: `${(theme.shape.borderRadius as number) * 2}px ${(theme.shape.borderRadius as number) * 2}px 0 0`,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2)
}));

const ConfigSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  background: alpha(theme.palette.background.default, 0.5),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
  marginBottom: theme.spacing(2)
}));

const SafetyWarning = styled(Alert)(({ theme }) => ({
  background: alpha(theme.palette.warning.main, 0.1),
  border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2)
}));

// Constants
const CREATION_STEPS = [
  {
    label: '기본 정보',
    description: '토너먼트 이름과 유형 설정'
  },
  {
    label: '참가 팀 설정',
    description: '팀 수와 조별예선 여부 결정'
  },
  {
    label: '안전 확인',
    description: '설정 검토 및 최종 확인'
  }
];

// Utility Functions
const validateTournamentConfig = (config: Partial<TournamentCreationConfig>): TournamentValidation => {
  const titleValid = !!(config.title && config.title.trim().length >= 2);
  const teamCountValid = !!(config.teamCount && config.teamCount >= 4 && config.teamCount <= 64);

  let groupConfigValid = true;
  if (config.groupStageEnabled) {
    const teamsPerGroup = config.teamsPerGroup || 4;
    const totalGroups = Math.ceil((config.teamCount || 0) / teamsPerGroup);
    groupConfigValid = totalGroups >= 2 && totalGroups <= 8 && teamsPerGroup >= 3 && teamsPerGroup <= 6;
  }

  const dateRangeValid = true; // Future: Add date validation

  return {
    titleValid,
    teamCountValid,
    groupConfigValid,
    dateRangeValid,
    overallValid: titleValid && teamCountValid && groupConfigValid && dateRangeValid
  };
};

const generateSafetyCheck = (config: TournamentCreationConfig): SafetyCheckResult => {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Validate team count
  if (config.teamCount < 4) {
    errors.push('최소 4팀 이상이 필요합니다.');
  }
  if (config.teamCount > 32) {
    warnings.push('32팀을 초과하면 대회 운영이 복잡해질 수 있습니다.');
  }

  // Validate group stage
  if (config.groupStageEnabled) {
    const teamsPerGroup = config.teamsPerGroup || 4;
    const totalGroups = Math.ceil(config.teamCount / teamsPerGroup);

    if (totalGroups < 2) {
      errors.push('조별예선을 위해서는 최소 2개 조가 필요합니다.');
    }
    if (totalGroups > 8) {
      warnings.push('8개 조를 초과하면 관리가 어려울 수 있습니다.');
    }
    if (teamsPerGroup < 3) {
      warnings.push('조당 3팀 미만은 경기 수가 적어질 수 있습니다.');
    }
  }

  // Tournament type specific checks
  if (config.type === 'tournament' && !config.groupStageEnabled && config.teamCount > 16) {
    warnings.push('16팀을 초과하는 토너먼트는 조별예선을 고려해보세요.');
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
    canProceed: errors.length === 0
  };
};

// Props Interface
interface TournamentCreationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (config: TournamentCreationConfig) => void;
  isCloneMode?: boolean;
  sourceConfig?: Partial<TournamentCreationConfig>;
}

// Main Component
const TournamentCreationModal: React.FC<TournamentCreationModalProps> = ({
  open,
  onClose,
  onSubmit,
  isCloneMode = false,
  sourceConfig
}) => {
  const theme = useTheme();
  const { config: deviceConfig } = useResponsive();

  // State
  const [activeStep, setActiveStep] = useState(0);
  const [tournamentConfig, setTournamentConfig] = useState<TournamentCreationConfig>({
    title: sourceConfig?.title ? `${sourceConfig.title} 복사본` : '',
    type: sourceConfig?.type || 'tournament',
    teamCount: sourceConfig?.teamCount || 8,
    groupStageEnabled: sourceConfig?.groupStageEnabled || false,
    teamsPerGroup: sourceConfig?.teamsPerGroup || 4,
    qualifiersPerGroup: sourceConfig?.qualifiersPerGroup || 2,
    isCloneMode,
    sourceId: sourceConfig?.sourceId,
    adminUserId: 'current-user' // TODO: Get from auth context
  });

  const [validation, setValidation] = useState<TournamentValidation>({
    titleValid: false,
    teamCountValid: false,
    groupConfigValid: true,
    dateRangeValid: true,
    overallValid: false
  });

  const [safetyCheck, setSafetyCheck] = useState<SafetyCheckResult | null>(null);
  const [showSafetyDialog, setShowSafetyDialog] = useState(false);

  // Effects
  useEffect(() => {
    const newValidation = validateTournamentConfig(tournamentConfig);
    setValidation(newValidation);
  }, [tournamentConfig]);

  // Handlers
  const handleNext = useCallback(() => {
    if (activeStep === CREATION_STEPS.length - 1) {
      // Final step - show safety check
      const safety = generateSafetyCheck(tournamentConfig);
      setSafetyCheck(safety);
      setShowSafetyDialog(true);
    } else {
      setActiveStep(prev => prev + 1);
    }
  }, [activeStep, tournamentConfig]);

  const handleBack = useCallback(() => {
    setActiveStep(prev => prev - 1);
  }, []);

  const handleSubmit = useCallback(() => {
    if (validation.overallValid && safetyCheck?.canProceed) {
      onSubmit(tournamentConfig);
      onClose();
    }
  }, [validation.overallValid, safetyCheck, tournamentConfig, onSubmit, onClose]);

  const handleCancel = useCallback(() => {
    onClose();
    // Reset form after animation
    setTimeout(() => {
      setActiveStep(0);
      setTournamentConfig({
        title: '',
        type: 'tournament',
        teamCount: 8,
        groupStageEnabled: false,
        teamsPerGroup: 4,
        qualifiersPerGroup: 2,
        adminUserId: 'current-user'
      });
      setSafetyCheck(null);
    }, 300);
  }, [onClose]);

  const updateConfig = useCallback((updates: Partial<TournamentCreationConfig>) => {
    setTournamentConfig(prev => ({ ...prev, ...updates }));
  }, []);

  // Step content renderers
  const renderBasicInfo = () => (
    <ConfigSection>
      <Typography variant="h6" gutterBottom>
        기본 정보
      </Typography>

      <TextField
        fullWidth
        label="토너먼트 이름"
        value={tournamentConfig.title}
        onChange={(e) => updateConfig({ title: e.target.value })}
        error={!validation.titleValid && tournamentConfig.title.length > 0}
        helperText={
          !validation.titleValid && tournamentConfig.title.length > 0
            ? '최소 2글자 이상 입력해주세요'
            : '예: 2024 춘계 리그, 회사 축구대회'
        }
        sx={{ mb: 3 }}
      />

      <TournamentTypeToggle
        value={tournamentConfig.type}
        onChange={(type) => updateConfig({ type })}
      />
    </ConfigSection>
  );

  const renderTeamSettings = () => (
    <ConfigSection>
      <Typography variant="h6" gutterBottom>
        참가 팀 설정
      </Typography>

      <Box mb={3}>
        <Typography variant="subtitle2" gutterBottom>
          참가 팀 수
        </Typography>
        <TextField
          type="number"
          value={tournamentConfig.teamCount}
          onChange={(e) => updateConfig({ teamCount: parseInt(e.target.value) || 0 })}
          inputProps={{ min: 4, max: 64 }}
          error={!validation.teamCountValid}
          helperText={
            !validation.teamCountValid
              ? '4팀에서 64팀 사이로 설정해주세요'
              : `총 ${tournamentConfig.teamCount}팀이 참가합니다`
          }
          sx={{ maxWidth: 200 }}
        />
      </Box>

      <GroupStageToggle
        checked={tournamentConfig.groupStageEnabled}
        onChange={(checked) => updateConfig({ groupStageEnabled: checked })}
      />

      {tournamentConfig.groupStageEnabled && (
        <Collapse in={tournamentConfig.groupStageEnabled}>
          <Box mt={2} p={2} sx={{
            background: alpha(theme.palette.info.main, 0.1),
            borderRadius: 1,
            border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`
          }}>
            <Typography variant="subtitle2" gutterBottom>
              조별예선 세부 설정
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="조당 팀 수"
                  type="number"
                  value={tournamentConfig.teamsPerGroup}
                  onChange={(e) => updateConfig({ teamsPerGroup: parseInt(e.target.value) || 4 })}
                  inputProps={{ min: 3, max: 6 }}
                  helperText="3-6팀 권장"
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="조별 통과팀"
                  type="number"
                  value={tournamentConfig.qualifiersPerGroup}
                  onChange={(e) => updateConfig({ qualifiersPerGroup: parseInt(e.target.value) || 2 })}
                  inputProps={{ min: 1, max: (tournamentConfig.teamsPerGroup || 4) - 1 }}
                  helperText="조당 통과 팀 수"
                />
              </Grid>
            </Grid>

            <Box mt={2}>
              <Typography variant="caption" color="text.secondary">
                총 {Math.ceil(tournamentConfig.teamCount / (tournamentConfig.teamsPerGroup || 4))}개 조,
                {' '}{(tournamentConfig.qualifiersPerGroup || 2) * Math.ceil(tournamentConfig.teamCount / (tournamentConfig.teamsPerGroup || 4))}팀이 본선 진출
              </Typography>
            </Box>
          </Box>
        </Collapse>
      )}
    </ConfigSection>
  );

  const renderSafetyCheck = () => {
    const safety = generateSafetyCheck(tournamentConfig);

    return (
      <ConfigSection>
        <Typography variant="h6" gutterBottom>
          설정 확인
        </Typography>

        {/* Configuration Summary */}
        <Box mb={3} p={2} sx={{
          background: alpha(theme.palette.primary.main, 0.1),
          borderRadius: 1,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
        }}>
          <Typography variant="subtitle2" gutterBottom>
            토너먼트 요약
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" color="text.secondary">이름</Typography>
              <Typography variant="body1" fontWeight={600}>{tournamentConfig.title}</Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" color="text.secondary">유형</Typography>
              <Typography variant="body1" fontWeight={600}>
                {tournamentConfig.type === 'tournament' ? '토너먼트' : '리그'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" color="text.secondary">참가 팀</Typography>
              <Typography variant="body1" fontWeight={600}>{tournamentConfig.teamCount}팀</Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" color="text.secondary">조별예선</Typography>
              <Typography variant="body1" fontWeight={600}>
                {tournamentConfig.groupStageEnabled ? '활성화' : '비활성화'}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Safety Warnings */}
        {safety.warnings.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <AlertTitle>주의사항</AlertTitle>
            {safety.warnings.map((warning, index) => (
              <Typography key={index} variant="body2">
                • {warning}
              </Typography>
            ))}
          </Alert>
        )}

        {/* Safety Errors */}
        {safety.errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>오류</AlertTitle>
            {safety.errors.map((error, index) => (
              <Typography key={index} variant="body2">
                • {error}
              </Typography>
            ))}
          </Alert>
        )}

        {/* Success State */}
        {safety.canProceed && safety.warnings.length === 0 && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <AlertTitle>준비 완료</AlertTitle>
            <Typography variant="body2">
              모든 설정이 올바르게 구성되었습니다. 토너먼트를 생성할 수 있습니다.
            </Typography>
          </Alert>
        )}
      </ConfigSection>
    );
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderBasicInfo();
      case 1:
        return renderTeamSettings();
      case 2:
        return renderSafetyCheck();
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return validation.titleValid && tournamentConfig.type;
      case 1:
        return validation.teamCountValid && validation.groupConfigValid;
      case 2:
        return validation.overallValid;
      default:
        return false;
    }
  };

  return (
    <>
      <StyledDialog
        open={open}
        onClose={handleCancel}
        maxWidth="md"
        fullWidth
        fullScreen={deviceConfig.device === 'mobile'}
      >
        <HeaderSection>
          <SportsIcon />
          <Box>
            <Typography variant="h5" fontWeight={600}>
              {isCloneMode ? '토너먼트 복사' : '새 토너먼트 생성'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {CREATION_STEPS[activeStep].description}
            </Typography>
          </Box>
        </HeaderSection>

        <DialogContent sx={{ p: 3 }}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {CREATION_STEPS.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {step.label}
                  </Typography>
                </StepLabel>
                <StepContent>
                  {getStepContent(index)}
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCancel}>
            취소
          </Button>
          {activeStep > 0 && (
            <Button onClick={handleBack}>
              이전
            </Button>
          )}
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {activeStep === CREATION_STEPS.length - 1 ? '생성하기' : '다음'}
          </Button>
        </DialogActions>
      </StyledDialog>

      {/* Safety Check Dialog */}
      {safetyCheck && (
        <SafetyCheckDialog
          open={showSafetyDialog}
          onClose={() => setShowSafetyDialog(false)}
          onConfirm={handleSubmit}
          safetyResult={safetyCheck}
          tournamentConfig={tournamentConfig}
        />
      )}
    </>
  );
};

export default TournamentCreationModal;