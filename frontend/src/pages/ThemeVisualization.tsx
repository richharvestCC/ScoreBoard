import React, { useMemo, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
  Chip,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import { useLanguage } from '../contexts/LanguageContext';
import ColorSwatch from '../components/common/ColorSwatch';

interface ColorItem {
  tone: string;
  color: string;
}

interface ColorGroup {
  name: string;
  colors: ColorItem[];
}

type PaletteColorKey = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

declare module '@mui/material/styles' {
  interface PaletteColor {
    50?: string;
    100?: string;
    200?: string;
    300?: string;
    400?: string;
    500?: string;
    600?: string;
    700?: string;
    800?: string;
    900?: string;
  }
}

interface Pattern {
  id: string;
  title: string;
  description: string;
  preview: React.ReactNode;
  tokens?: string[];
}

const PatternCard: React.FC<{ pattern: Pattern }> = ({ pattern }) => (
  <Paper
    id={pattern.id}
    elevation={0}
    sx={{
      p: 3,
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    }}
  >
    <Stack spacing={1.5}>
      <Box>
        <Typography variant="h6" color="primary.600">
          {pattern.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {pattern.description}
        </Typography>
      </Box>
      <Box
        sx={{
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: 1,
          backgroundColor: 'background.default',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        {pattern.preview}
      </Box>
      {pattern.tokens && pattern.tokens.length > 0 && (
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {pattern.tokens.map((token) => (
            <Chip key={token} label={token} size="small" variant="outlined" />
          ))}
        </Stack>
      )}
    </Stack>
  </Paper>
);

const ThemeVisualization: React.FC = React.memo(() => {
  const theme = useTheme();
  const { t } = useLanguage();

  const navItems = useMemo(
    () => [
      { label: t({ ko: '토큰', en: 'Foundations' }), href: '#foundations' },
      { label: t({ ko: '레이아웃', en: 'Layout' }), href: '#layout' },
      { label: t({ ko: '컴포넌트', en: 'Components' }), href: '#components' },
      { label: t({ ko: '토너먼트', en: 'Tournament' }), href: '#tournament-builder' },
    ],
    [t]
  );

  const layoutPatterns = useMemo<Pattern[]>(
    () => [
      {
        id: 'layout-container',
        title: t({ ko: '페이지 컨테이너', en: 'Page Container' }),
        description: t({
          ko: '전체 페이지는 Container maxWidth="xl"와 상하 패딩 spacing(4)을 사용해 공통 여백을 만듭니다.',
          en: 'Wrap pages in a Container with maxWidth="xl" and vertical padding spacing(4) to provide consistent breathing room.',
        }),
        tokens: [
          'maxWidth: xl',
          t({ ko: 'paddingY: theme.spacing(4)', en: 'paddingY: theme.spacing(4)' }),
          t({ ko: '배경: background.default', en: 'background: background.default' }),
        ],
        preview: (
          <Box sx={{ bgcolor: 'background.default', p: 1, borderRadius: 1 }}>
            <Container
              maxWidth="md"
              sx={{
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 1,
                bgcolor: 'background.paper',
                py: 2,
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                {t({ ko: '컨텐츠는 이 컨테이너 안에 배치됩니다.', en: 'Content lives inside this container.' })}
              </Typography>
              <Typography variant="body2">
                {t({ ko: '헤더, 카드 그룹, 표 등을 이 범위에 맞춰 정렬하세요.', en: 'Align headers, card groups and tables within this frame.' })}
              </Typography>
            </Container>
          </Box>
        ),
      },
      {
        id: 'layout-surface',
        title: t({ ko: '섹션 서피스', en: 'Section Surface' }),
        description: t({
          ko: '섹션 구분이 필요할 때 background.paper / background.default를 번갈아 사용하고, paddingY spacing(6)으로 호흡을 맞춥니다.',
          en: 'Alternate background.paper and background.default surfaces with spacing(6) vertical padding to separate sections.',
        }),
        tokens: [
          t({ ko: 'paddingY: theme.spacing(6)', en: 'paddingY: theme.spacing(6)' }),
          t({ ko: 'paddingX: theme.spacing(3)', en: 'paddingX: theme.spacing(3)' }),
          t({ ko: 'borderRadius: 1', en: 'borderRadius: 1' }),
        ],
        preview: (
          <Stack spacing={1.5}>
            <Box
              sx={{
                borderRadius: 1,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                py: 3,
                px: 2,
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                {t({ ko: 'Paper Surface', en: 'Paper Surface' })}
              </Typography>
              <Typography variant="body2">
                {t({ ko: '카드 또는 데이터 위젯', en: 'Cards or data widgets' })}
              </Typography>
            </Box>
            <Box
              sx={{
                borderRadius: 1,
                bgcolor: 'background.default',
                border: '1px dashed',
                borderColor: 'divider',
                py: 3,
                px: 2,
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                {t({ ko: 'Default Surface', en: 'Default Surface' })}
              </Typography>
              <Typography variant="body2">
                {t({ ko: '섹션 배경', en: 'Section background' })}
              </Typography>
            </Box>
          </Stack>
        ),
      },
      {
        id: 'layout-card-group',
        title: t({ ko: '카드 그룹', en: 'Card Group' }),
        description: t({
          ko: '3열 Grid와 spacing(2)을 사용해 카드 묶음을 배치합니다. 모바일에서는 1열로 자연스럽게 전환됩니다.',
          en: 'Use a three-column grid with spacing(2) for card groups that gracefully collapse to a single column on mobile.',
        }),
        tokens: [
          t({ ko: 'gridTemplateColumns: { xs: 1, md: 3 }', en: 'gridTemplateColumns: { xs: 1, md: 3 }' }),
          t({ ko: 'gap: theme.spacing(2)', en: 'gap: theme.spacing(2)' }),
          t({ ko: '카드 borderRadius: 1', en: 'card borderRadius: 1' }),
        ],
        preview: (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 2,
            }}
          >
            {[1, 2, 3].map((index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 2,
                }}
              >
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {t({ ko: `카드 ${index}`, en: `Card ${index}` })}
                </Typography>
                <Typography variant="body2">
                  {t({ ko: '요약 정보 또는 KPI', en: 'Summary info or KPI' })}
                </Typography>
              </Paper>
            ))}
          </Box>
        ),
      },
    ],
    [t]
  );

  const componentPatterns = useMemo<Pattern[]>(
    () => [
      {
        id: 'component-primary-card',
        title: t({ ko: '프라이머리 카드', en: 'Primary Card' }),
        description: t({
          ko: '카드 헤더 + 본문 + 액션을 Stack으로 구성합니다. 헤더는 subtitle2, 본문은 body2, 액션은 Button variant를 혼합하세요.',
          en: 'Compose cards with a header, body and action stack. Use subtitle2 for the header, body2 for content and mixed button variants for actions.',
        }),
        tokens: [
          t({ ko: 'padding: theme.spacing(3)', en: 'padding: theme.spacing(3)' }),
          t({ ko: 'borderRadius: 1', en: 'borderRadius: 1' }),
          t({ ko: 'border: 1px solid divider', en: 'border: 1px solid divider' }),
        ],
        preview: (
          <Paper
            elevation={0}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2, bgcolor: 'background.paper' }}
          >
            <Stack spacing={1.5}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  {t({ ko: '카드 헤더', en: 'Card Header' })}
                </Typography>
                <Typography variant="h6">{t({ ko: '토너먼트 요약', en: 'Tournament Summary' })}</Typography>
              </Box>
              <Typography variant="body2">
                {t({
                  ko: '카드 본문은 최대 두 줄 요약을 유지하며, 필요한 경우 버튼 또는 링크를 하단에 배치합니다.',
                  en: 'Keep the body copy concise (two lines max) and place actions or links at the bottom.',
                })}
              </Typography>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button size="small" variant="outlined">
                  {t({ ko: '자세히', en: 'Details' })}
                </Button>
                <Button size="small" variant="contained">
                  {t({ ko: '편집', en: 'Edit' })}
                </Button>
              </Stack>
            </Stack>
          </Paper>
        ),
      },
      {
        id: 'component-stat-card',
        title: t({ ko: '통계 카드', en: 'Stat Card' }),
        description: t({
          ko: '강조 컬러와 수치를 활용한 인포 카드입니다. 상단 Chip으로 상태를 표시하고, 혼합 타이포그래피로 대비를 줍니다.',
          en: 'A highlighted stat card using accent chips and mixed typography to emphasise current status.',
        }),
        tokens: [
          t({ ko: 'backgroundColor: primary.50', en: 'backgroundColor: primary.50' }),
          t({ ko: 'Chip 색상: primary / success', en: 'Chip color: primary / success' }),
        ],
        preview: (
          <Paper
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: 2,
              bgcolor: 'primary.50',
            }}
          >
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle2" color="primary.700" sx={{ fontWeight: 600 }}>
                  {t({ ko: '등록 팀', en: 'Registered Teams' })}
                </Typography>
                <Chip label="LIVE" color="primary" size="small" />
              </Stack>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                24
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t({ ko: '총 32팀 중 75% 완료', en: '75% of 32 allowable slots filled' })}
              </Typography>
            </Stack>
          </Paper>
        ),
      },
      {
        id: 'component-form-row',
        title: t({ ko: '폼 행 패턴', en: 'Form Row Pattern' }),
        description: t({
          ko: 'Stack direction="row"와 spacing(2)을 사용해 반응형 폼을 구성합니다. 모바일에서는 자동으로 세로 스택으로 전환됩니다.',
          en: 'Combine Stack direction="row" with spacing(2) for responsive forms that collapse vertically on mobile.',
        }),
        tokens: [
          t({ ko: 'Stack spacing: 2', en: 'Stack spacing: 2' }),
          t({ ko: 'TextField borderRadius: 0.5', en: 'TextField borderRadius: 0.5' }),
          t({ ko: 'Switch alignment: flex-end', en: 'Switch alignment: flex-end' }),
        ],
        preview: (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
            <TextField size="small" label={t({ ko: '대회 이름', en: 'Competition' })} defaultValue="MatchCard League" fullWidth />
            <FormControl size="small" fullWidth>
              <InputLabel id="component-form-round">{t({ ko: '라운드', en: 'Round' })}</InputLabel>
              <Select labelId="component-form-round" label={t({ ko: '라운드', en: 'Round' })} defaultValue="16">
                <MenuItem value="16">16</MenuItem>
                <MenuItem value="8">8</MenuItem>
                <MenuItem value="4">4</MenuItem>
              </Select>
            </FormControl>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {t({ ko: '조별 예선', en: 'Group Stage' })}
              </Typography>
              <Switch defaultChecked />
            </Stack>
          </Stack>
        ),
      },
      {
        id: 'component-action-row',
        title: t({ ko: '액션 행', en: 'Action Row' }),
        description: t({
          ko: '우측 정렬된 버튼 그룹으로 주요/보조 액션을 구분합니다. spacing(1)로 간격을 유지하고 IconButton으로 보조 도구를 배치합니다.',
          en: 'Right-align primary and secondary actions with spacing(1) and offer supplemental tooling via icon buttons.',
        }),
        tokens: [
          t({ ko: 'justifyContent: flex-end', en: 'justifyContent: flex-end' }),
          t({ ko: 'spacing: theme.spacing(1)', en: 'spacing: theme.spacing(1)' }),
        ],
        preview: (
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button variant="text" size="small">
              {t({ ko: '취소', en: 'Cancel' })}
            </Button>
            <Button variant="outlined" size="small">
              {t({ ko: '임시 저장', en: 'Save Draft' })}
            </Button>
            <Button variant="contained" size="small">
              {t({ ko: '배포', en: 'Publish' })}
            </Button>
          </Stack>
        ),
      },
    ],
    [t]
  );

  const tournamentPatterns = useMemo<Pattern[]>(
    () => [
      {
        id: 'tournament-settings-row',
        title: t({ ko: '토너먼트 설정 행', en: 'Tournament Settings Row' }),
        description: t({
          ko: '토너먼트 빌더 상단 바의 핵심 패턴입니다. 이름, 조별 예선 토글, 참가팀 수/그룹/승격 수를 두 행으로 나누어 구성합니다.',
          en: 'Primary pattern for the tournament builder toolbar with name, group stage toggle, participants, groups and promotion fields.',
        }),
        tokens: [
          t({ ko: 'borderRadius: 1', en: 'borderRadius: 1' }),
          t({ ko: 'padding: theme.spacing(3)', en: 'padding: theme.spacing(3)' }),
          t({ ko: 'Grid: { xs: 1, md: 2 }', en: 'Grid: { xs: 1, md: 2 }' }),
        ],
        preview: (
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center" rowGap={1.5}>
              <TextField
                size="small"
                label={t({ ko: '토너먼트 이름', en: 'Tournament Name' })}
                defaultValue="MatchCard Invitational"
                sx={{ width: { xs: '100%', md: '50%' } }}
              />
              <Stack direction="row" spacing={2} alignItems="center" sx={{ ml: { xs: 0, md: 'auto' }, width: { xs: '100%', md: 'auto' }, justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {t({ ko: '조별 예선', en: 'Group Stage' })}
                </Typography>
                <Switch defaultChecked />
              </Stack>
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
              <TextField
                size="small"
                type="number"
                label={t({ ko: '참가 팀 수', en: 'Participants' })}
                defaultValue={16}
                sx={{ width: { xs: '100%', md: '33.33%' } }}
              />
              <FormControl size="small" sx={{ width: { xs: '100%', md: '33.33%' } }}>
                <InputLabel id="tournament-guide-group-count">{t({ ko: '그룹 수', en: 'Groups' })}</InputLabel>
                <Select labelId="tournament-guide-group-count" label={t({ ko: '그룹 수', en: 'Groups' })} defaultValue="4">
                  {[2, 4, 6, 8].map((value) => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ width: { xs: '100%', md: '33.33%' } }}>
                <InputLabel id="tournament-guide-promotion">{t({ ko: '승격 팀', en: 'Promotion Slots' })}</InputLabel>
                <Select labelId="tournament-guide-promotion" label={t({ ko: '승격 팀', en: 'Promotion Slots' })} defaultValue="2">
                  {[1, 2, 3, 4].map((value) => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        ),
      },
      {
        id: 'tournament-bracket-card',
        title: t({ ko: '브래킷 매치 카드', en: 'Bracket Match Card' }),
        description: t({
          ko: '경기 카드는 borderRadius 1, 배경 background.default, hover 시 action.hover를 사용합니다. 상단에는 라운드/형식 배지를 보여줍니다.',
          en: 'Bracket match cards use borderRadius 1 with background.default and a hover highlight, displaying round labels and format chips on top.',
        }),
        tokens: [
          t({ ko: 'border: 1px solid divider', en: 'border: 1px solid divider' }),
          t({ ko: 'Chip variant="outlined"', en: 'Chip variant="outlined"' }),
        ],
        preview: (
          <Paper
            elevation={0}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2, bgcolor: 'background.default' }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                R1-M1
              </Typography>
              <Chip label={t({ ko: '단판', en: 'Single' })} size="small" color="secondary" variant="outlined" />
            </Stack>
            <Divider sx={{ mb: 1 }} />
            <Stack spacing={1}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Chip label="A1" size="small" color="primary" variant="outlined" />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Team Alpha
                </Typography>
              </Paper>
              <Paper
                variant="outlined"
                sx={{
                  p: 1,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Chip label="B2" size="small" color="primary" variant="outlined" />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Team Beta
                </Typography>
              </Paper>
            </Stack>
          </Paper>
        ),
      },
      {
        id: 'tournament-zoom-controls',
        title: t({ ko: '줌 컨트롤', en: 'Zoom Controls' }),
        description: t({
          ko: 'IconButton을 borderRadius 999 컨트롤 바에 배치해 줌 인/아웃/초기화 기능을 제공합니다. 하단 중앙에 정렬합니다.',
          en: 'Place three IconButtons inside a pill-shaped container (borderRadius 999) centred at the bottom for zoom in/out/reset.',
        }),
        tokens: [
          t({ ko: 'borderRadius: 999', en: 'borderRadius: 999' }),
          t({ ko: 'padding: theme.spacing(1.5)', en: 'padding: theme.spacing(1.5)' }),
          t({ ko: 'IconButton color="primary"', en: 'IconButton color="primary"' }),
        ],
        preview: (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              borderRadius: 999,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              p: 1.5,
            }}
          >
            <Tooltip title={t({ ko: '축소', en: 'Zoom out' })}>
              <IconButton color="primary" size="small">
                <ZoomOutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t({ ko: '초기화', en: 'Reset' })}>
              <IconButton color="primary" size="small">
                <CenterFocusStrongIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t({ ko: '확대', en: 'Zoom in' })}>
              <IconButton color="primary" size="small">
                <ZoomInIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
      {
        id: 'tournament-team-palette',
        title: t({ ko: '팀 팔레트 아이템', en: 'Team Palette Item' }),
        description: t({
          ko: '그룹/시드 리스트는 Paper variant="outlined"와 Chip 조합으로 구성하며, hover 시 action.hover 배경을 사용해 상호작용을 강조합니다.',
          en: 'Group or seed lists use Paper variant="outlined" with chips and action.hover backgrounds on hover to convey interactivity.',
        }),
        tokens: [
          t({ ko: 'variant="outlined"', en: 'variant="outlined"' }),
          t({ ko: 'hover: backgroundColor action.hover', en: 'hover: backgroundColor action.hover' }),
        ],
        preview: (
          <Stack spacing={1}>
            {['A1', 'A2', 'B1'].map((seed) => (
              <Paper
                key={seed}
                variant="outlined"
                sx={{
                  p: 1,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <Chip label={seed} size="small" variant="outlined" />
                <Typography variant="body2">{t({ ko: '팀 이름', en: 'Team Name' })}</Typography>
              </Paper>
            ))}
          </Stack>
        ),
      },
    ],
    [t]
  );

  const colorGroups = useMemo<ColorGroup[]>(() => {
    const tones = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'] as const;
    const colorNames: PaletteColorKey[] = ['primary', 'secondary', 'success', 'warning', 'error', 'info'];

    return colorNames
      .map((colorName) => {
        const paletteColor = theme.palette[colorName];
        if (!paletteColor || typeof paletteColor === 'string') return null;

        const colors: ColorItem[] = tones
          .filter((tone) => paletteColor[tone])
          .map((tone) => ({
            tone,
            color: paletteColor[tone] as string,
          }));

        return {
          name: colorName.charAt(0).toUpperCase() + colorName.slice(1),
          colors,
        };
      })
      .filter((group): group is ColorGroup => group !== null);
  }, [theme.palette]);

  const handleColorClick = useCallback((color: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(color);
    }
  }, []);

  const handleColorKeyDown = useCallback(
    (event: React.KeyboardEvent, color: string) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleColorClick(color);
      }
    },
    [handleColorClick]
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h1"
          component="h1"
          gutterBottom
          sx={{ color: 'primary.700', fontWeight: 700, textAlign: 'left', mb: 2 }}
        >
          {t({ ko: '매치카드 웹 스타일 가이드', en: 'MatchCard Web Style Guide' })}
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ maxWidth: 720, color: 'primary.400', textAlign: 'left', mb: 3 }}
        >
          {t({
            ko: '제품 전반에서 재사용되는 토큰과 패턴을 정리한 문서입니다. 동일한 컴포넌트를 빠르게 조합할 수 있도록 레이아웃, 카드, 폼, 토너먼트 UI 예시를 제공합니다.',
            en: 'A consolidated catalogue of tokens and patterns so teams can assemble screens quickly across the product.',
          })}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {navItems.map((item) => (
            <Button key={item.href} size="small" variant="outlined" component="a" href={item.href}>
              {item.label}
            </Button>
          ))}
        </Stack>
      </Box>

      {/* Foundations */}
      <Box id="foundations" sx={{ mb: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          gutterBottom
          sx={{ color: 'primary.700', fontWeight: 700, mb: 4, textAlign: 'left' }}
        >
          {t({ ko: '디자인 토큰', en: 'Design Tokens' })}
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: '100%',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" gutterBottom color="primary.600">
              {t({ ko: '타이포그래피', en: 'Typography' })}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {theme.typography.fontFamily}
            </Typography>
            <Stack spacing={1}>
              <Typography variant="h6">{t({ ko: '헤딩 예시', en: 'Heading Sample' })}</Typography>
              <Typography variant="body1">{t({ ko: '본문 텍스트', en: 'Body Text' })}</Typography>
              <Typography variant="body2">{t({ ko: '작은 텍스트', en: 'Caption Text' })}</Typography>
            </Stack>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: '100%',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" gutterBottom color="primary.600">
              {t({ ko: '둥근 모서리', en: 'Border Radius' })}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t({ ko: '기본', en: 'Default' })}: {theme.shape.borderRadius}px
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 40, height: 40, bgcolor: 'primary.100', borderRadius: 1 }} />
              <Box sx={{ width: 40, height: 40, bgcolor: 'primary.200', borderRadius: 2 }} />
              <Box sx={{ width: 40, height: 40, bgcolor: 'primary.300', borderRadius: 3 }} />
            </Stack>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: '100%',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" gutterBottom color="primary.600">
              {t({ ko: '간격', en: 'Spacing' })}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t({ ko: '기본 단위', en: 'Base unit' })}: {theme.spacing(1)}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 8, height: 20, bgcolor: 'secondary.400' }} />
              <Box sx={{ width: 16, height: 20, bgcolor: 'secondary.500' }} />
              <Box sx={{ width: 24, height: 20, bgcolor: 'secondary.600' }} />
            </Stack>
          </Paper>
        </Box>

        {/* Color Palette */}
        <Typography
          variant="h4"
          component="h3"
          gutterBottom
          sx={{ color: 'primary.700', fontWeight: 700, mb: 4, textAlign: 'left' }}
        >
          {t({ ko: '색상 팔레트 (50-900)', en: 'Color Palette (50-900)' })}
        </Typography>
        {colorGroups.map((group) => (
          <Box key={group.name} sx={{ mb: 6 }}>
            <Typography variant="h5" gutterBottom sx={{ color: 'primary.600', mb: 3, textAlign: 'left' }}>
              {t({ ko: `${group.name} 색상`, en: `${group.name} Colors` })}
            </Typography>
            <Box
              role="grid"
              aria-label={t({ ko: '색상 견본', en: 'Color swatches' })}
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(3, 1fr)',
                  sm: 'repeat(5, 1fr)',
                  md: 'repeat(10, 1fr)',
                },
                gap: 1,
              }}
            >
              {group.colors.map((colorItem) => (
                <ColorSwatch
                  key={colorItem.tone}
                  tone={colorItem.tone}
                  color={colorItem.color}
                  groupName={group.name}
                  onClick={handleColorClick}
                  onKeyDown={handleColorKeyDown}
                />
              ))}
            </Box>
          </Box>
        ))}

        {/* Spacing scale */}
        <Paper
          elevation={0}
          sx={{
            mb: 6,
            p: 4,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Typography variant="h4" component="h3" gutterBottom sx={{ color: 'primary.700', fontWeight: 700, mb: 2 }}>
            {t({ ko: '간격 시스템', en: 'Spacing System' })}
          </Typography>
          <Stack spacing={2.5}>
            {[1, 2, 3, 4, 6, 8].map((spacing) => (
              <Stack key={spacing} direction="row" spacing={2} alignItems="center">
                <Typography variant="body1" sx={{ minWidth: 80 }}>
                  {spacing}x ({theme.spacing(spacing)})
                </Typography>
                <Box
                  sx={{
                    height: 24,
                    width: theme.spacing(spacing),
                    bgcolor: 'secondary.400',
                    borderRadius: 1,
                  }}
                />
              </Stack>
            ))}
          </Stack>
        </Paper>

        {/* Typography */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h4" component="h3" gutterBottom sx={{ color: 'primary.700', fontWeight: 700, mb: 2 }}>
            {t({ ko: '타이포그래피', en: 'Typography' })}
          </Typography>
          <Typography variant="h1" gutterBottom>
            {t({ ko: 'H1 헤딩 (40px)', en: 'H1 Heading (40px)' })}
          </Typography>
          <Typography variant="h2" gutterBottom>
            {t({ ko: 'H2 헤딩 (32px)', en: 'H2 Heading (32px)' })}
          </Typography>
          <Typography variant="h3" gutterBottom>
            {t({ ko: 'H3 헤딩 (24px)', en: 'H3 Heading (24px)' })}
          </Typography>
          <Typography variant="h4" gutterBottom>
            {t({ ko: 'H4 헤딩 (20px)', en: 'H4 Heading (20px)' })}
          </Typography>
          <Typography variant="body1" gutterBottom>
            {t({ ko: 'Body1 본문 텍스트 (16px) - 기본 본문에 사용됩니다.', en: 'Body1 text (16px) for general content.' })}
          </Typography>
          <Typography variant="body2">
            {t({ ko: 'Body2 작은 텍스트 (14px) - 부가 정보에 사용됩니다.', en: 'Body2 small text (14px) for supporting details.' })}
          </Typography>
        </Paper>
      </Box>

      {/* Layout Patterns */}
      <Box id="layout" sx={{ mb: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          gutterBottom
          sx={{ color: 'primary.700', fontWeight: 700, mb: 4, textAlign: 'left' }}
        >
          {t({ ko: '레이아웃 패턴', en: 'Layout Patterns' })}
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3 }}>
          {layoutPatterns.map((pattern) => (
            <PatternCard key={pattern.id} pattern={pattern} />
          ))}
        </Box>
      </Box>

      {/* Component Patterns */}
      <Box id="components" sx={{ mb: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          gutterBottom
          sx={{ color: 'primary.700', fontWeight: 700, mb: 4, textAlign: 'left' }}
        >
          {t({ ko: '컴포넌트 패턴', en: 'Component Patterns' })}
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3 }}>
          {componentPatterns.map((pattern) => (
            <PatternCard key={pattern.id} pattern={pattern} />
          ))}
        </Box>
      </Box>

      {/* Tournament Builder Patterns */}
      <Box id="tournament-builder" sx={{ mb: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          gutterBottom
          sx={{ color: 'primary.700', fontWeight: 700, mb: 4, textAlign: 'left' }}
        >
          {t({ ko: '토너먼트 빌더 패턴', en: 'Tournament Builder Patterns' })}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 720, mb: 4 }}>
          {t({
            ko: '로그인 제한이 있는 토너먼트 생성기 페이지에서 사용되는 핵심 UI 조각입니다. 아래 패턴을 조합해 시나리오에 맞는 화면을 빠르게 구성할 수 있습니다.',
            en: 'Key UI building blocks from the restricted tournament builder page. Combine them to compose flows quickly.',
          })}
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3 }}>
          {tournamentPatterns.map((pattern) => (
            <PatternCard key={pattern.id} pattern={pattern} />
          ))}
        </Box>
      </Box>
    </Container>
  );
});

ThemeVisualization.displayName = 'ThemeVisualization';

export default ThemeVisualization;
