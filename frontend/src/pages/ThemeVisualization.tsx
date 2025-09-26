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
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import { useTheme } from '@mui/material/styles';
import { useLanguage } from '../contexts/LanguageContext';
import ColorSwatch from '../components/common/ColorSwatch';

// Type definitions
interface ColorItem {
  tone: string;
  color: string;
}

interface ColorGroup {
  name: string;
  colors: ColorItem[];
}

type PaletteColorKey = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

// Extend MUI theme type for custom palette properties
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

const ThemeVisualization: React.FC = React.memo(() => {
  const theme = useTheme();
  const { t } = useLanguage();

  // Memoized color extraction for performance
  const colorGroups = useMemo<ColorGroup[]>(() => {
    const tones = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'] as const;
    const colorNames: PaletteColorKey[] = ['primary', 'secondary', 'success', 'warning', 'error', 'info'];

    return colorNames.map(colorName => {
      const paletteColor = theme.palette[colorName];
      if (!paletteColor || typeof paletteColor === 'string') return null;

      const colors: ColorItem[] = tones
        .filter(tone => paletteColor[tone])
        .map(tone => ({
          tone,
          color: paletteColor[tone] as string
        }));

      return {
        name: colorName.charAt(0).toUpperCase() + colorName.slice(1),
        colors
      };
    }).filter((group): group is ColorGroup => group !== null);
  }, [theme.palette]);

  // Handle color click for clipboard copy
  const handleColorClick = useCallback((color: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(color);
    }
  }, []);

  // Handle keyboard events for color swatches
  const handleColorKeyDown = useCallback((event: React.KeyboardEvent, color: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleColorClick(color);
    }
  }, [handleColorClick]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 8 }}>
        <Typography
          variant="h1"
          component="h1"
          gutterBottom
          sx={{
            color: 'primary.700',
            fontWeight: 700,
            textAlign: 'left',
            mb: 2
          }}
        >
          {t({ ko: '매치카드 디자인 에셋', en: 'MatchCard Design Assets' })}
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            maxWidth: 600,
            color: 'primary.400',
            textAlign: 'left',
            mb: 2
          }}
        >
          {t({ ko: '매치카드는 머티리얼 디자인3를 이용하여 구축하였습니다.', en: 'MatchCard is built on Material Design 3.' })}
        </Typography>
      </Box>

      {/* Design Tokens Overview */}
      <Box id="tournament-builder" sx={{ mb: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          gutterBottom
          sx={{
            color: 'primary.700',
            fontWeight: 700,
            mb: 4,
            textAlign: 'left'
          }}
        >
          {t({ ko: '디자인 토큰', en: 'Design Tokens' })}
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          <Box>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: '100%',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2
              }}
            >
              <Typography variant="h6" gutterBottom color="primary.600">
                {t({ ko: '글꼴', en: 'Typography' })}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {theme.typography.fontFamily}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="h6">{t({ ko: '헤딩 예시', en: 'Heading Example' })}</Typography>
                <Typography variant="body1">{t({ ko: '본문 텍스트', en: 'Body Text' })}</Typography>
                <Typography variant="body2">{t({ ko: '작은 텍스트', en: 'Small Text' })}</Typography>
              </Box>
            </Paper>
          </Box>

          <Box>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: '100%',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2
              }}
            >
              <Typography variant="h6" gutterBottom color="primary.600">
                {t({ ko: '둥근 모서리', en: 'Border Radius' })}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t({ ko: '기본', en: 'Default' })}: {theme.shape.borderRadius}px
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Box sx={{ width: 40, height: 40, bgcolor: 'primary.100', borderRadius: 1 }} />
                <Box sx={{ width: 40, height: 40, bgcolor: 'primary.200', borderRadius: 2 }} />
                <Box sx={{ width: 40, height: 40, bgcolor: 'primary.300', borderRadius: 3 }} />
              </Box>
            </Paper>
          </Box>

          <Box>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: '100%',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2
              }}
            >
              <Typography variant="h6" gutterBottom color="primary.600">
                {t({ ko: '간격', en: 'Spacing' })}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t({ ko: '기본 단위', en: 'Base Unit' })}: {theme.spacing(1)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 20, bgcolor: 'secondary.400' }} />
                <Box sx={{ width: 16, height: 20, bgcolor: 'secondary.500' }} />
                <Box sx={{ width: 24, height: 20, bgcolor: 'secondary.600' }} />
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* Color Palette */}
      <Box sx={{ mb: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          gutterBottom
          sx={{
            color: 'primary.700',
            fontWeight: 700,
            mb: 6,
            textAlign: 'left'
          }}
        >
          {t({ ko: '색상 팔레트 (50-900 톤)', en: 'Color Palette (50-900 Tones)' })}
        </Typography>
        {colorGroups.map((group) => (
          <Box key={group.name} sx={{ mb: 6 }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                color: 'primary.600',
                mb: 4,
                textAlign: 'left'
              }}
            >
              {t({ ko: `${group.name} 색상`, en: `${group.name} Colors` })}
            </Typography>

            {/* Color Grid - CSS Grid for better responsiveness */}
            <Box
              role="grid"
              aria-label={t({ ko: '색상 견본', en: 'Color swatches' })}
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(3, 1fr)',
                  sm: 'repeat(5, 1fr)',
                  md: 'repeat(10, 1fr)'
                },
                gap: 1,
                minChildWidth: '80px'
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
      </Box>

      {/* Spacing Section */}
      <Box
        sx={{
          mb: 6,
          p: 6,
          borderRadius: 3,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography
          variant="h3"
          component="h2"
          gutterBottom
          sx={{
            color: 'primary.700',
            fontWeight: 700,
            mb: 4,
            textAlign: 'left'
          }}
        >
          {t({ ko: '간격 시스템', en: 'Spacing System' })}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {[1, 2, 3, 4, 6, 8].map((spacing) => (
            <Box key={spacing} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body1" sx={{ minWidth: 60 }}>
                {spacing}x ({theme.spacing(spacing)})
              </Typography>
              <Box
                sx={{
                  height: 24,
                  width: theme.spacing(spacing),
                  bgcolor: 'secondary.400',
                  borderRadius: 1
                }}
              />
            </Box>
          ))}
        </Box>
      </Box>

      {/* Typography Examples */}
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h3"
          component="h2"
          gutterBottom
          sx={{
            color: 'primary.700',
            fontWeight: 700,
            mb: 4,
            textAlign: 'left'
          }}
        >
          {t({ ko: '타이포그래피', en: 'Typography' })}
        </Typography>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2
          }}
        >
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
            {t({ ko: 'Body1 본문 텍스트 (16px) - 기본 본문에 사용되는 텍스트입니다.', en: 'Body1 text (16px) - Used for main body content.' })}
          </Typography>
          <Typography variant="body2" sx={{ m: 0 }}>
            {t({ ko: 'Body2 작은 본문 텍스트 (14px) - 부가적인 정보에 사용됩니다.', en: 'Body2 small text (14px) - Used for supplementary information.' })}
          </Typography>
        </Paper>
      </Box>

      {/* Component Examples */}
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h3"
          component="h2"
          gutterBottom
          sx={{
            color: 'primary.700',
            fontWeight: 700,
            mb: 4,
            textAlign: 'left'
          }}
        >
          {t({ ko: '컴포넌트 예시', en: 'Component Examples' })}
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
          <Box>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2
              }}
            >
              <Typography variant="h6" gutterBottom>
                {t({ ko: '칩/배지', en: 'Chips/Badges' })}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip label={t({ ko: '성공', en: 'Success' })} color="success" />
                <Chip label={t({ ko: '경고', en: 'Warning' })} color="warning" />
                <Chip label={t({ ko: '오류', en: 'Error' })} color="error" />
                <Chip label={t({ ko: '정보', en: 'Info' })} color="info" />
              </Box>
            </Paper>
          </Box>

          <Box>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2
              }}
            >
              <Typography variant="h6" gutterBottom>
                {t({ ko: '구분선', en: 'Divider' })}
              </Typography>
              <Box sx={{ py: 2 }}>
                <Divider />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {t({ ko: '섹션 구분에 사용되는 요소', en: 'Element used for section separation' })}
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* Tournament Builder UI Guide */}
      <Box sx={{ mb: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          gutterBottom
          sx={{
            color: 'primary.700',
            fontWeight: 700,
            mb: 2,
            textAlign: 'left'
          }}
        >
          {t({ ko: '토너먼트 빌더 UI 가이드', en: 'Tournament Builder UI Guide' })}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: 720, mb: 4 }}
        >
          {t({
            ko: '토너먼트 생성기에서 사용한 핵심 패턴을 정리했습니다. 컴포넌트 재사용 시 테마 토큰과 패딩, 라운드 수치를 유지해 일관성을 확보하세요.',
            en: 'Key patterns used in the tournament builder. Keep theme tokens, padding, and corner radii for a consistent experience.'
          })}
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            <Typography variant="h6" color="primary.600">
              {t({ ko: '컨테이너', en: 'Container' })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t({
                ko: 'borderRadius 1과 divider 보더를 사용해 카드형 그리드를 구성합니다. 배경은 background.paper, 내부 패딩은 theme.spacing(3)입니다.',
                en: 'Use borderRadius 1, divider border, background.paper, and spacing(3) padding to build card-like containers.'
              })}
            </Typography>
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                backgroundColor: 'background.paper',
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                {t({ ko: '예시 컨테이너', en: 'Example container' })}
              </Typography>
              <Typography variant="body2">
                {t({ ko: '라운드·팔레트 래퍼가 공유하는 기본 스타일', en: 'Base style shared by rounds and palette sections.' })}
              </Typography>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            <Typography variant="h6" color="primary.600">
              {t({ ko: '설정 패널', en: 'Settings Panel' })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t({
                ko: 'TextField는 borderRadius 0.5, 내부 패딩 12×10px을 유지합니다. Select와 Switch도 동일 라운드를 사용합니다.',
                en: 'Text fields use borderRadius 0.5 with 12×10px padding; selects and switches share the same radius.'
              })}
            </Typography>
            <Stack
              spacing={2}
              sx={{
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 1,
                p: 2
              }}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                <TextField
                  label={t({ ko: '토너먼트 이름', en: 'Tournament name' })}
                  defaultValue="MatchCard Cup"
                  size="small"
                  sx={{ flex: 1 }}
                />
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {t({ ko: '조별 예선', en: 'Group stage' })}
                  </Typography>
                  <Switch defaultChecked inputProps={{ 'aria-label': 'group stage example' }} />
                </Stack>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  type="number"
                  label={t({ ko: '참가 팀', en: 'Participants' })}
                  defaultValue={16}
                  size="small"
                  sx={{ width: { xs: '100%', sm: '33.33%' } }}
                />
                <FormControl size="small" sx={{ width: { xs: '100%', sm: '33.33%' } }}>
                  <InputLabel id="guide-group-count">{t({ ko: '그룹 수', en: 'Groups' })}</InputLabel>
                  <Select labelId="guide-group-count" label={t({ ko: '그룹 수', en: 'Groups' })} defaultValue="4">
                    <MenuItem value="4">4</MenuItem>
                    <MenuItem value="8">8</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ width: { xs: '100%', sm: '33.33%' } }}>
                  <InputLabel id="guide-promotion">{t({ ko: '승격 팀', en: 'Promotion' })}</InputLabel>
                  <Select labelId="guide-promotion" label={t({ ko: '승격 팀', en: 'Promotion' })} defaultValue="2">
                    <MenuItem value="1">1</MenuItem>
                    <MenuItem value="2">2</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button variant="outlined" size="small">
                  {t({ ko: '임시 저장', en: 'Save draft' })}
                </Button>
                <Button variant="contained" size="small">
                  {t({ ko: '시드 생성', en: 'Generate seeds' })}
                </Button>
              </Stack>
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            <Typography variant="h6" color="primary.600">
              {t({ ko: '브래킷 카드', en: 'Bracket Card' })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t({
                ko: '경기 카드는 borderRadius 1, 배경 background.default, hover 시 action.hover 컬러를 사용합니다.',
                en: 'Match cards use borderRadius 1 with background.default and action.hover on hover.'
              })}
            </Typography>
            <Paper
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 2,
                backgroundColor: 'background.default'
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  R1-M1
                </Typography>
                <Chip label="단판 경기" color="secondary" size="small" variant="outlined" />
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
                    gap: 1
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
                    gap: 1
                  }}
                >
                  <Chip label="B2" size="small" color="primary" variant="outlined" />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Team Beta
                  </Typography>
                </Paper>
              </Stack>
            </Paper>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            <Typography variant="h6" color="primary.600">
              {t({ ko: '줌 컨트롤', en: 'Zoom Controls' })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t({
                ko: 'IconButton은 primary 색상을 사용하고, 컨트롤 래퍼는 borderRadius 999와 container 색상을 적용합니다.',
                en: 'Icon buttons use the primary color; the control pill uses borderRadius 999 with container styling.'
              })}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                borderRadius: 999,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                p: 1.5,
                justifyContent: 'center'
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
          </Paper>
        </Box>
      </Box>
    </Container>
  );
});

ThemeVisualization.displayName = 'ThemeVisualization';

export default ThemeVisualization;
