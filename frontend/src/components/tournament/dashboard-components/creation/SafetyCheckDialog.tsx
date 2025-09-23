/**
 * SafetyCheckDialog - Safety Check Confirmation Dialog
 * Material Design 3 + React 18 + TypeScript
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  FormControlLabel,
  Alert,
  AlertTitle,
  Divider,
  LinearProgress,
  useTheme
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckIcon,
  Security as SecurityIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import {
  SafetyCheckResult,
  TournamentCreationConfig
} from '../../../../types/tournament';

// Styled Components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: alpha(theme.palette.background.paper || theme.palette.background.paper, 0.95),
    backdropFilter: 'blur(20px)',
    borderRadius: `${(theme.shape.borderRadius as number) * 2}px`,
    border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
    maxWidth: 500,
    minWidth: 400
  }
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
  color: theme.palette.warning.contrastText,
  padding: theme.spacing(3),
  margin: theme.spacing(-3, -3, 3, -3),
  borderRadius: `${theme.shape.borderRadius * 2}px ${theme.shape.borderRadius * 2}px 0 0`,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2)
}));

const ChecklistSection = styled(Box)(({ theme }) => ({
  background: alpha(theme.palette.background.default, 0.5),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
  marginBottom: theme.spacing(2)
}));

const ConfirmationSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  background: alpha(theme.palette.error.main, 0.1),
  borderRadius: theme.shape.borderRadius,
  border: `2px solid ${alpha(theme.palette.error.main, 0.3)}`,
  marginTop: theme.spacing(2)
}));

// Props Interface
interface SafetyCheckDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  safetyResult: SafetyCheckResult;
  tournamentConfig: TournamentCreationConfig;
}

// Main Component
const SafetyCheckDialog: React.FC<SafetyCheckDialogProps> = ({
  open,
  onClose,
  onConfirm,
  safetyResult,
  tournamentConfig
}) => {
  const theme = useTheme();

  // Safety checklist state
  const [checkedItems, setCheckedItems] = useState({
    confirmedSettings: false,
    understoodWarnings: false,
    readyToProceed: false
  });

  const [finalConfirmation, setFinalConfirmation] = useState(false);

  // Safety checklist items
  const safetyChecklist = [
    {
      id: 'confirmedSettings',
      label: '토너먼트 설정을 확인했습니다',
      description: `${tournamentConfig.teamCount}팀, ${tournamentConfig.type === 'tournament' ? '토너먼트' : '리그'} 방식${tournamentConfig.groupStageEnabled ? ', 조별예선 포함' : ''}`
    },
    {
      id: 'understoodWarnings',
      label: '주의사항을 숙지했습니다',
      description: safetyResult.warnings.length > 0
        ? `${safetyResult.warnings.length}개의 주의사항을 확인했습니다`
        : '모든 설정이 권장 범위 내에 있습니다'
    },
    {
      id: 'readyToProceed',
      label: '토너먼트 생성을 진행할 준비가 완료되었습니다',
      description: '생성 후에는 일부 설정을 변경하기 어려울 수 있습니다'
    }
  ];

  // Check if all safety items are checked
  const allChecked = Object.values(checkedItems).every(checked => checked);

  // Handle checkbox change
  const handleCheckChange = (id: keyof typeof checkedItems, checked: boolean) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: checked
    }));
  };

  // Handle final confirmation
  const handleConfirm = () => {
    if (allChecked && finalConfirmation && safetyResult.canProceed) {
      onConfirm();
    }
  };

  // Calculate safety score
  const safetyScore = () => {
    let score = 100;
    score -= safetyResult.errors.length * 30;
    score -= safetyResult.warnings.length * 10;
    return Math.max(0, score);
  };

  const getSafetyColor = (score: number) => {
    if (score >= 90) return theme.palette.success.main;
    if (score >= 70) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const score = safetyScore();

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <HeaderSection>
        <SecurityIcon />
        <Box>
          <Typography variant="h6" fontWeight={600}>
            안전 확인
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            토너먼트 생성 전 최종 검토
          </Typography>
        </Box>
      </HeaderSection>

      <DialogContent sx={{ p: 3 }}>
        {/* Safety Score */}
        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom>
            안전 점수: {score}점
          </Typography>
          <LinearProgress
            variant="determinate"
            value={score}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: alpha(theme.palette.divider, 0.1),
              '& .MuiLinearProgress-bar': {
                backgroundColor: getSafetyColor(score),
                borderRadius: 4
              }
            }}
          />
        </Box>

        {/* Errors (if any) */}
        {safetyResult.errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>오류 발견</AlertTitle>
            <List dense>
              {safetyResult.errors.map((error, index) => (
                <ListItem key={index} sx={{ py: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <ErrorIcon color="error" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>
                    <Typography variant="body2">{error}</Typography>
                  </ListItemText>
                </ListItem>
              ))}
            </List>
          </Alert>
        )}

        {/* Warnings (if any) */}
        {safetyResult.warnings.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <AlertTitle>주의사항</AlertTitle>
            <List dense>
              {safetyResult.warnings.map((warning, index) => (
                <ListItem key={index} sx={{ py: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <WarningIcon color="warning" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>
                    <Typography variant="body2">{warning}</Typography>
                  </ListItemText>
                </ListItem>
              ))}
            </List>
          </Alert>
        )}

        {/* Success State */}
        {safetyResult.canProceed && safetyResult.warnings.length === 0 && safetyResult.errors.length === 0 && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <AlertTitle>모든 검사 통과</AlertTitle>
            <Typography variant="body2">
              설정에 문제가 없습니다. 안전하게 토너먼트를 생성할 수 있습니다.
            </Typography>
          </Alert>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Safety Checklist */}
        {safetyResult.canProceed && (
          <>
            <Typography variant="h6" gutterBottom>
              안전 체크리스트
            </Typography>

            <ChecklistSection>
              <List>
                {safetyChecklist.map((item, index) => (
                  <ListItem key={item.id} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={checkedItems[item.id as keyof typeof checkedItems]}
                          onChange={(e) => handleCheckChange(item.id as keyof typeof checkedItems, e.target.checked)}
                          color="primary"
                        />
                      }
                      label={
                        <Typography variant="body1" fontWeight={500}>
                          {item.label}
                        </Typography>
                      }
                      sx={{ mb: 0.5 }}
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ ml: 4, mt: -1 }}
                    >
                      {item.description}
                    </Typography>
                    {index < safetyChecklist.length - 1 && <Divider sx={{ width: '100%', mt: 1 }} />}
                  </ListItem>
                ))}
              </List>
            </ChecklistSection>

            {/* Final Confirmation */}
            {allChecked && (
              <ConfirmationSection>
                <Typography variant="h6" gutterBottom color="error.main">
                  ⚠️ 최종 확인
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={finalConfirmation}
                      onChange={(e) => setFinalConfirmation(e.target.checked)}
                      color="error"
                    />
                  }
                  label={
                    <Typography variant="body1" fontWeight={600}>
                      위의 모든 사항을 확인했으며, 토너먼트 생성에 동의합니다.
                    </Typography>
                  }
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  이 작업은 되돌릴 수 없습니다. 신중하게 검토한 후 진행해주세요.
                </Typography>
              </ConfirmationSection>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose}>
          취소
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!safetyResult.canProceed || !allChecked || !finalConfirmation}
          color={safetyResult.warnings.length > 0 ? "warning" : "primary"}
        >
          {safetyResult.warnings.length > 0 ? '위험을 감수하고 생성' : '안전하게 생성'}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default SafetyCheckDialog;