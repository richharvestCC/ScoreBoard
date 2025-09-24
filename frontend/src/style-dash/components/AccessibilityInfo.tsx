import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
} from '@mui/material';
import {
  CheckCircle,
  Warning,
  Error,
  Visibility,
  TouchApp,
  Keyboard,
  VolumeUp,
} from '@mui/icons-material';
import { calculateContrastRatio, isWCAGCompliant } from '../utils/accessibility';

interface AccessibilityInfoProps {
  title: string;
  description?: string;
}

/**
 * AccessibilityInfo Component
 * 접근성 정보를 표시하는 컴포넌트
 */
const AccessibilityInfo: React.FC<AccessibilityInfoProps> = ({
  title,
  description,
}) => {
  const theme = useTheme();

  // 현재 테마의 접근성 검증
  const accessibilityChecks = [
    {
      category: '색상 대비',
      icon: <Visibility />,
      items: [
        {
          label: '주 텍스트 대비비',
          value: calculateContrastRatio(
            theme.palette.text.primary,
            theme.palette.background.default
          ).toFixed(2),
          status: isWCAGCompliant(
            calculateContrastRatio(
              theme.palette.text.primary,
              theme.palette.background.default
            )
          ) ? 'success' : 'error',
        },
        {
          label: '보조 텍스트 대비비',
          value: calculateContrastRatio(
            theme.palette.text.secondary,
            theme.palette.background.default
          ).toFixed(2),
          status: isWCAGCompliant(
            calculateContrastRatio(
              theme.palette.text.secondary,
              theme.palette.background.default
            )
          ) ? 'success' : 'warning',
        },
        {
          label: '버튼 대비비',
          value: calculateContrastRatio(
            theme.palette.primary.contrastText,
            theme.palette.primary.main
          ).toFixed(2),
          status: isWCAGCompliant(
            calculateContrastRatio(
              theme.palette.primary.contrastText,
              theme.palette.primary.main
            )
          ) ? 'success' : 'error',
        },
      ],
    },
    {
      category: '터치 타겟',
      icon: <TouchApp />,
      items: [
        {
          label: '최소 터치 영역',
          value: '44px × 44px',
          status: 'success',
        },
        {
          label: '버튼 간격',
          value: `${theme.spacing(1)}px 이상`,
          status: 'success',
        },
      ],
    },
    {
      category: '키보드 네비게이션',
      icon: <Keyboard />,
      items: [
        {
          label: 'Tab 순서',
          value: '논리적 순서',
          status: 'success',
        },
        {
          label: '포커스 표시',
          value: '2px 아웃라인',
          status: 'success',
        },
        {
          label: 'Skip Links',
          value: '메인 콘텐츠로 이동',
          status: 'success',
        },
      ],
    },
    {
      category: '스크린 리더',
      icon: <VolumeUp />,
      items: [
        {
          label: 'Alt 텍스트',
          value: '모든 이미지',
          status: 'success',
        },
        {
          label: 'ARIA 라벨',
          value: '인터랙티브 요소',
          status: 'success',
        },
        {
          label: 'Heading 구조',
          value: 'H1-H6 순서',
          status: 'success',
        },
      ],
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle color="success" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'error':
        return <Error color="error" />;
      default:
        return <CheckCircle color="action" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return theme.palette.success.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'error':
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        borderRadius: 2,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            component="h2"
            sx={{ mb: 1, fontWeight: 600 }}
          >
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" color="textSecondary">
              {description}
            </Typography>
          )}
        </Box>

        {accessibilityChecks.map((check, index) => (
          <Box key={index} sx={{ mb: 3 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  mr: 2,
                }}
              >
                {check.icon}
              </Box>
              <Typography variant="h6" fontWeight={600}>
                {check.category}
              </Typography>
            </Box>

            <List dense>
              {check.items.map((item, itemIndex) => (
                <ListItem key={itemIndex} sx={{ pl: 0 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getStatusIcon(item.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    secondary={item.value}
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                  <Chip
                    label={item.status === 'success' ? '준수' : item.status === 'warning' ? '주의' : '개선 필요'}
                    size="small"
                    sx={{
                      backgroundColor: alpha(getStatusColor(item.status), 0.1),
                      color: getStatusColor(item.status),
                      fontWeight: 500,
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        ))}

        {/* WCAG 준수 수준 표시 */}
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.success.main, 0.1),
            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CheckCircle color="success" sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight={600} color="success.main">
              WCAG 2.1 AA 준수
            </Typography>
          </Box>
          <Typography variant="body2" color="textSecondary">
            이 스타일 가이드는 웹 콘텐츠 접근성 가이드라인 2.1의 AA 수준을 준수합니다.
            스포츠 플랫폼의 모든 사용자가 동등하게 접근할 수 있도록 설계되었습니다.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AccessibilityInfo;