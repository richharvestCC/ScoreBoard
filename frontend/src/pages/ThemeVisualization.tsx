import React, { useMemo, useCallback } from 'react';
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Checkbox,
  Radio,
  FormControlLabel,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BadgeIcon from '@mui/icons-material/Badge';
import PaletteIcon from '@mui/icons-material/Palette';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import WidgetsIcon from '@mui/icons-material/Widgets';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import ConstructionIcon from '@mui/icons-material/Construction';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useLanguage } from '../contexts/LanguageContext';
import ColorSwatch from '../components/common/ColorSwatch';
import MotionDemo from '../components/demos/MotionDemo';
import StateTokensDemo from '../components/demos/StateTokensDemo';
import InputsDemo from '../components/demos/InputsDemo';
import DialogsDemo from '../components/demos/DialogsDemo';
import ProgressDemo from '../components/demos/ProgressDemo';
import TabsDemo from '../components/demos/TabsDemo';
import SlidersDemo from '../components/demos/SlidersDemo';
import SnackbarsDemo from '../components/demos/SnackbarsDemo';
import SheetsDemo from '../components/demos/SheetsDemo';
import SegmentedButtonsDemo from '../components/demos/SegmentedButtonsDemo';
import FABDemo from '../components/demos/FABDemo';
import DataTableDemo from '../components/demos/DataTableDemo';
import BannersAdvancedDemo from '../components/demos/BannersAdvancedDemo';
import ProgressAdvancedDemo from '../components/demos/ProgressAdvancedDemo';
import TabsIconsCenteredDemo from '../components/demos/TabsIconsCenteredDemo';
import ChipsInputDemo from '../components/demos/ChipsInputDemo';
import DateTimeInputsDemo from '../components/demos/DateTimeInputsDemo';
import DetailsPanel from '../components/guide/DetailsPanel';
import ChipsDemo from '../components/demos/ChipsDemo';
import DialogVariantsDemo from '../components/demos/DialogVariantsDemo';
import SectionBlock from '../components/guide/SectionBlock';
import AnchorNav from '../components/guide/AnchorNav';
import useScrollSpy from '../hooks/useScrollSpy';

type PaletteColorKey = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

type Pattern = {
  title: string;
  description: string;
  tokens?: string[];
  content: React.ReactNode;
  fullWidth?: boolean;
};

type Section = {
  id: string;
  icon: React.ReactNode;
  title: string;
  summary: string;
  patterns: Pattern[];
};

// Motion demo moved to components/demos/MotionDemo

const ThemeVisualization: React.FC = React.memo(() => {
  const theme = useTheme();
  const { t } = useLanguage();

  const paletteTones = useMemo(() => {
    const tones = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'] as const;
    const colours: PaletteColorKey[] = ['primary', 'secondary', 'success', 'warning', 'error', 'info'];
    return colours.map((key) => {
      const palette = theme.palette[key];
      if (!palette || typeof palette === 'string') return null;
      const extended = palette as unknown as Record<string, string>;
      return tones
        .filter((tone) => extended[tone])
        .map((tone) => ({
          tone,
          value: extended[tone],
          label: `${key.toUpperCase()} ${tone}`,
        }));
    });
  }, [theme.palette]);

  const handleColorClick = useCallback((value: string) => {
    if (navigator.clipboard) navigator.clipboard.writeText(value);
  }, []);

  const overview: Section = useMemo(() => ({
    id: 'overview',
    icon: <AutoAwesomeIcon />,
    title: t({ ko: '0. 개요 (Overview)', en: '0. Overview' }),
    summary: t({
      ko: 'MatchCard를 구성하는 디자인 철학과 브랜드 톤을 정의합니다.',
      en: 'Outlines the MatchCard design philosophy and voice & tone pillars.',
    }),
    patterns: [
      {
        title: t({ ko: '디자인 원칙', en: 'Design principles' }),
        description: t({
          ko: 'Accessible First, Data Clarity, Real-time Energy, Systematic Motion을 유지합니다.',
          en: 'Maintain Accessible First, Data Clarity, Real-time Energy and Systematic Motion.',
        }),
        content: (
          <Stack spacing={1}>
            {[t({ ko: '• Accessible First: 모든 상태에 hover / focus 대비 적용', en: '• Accessible first: apply hover / focus contrast to every state.' }), t({ ko: '• Data Clarity: 경기 데이터는 비교 가능한 카드로 묶음', en: '• Data clarity: group match data inside comparable cards.' }), t({ ko: '• Real-time Energy: 라이브 상태를 색상과 애니메이션으로 강조', en: '• Real-time energy: highlight live states with colour and motion.' }), t({ ko: '• Systematic Motion: 200~240ms 트랜지션, 단일 easing 사용', en: '• Systematic motion: 200–240 ms transitions with consistent easing.' })].map((line) => (
              <Typography key={line} variant="body2">
                {line}
              </Typography>
            ))}
          </Stack>
        ),
      },
      {
        title: t({ ko: '브랜드 키워드 & 톤', en: 'Brand keywords & tone' }),
        description: t({
          ko: '키워드: Competitive · Trustworthy · Collaborative. 짧고 명확한 문장으로 안내합니다.',
          en: 'Keywords: Competitive · Trustworthy · Collaborative. Communicate with concise, clear sentences.',
        }),
        content: (
          <Stack spacing={1.5}>
            <Typography variant="subtitle2" color="text.secondary">
              {t({ ko: 'Voice & Tone 예시', en: 'Voice & tone samples' })}
            </Typography>
            <Typography variant="body2">
              {t({ ko: '• Do: "다음 경기가 10분 후 시작됩니다."', en: '• Do: “Next match kicks off in 10 minutes.”' })}
            </Typography>
            <Typography variant="body2">
              {t({ ko: '• Do: "팀 A가 시즌 최고 득점을 달성했습니다."', en: '• Do: “Team A just reached the season-high score.”' })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t({ ko: '• Don’t: 과한 감탄사, 모호한 표현', en: '• Don’t: overuse exclamations or vague wording.' })}
            </Typography>
          </Stack>
        ),
      },
    ],
  }), [t]);

  const identity: Section = useMemo(() => ({
    id: 'identity',
    icon: <BadgeIcon />,
    title: t({ ko: '1. 아이덴티티 (Identity)', en: '1. Identity' }),
    summary: t({
      ko: '로고 안전영역, 배경 대비, 브랜드 색 적용 규칙.',
      en: 'Logo clear space, background contrast and brand colour usage.',
    }),
    patterns: [
      {
        title: t({ ko: '로고 안전 영역', en: 'Logo clear space' }),
        description: t({
          ko: '로고 사방 0.5X 이상의 여백을 확보하고, 최소 높이 24px 이상 유지합니다.',
          en: 'Reserve 0.5X padding around the logo with a minimum height of 24 px.',
        }),
        tokens: ['Safe area: 0.5X', 'Min size: 24px'],
        content: (
          <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 1, p: 2, bgcolor: 'background.default' }}>
            <Box sx={{ width: 160, height: 64, borderRadius: 1, bgcolor: 'primary.100', mx: 'auto', position: 'relative' }}>
              <Box sx={{ position: 'absolute', inset: 8, border: '1px solid', borderColor: 'primary.300', borderRadius: 1 }}>
                <Typography variant="subtitle2" align="center" sx={{ mt: 2, color: 'primary.700' }}>
                  MatchCard
                </Typography>
              </Box>
            </Box>
          </Box>
        ),
      },
      {
        title: t({ ko: '배경별 로고 사용', en: 'Logo background usage' }),
        description: t({
          ko: '밝은 배경에는 컬러 로고, 어두운 배경에는 단색/반전 로고를 사용합니다.',
          en: 'Use colour logo on light surfaces and mono/inverse logo on dark surfaces.',
        }),
        content: (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Box sx={{ flex: 1, borderRadius: 1, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', p: 2 }}>
              <Typography variant="subtitle2" color="primary.600" sx={{ mb: 1 }}>
                {t({ ko: 'Do', en: 'Do' })}
              </Typography>
              <Typography variant="body2">
                {t({ ko: '단색 배경 + 정비례 로고', en: 'Solid background + proportional logo.' })}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, borderRadius: 1, bgcolor: 'background.paper', border: '1px dashed', borderColor: 'error.light', p: 2 }}>
              <Typography variant="subtitle2" color="error.main" sx={{ mb: 1 }}>
                {t({ ko: 'Don’t', en: 'Don’t' })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t({ ko: '복잡한 패턴 위 배치, 비율 왜곡 금지', en: 'Avoid patterned backgrounds or distorted ratios.' })}
              </Typography>
            </Box>
          </Stack>
        ),
      },
    ],
  }), [t]);

  const colorSection: Section = useMemo(() => ({
    id: 'color',
    icon: <PaletteIcon />,
    title: t({ ko: '2. 컬러 시스템 (Colour)', en: '2. Colour System' }),
    summary: t({
      ko: '브랜드 팔레트, 성공/경고/오류 색상, 대비 규칙.',
      en: 'Brand palette, semantic colours and contrast rules.',
    }),
    patterns: [
      {
        title: t({ ko: '기본 팔레트', en: 'Core palette' }),
        description: t({
          ko: 'Primary, Secondary 및 Semantic 색상 톤을 제공합니다. 클릭하면 HEX가 복사됩니다.',
          en: 'Primary, secondary and semantic tones. Click to copy HEX values.',
        }),
        fullWidth: true,
        content: (
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' } }}>
            {paletteTones.map((group, index) => (
              <Box key={`palette-${index}`}>
                <Stack spacing={1}>
                  {group?.map((item) => (
                    <ColorSwatch
                      key={item.label}
                      tone={item.tone}
                      color={item.value}
                      groupName={item.label}
                      onClick={handleColorClick}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          handleColorClick(item.value);
                        }
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            ))}
          </Box>
        ),
      },
      {
        title: t({ ko: 'Semantic 색상', en: 'Semantic colours' }),
        description: t({
          ko: '성공 / 경고 / 오류 / 정보 색상과 사용 예시.',
          en: 'Success, warning, error and info colours with usage guidance.',
        }),
        tokens: ['Success: #229c56', 'Warning: #e89611', 'Error: #d55230'],
        content: (
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {['success', 'warning', 'error', 'info'].map((tone) => (
              <Chip key={tone} label={tone.toUpperCase()} sx={{ bgcolor: `${tone}.100`, color: `${tone}.800`, minWidth: 120 }} />
            ))}
          </Stack>
        ),
      },
      {
        title: t({ ko: '배경 대비', en: 'Surface contrast' }),
        description: t({
          ko: 'Surface-0, Surface-1, Surface-2의 대비를 유지하고 배경과 카드 색의 명도 차이를 확보합니다.',
          en: 'Keep contrast between Surface-0, Surface-1 and Surface-2 for readability.',
        }),
        content: (
          <Stack spacing={1.5}>
            <Paper elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Surface-1
              </Typography>
              <Typography variant="body2">{t({ ko: '카드, 패널 등에 사용', en: 'Use for cards and panels.' })}</Typography>
            </Paper>
            <Box sx={{ borderRadius: 1, border: '1px dashed', borderColor: 'divider', bgcolor: 'background.default', p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Surface-0
              </Typography>
              <Typography variant="body2">{t({ ko: '페이지 배경 및 섹션 구분', en: 'Page background and section separation.' })}</Typography>
            </Box>
          </Stack>
        ),
      },
    ],
  }), [t, paletteTones, handleColorClick]);

  const typographySection: Section = useMemo(() => ({
    id: 'typography',
    icon: <TextFieldsIcon />,
    title: t({ ko: '3. 타이포그래피 (Typography)', en: '3. Typography' }),
    summary: t({
      ko: '계층, 문단 스타일, 한국어/영어 페어링 규칙.',
      en: 'Hierarchy, paragraph styles and Korean/English pairing rules.',
    }),
    patterns: [
      {
        title: t({ ko: '타입 히에라키', en: 'Type hierarchy' }),
        description: t({
          ko: 'H1~H6, Body1, Body2, Caption, Button 스타일을 정의합니다.',
          en: 'Defines H1–H6, Body1, Body2, Caption and Button styles.',
        }),
        tokens: ['H4: 24px', 'Body1: 16px', 'Body2: 14px'],
        content: (
          <Stack spacing={1.2}>
            <Typography variant="h4">H4 MatchCard Headline</Typography>
            <Typography variant="h5">H5 Section Title</Typography>
            <Typography variant="body1">{t({ ko: 'Body1: 경기 설명, 페이지 개요에 사용', en: 'Body1: use for match summaries and page intros.' })}</Typography>
            <Typography variant="body2" color="text.secondary">{t({ ko: 'Body2: 보조 정보, 메타 데이터에 사용', en: 'Body2: use for supporting information and metadata.' })}</Typography>
          </Stack>
        ),
      },
      {
        title: t({ ko: '언어 페어링', en: 'Language pairing' }),
        description: t({
          ko: '영문 Roboto, 국문 Noto Sans KR을 혼용하며, 숫자/단위는 Roboto를 유지합니다.',
          en: 'Use Roboto for English, Noto Sans KR for Korean, while keeping numbers/units in Roboto.',
        }),
        content: (
          <Stack spacing={1.2}>
            <Typography variant="body1">MatchCard Invitational</Typography>
            <Typography variant="body1">매치카드 인비테이셔널</Typography>
            <Typography variant="body2" color="text.secondary">
              {t({ ko: '숫자 표기 예시: 24:13 (Roboto 기본)', en: 'Numeric example: 24:13 (kept in Roboto).' })}
            </Typography>
          </Stack>
        ),
      },
    ],
  }), [t]);

  const layoutSection: Section = useMemo(() => ({
    id: 'layout',
    icon: <ViewWeekIcon />,
    title: t({ ko: '4. 레이아웃 (Layout)', en: '4. Layout' }),
    summary: t({
      ko: '페이지 컨테이너, 서피스 레이어, 카드 그룹 패턴.',
      en: 'Page container, surface layering and card grouping.',
    }),
    patterns: [
      {
        title: t({ ko: '페이지 컨테이너', en: 'Page container' }),
        description: t({
          ko: '최대 폭 1440px 중앙 정렬, 상하 패딩 32~48px, 좌우 24px.',
          en: 'Centered max-width 1440px with 32–48px vertical and 24px horizontal padding.',
        }),
        content: (
          <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 1, bgcolor: 'background.default', p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              {t({ ko: '컨테이너 내부', en: 'Inside container' })}
            </Typography>
            <Typography variant="body2">
              {t({ ko: '헤더, 카드, 그래프의 기준 정렬 영역', en: 'Alignment zone for headers, cards and charts.' })}
            </Typography>
          </Box>
        ),
        tokens: ['maxWidth: 1440px', 'paddingY: 48px', 'paddingX: 24px'],
      },
      {
        title: t({ ko: '서피스 vs 배경', en: 'Surface vs background' }),
        description: t({
          ko: 'Surface-0은 배경, Surface-1은 카드, Surface-2는 모달/패널.',
          en: 'Surface-0 backgrounds, Surface-1 cards, Surface-2 floating panels.',
        }),
        content: (
          <Stack spacing={1.5}>
            <Paper elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t({ ko: 'Surface-1: 카드', en: 'Surface 1: Card' })}
              </Typography>
              <Typography variant="body2">{t({ ko: '목록/카드/통계용', en: 'Used for lists, cards and stats.' })}</Typography>
            </Paper>
            <Box sx={{ borderRadius: 1, border: '1px dashed', borderColor: 'divider', bgcolor: 'background.default', p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t({ ko: 'Surface-0: 배경', en: 'Surface 0: Background' })}
              </Typography>
              <Typography variant="body2">{t({ ko: '섹션 구분, 페이지 베이스', en: 'Section separation and page base.' })}</Typography>
            </Box>
          </Stack>
        ),
        tokens: ['Elevation 0–2', 'Surface tones'],
      },
      {
        title: t({ ko: '카드 그룹', en: 'Card group' }),
        description: t({
          ko: '3열 Grid, gap 16px. 모바일에서는 1열.',
          en: 'Three-column grid with 16px gap, collapsing to single column on mobile.',
        }),
        fullWidth: true,
        content: (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            {[1, 2, 3].map((card) => (
              <Paper key={card} elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t({ ko: `카드 ${card}`, en: `Card ${card}` })}
                </Typography>
                <Typography variant="body2">{t({ ko: '요약 정보 또는 KPI', en: 'Summary info or KPI.' })}</Typography>
              </Paper>
            ))}
          </Box>
        ),
        tokens: ['Grid: repeat(3, 1fr)', 'Gap: 16px'],
      },
      {
        title: t({ ko: '그리드 시스템', en: 'Grid system' }),
        description: t({
          ko: '12컬럼 레이아웃, 모바일 4컬럼. Gutter 16px, Column 80px 기준.',
          en: '12-column desktop grid, 4-column mobile. Gutters 16px, columns 80px.',
        }),
        fullWidth: true,
        content: (
          <Stack spacing={2}>
            {[12, 9, 6, 4, 3].map((colCount) => (
              <Box key={`grid-${colCount}`} sx={{ borderRadius: 1, border: '1px dashed', borderColor: 'divider', p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  {t({ ko: `${colCount}컬럼`, en: `${colCount} columns` })}
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))`, gap: 0.5 }}>
                  {Array.from({ length: colCount }).map((_, index) => (
                    <Box key={`col-${colCount}-${index}`} sx={{ bgcolor: index % 2 === 0 ? 'primary.50' : 'primary.100', borderRadius: 0.5, height: 36 }} />
                  ))}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {colCount === 12
                    ? t({ ko: 'Desktop 기본: 12 columns, gutter 16px, margin 24px', en: 'Desktop base: 12 columns, 16px gutter, 24px margin.' })
                    : t({ ko: '반응형 활용 예시', en: 'Responsive breakpoint example.' })}
                </Typography>
              </Box>
            ))}
          </Stack>
        ),
        tokens: ['Desktop: 12 col', 'Mobile: 4 col', 'Gutter: 16px'],
      },
      {
        title: t({ ko: '여백 & 패딩', en: 'Margin & padding' }),
        description: t({
          ko: '외부 여백은 24/32/48px 단위, 내부 패딩은 16/24px 중심으로 사용합니다.',
          en: 'Use outer margins at 24/32/48px and inner padding at 16/24px increments.',
        }),
        content: (
          <Stack spacing={1}>
            {[t({ ko: '• 섹션 상단/하단: 48px', en: '• Section top/bottom: 48px' }), t({ ko: '• 카드 내부 패딩: 24px', en: '• Card inner padding: 24px' }), t({ ko: '• 위젯 간 간격: 16px', en: '• Widget spacing: 16px' })].map((line) => (
              <Typography key={line} variant="body2">
                {line}
              </Typography>
            ))}
          </Stack>
        ),
        tokens: ['Margin: 24/32/48px', 'Padding: 16/24px'],
      },
    ],
  }), [t]);

  const componentSection: Section = useMemo(() => ({
    id: 'components',
    icon: <WidgetsIcon />,
    title: t({ ko: '5. 컴포넌트 (Components)', en: '5. Components' }),
    summary: t({
      ko: '카드, 통계 블록, 폼, 액션 바, 배지 패턴.',
      en: 'Reusable cards, metric blocks, forms, action bars and badges.',
    }),
    patterns: [
      {
        title: t({ ko: '프라이머리 카드', en: 'Primary card' }),
        description: t({
          ko: '타이틀 + 본문 + 액션. padding 24px, Stack spacing 16px.',
          en: 'Title + body + actions with 24px padding and 16px spacing.',
        }),
        content: (
          <Stack spacing={1.5}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                {t({ ko: '카드 헤더', en: 'Card header' })}
              </Typography>
              <Typography variant="h6">{t({ ko: '토너먼트 요약', en: 'Tournament summary' })}</Typography>
            </Box>
            <Typography variant="body2">{t({ ko: '두 줄 이하로 핵심 정보를 제공하세요.', en: 'Keep key information within two lines.' })}</Typography>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button size="small" variant="outlined">
                {t({ ko: '자세히', en: 'Details' })}
              </Button>
              <Button size="small" variant="contained">
                {t({ ko: '편집', en: 'Edit' })}
              </Button>
            </Stack>
          </Stack>
        ),
        tokens: ['padding: 24px', 'Stack: 16px', 'borderRadius: 16px'],
      },
      {
        title: t({ ko: '통계 블록', en: 'Metric block' }),
        description: t({
          ko: '강조 컬러 배경 + 주요 수치 + 부가 설명. 상태 Chip 포함.',
          en: 'Accent background with key value, supporting copy and status chip.',
        }),
        content: (
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle2" color="primary.700" sx={{ fontWeight: 600 }}>
                {t({ ko: '등록 팀', en: 'Registered teams' })}
              </Typography>
              <Chip label="LIVE" size="small" color="primary" />
            </Stack>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              24
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t({ ko: '총 32팀 중 75% 완료', en: '75% of 32 slots filled' })}
            </Typography>
          </Stack>
        ),
        tokens: ['bg: primary.50', 'Chip: primary', 'value: h3'],
      },
      {
        title: t({ ko: '폼 행', en: 'Form row' }),
        description: t({
          ko: 'Stack row spacing 16px, 모바일에서는 세로 정렬.',
          en: 'Row stack spacing 16px; collapses to column on mobile.',
        }),
        content: (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
            <TextField label={t({ ko: '대회 이름', en: 'Competition' })} size="small" defaultValue="MatchCard League" fullWidth />
            <FormControl fullWidth size="small">
              <InputLabel id="component-round">{t({ ko: '라운드', en: 'Round' })}</InputLabel>
              <Select labelId="component-round" label={t({ ko: '라운드', en: 'Round' })} defaultValue="16">
                {[16, 8, 4].map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {t({ ko: '조별 예선', en: 'Group stage' })}
              </Typography>
              <Switch defaultChecked />
            </Stack>
          </Stack>
        ),
        tokens: ['Stack spacing: 16px', 'TextField radius: 8px'],
      },
      {
        title: t({ ko: '액션 바', en: 'Action bar' }),
        description: t({
          ko: '우측 정렬 버튼 그룹과 보조 IconButton 조합.',
          en: 'Right-aligned button group with supporting icon buttons.',
        }),
        content: (
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button size="small" variant="text">
              {t({ ko: '취소', en: 'Cancel' })}
            </Button>
            <Button size="small" variant="outlined">
              {t({ ko: '임시 저장', en: 'Save draft' })}
            </Button>
            <Button size="small" variant="contained">
              {t({ ko: '배포', en: 'Publish' })}
            </Button>
          </Stack>
        ),
        tokens: ['justifyContent: flex-end', 'spacing: 8px'],
      },
      {
        title: t({ ko: '칩 시스템', en: 'Chip system' }),
        description: t({
          ko: 'Filter, Assist, Status 칩 구성. 높이 28px, 라운드 16px.',
          en: 'Filter, assist and status chips at 28px height with 16px radius.',
        }),
        content: <ChipsDemo />,
        tokens: ['height: 28px', 'radius: 16px'],
      },
      {
        title: t({ ko: '버튼 계층', en: 'Button hierarchy' }),
        description: t({
          ko: 'Primary/Secondary/Tertiary 버튼. 최소 높이 40px, 아이콘 간격 8px.',
          en: 'Primary / secondary / tertiary buttons with 40px min height and 8px icon spacing.',
        }),
        content: (
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button variant="contained" startIcon={<CheckCircleIcon fontSize="small" />}>
              {t({ ko: 'Primary', en: 'Primary' })}
            </Button>
            <Button variant="outlined">{t({ ko: 'Secondary', en: 'Secondary' })}</Button>
            <Button variant="text">{t({ ko: 'Tertiary', en: 'Tertiary' })}</Button>
          </Stack>
        ),
        tokens: ['height: 40px', 'icon gap: 8px'],
      },
      {
        title: t({ ko: '탭', en: 'Tabs' }),
        description: t({
          ko: '스크롤 가능한 탭과 탭 패널의 기본 패턴.',
          en: 'Scrollable tabs with a simple tab panel.',
        }),
        content: <TabsDemo />,
        tokens: ['variant: scrollable', 'tabpanel: aria-labelledby'],
      },
      {
        title: t({ ko: '세그먼티드 버튼', en: 'Segmented buttons' }),
        description: t({
          ko: '범주 전환에 사용하는 세그먼티드 버튼 패턴.',
          en: 'Segmented buttons used for categorical toggles.',
        }),
        content: <SegmentedButtonsDemo />,
        tokens: ['ToggleButtonGroup', 'exclusive'],
      },
      {
        title: t({ ko: '프로그레스', en: 'Progress' }),
        description: t({
          ko: 'Linear/Circular · determinate/indeterminate 상태.',
          en: 'Linear/Circular in determinate and indeterminate states.',
        }),
        content: <ProgressDemo />,
        tokens: ['Linear/Circular', 'determinate/indeterminate'],
      },
      {
        title: t({ ko: '프로그레스 – 라벨/스텝', en: 'Progress – labels/steps' }),
        description: t({
          ko: '라벨 표시와 스텝 진행(Stepper)을 함께 보여줍니다.',
          en: 'Linear progress with label plus a simple stepper.',
        }),
        content: (
          <Stack>
            <ProgressAdvancedDemo />
            <DetailsPanel
              code={`<LinearProgress variant=\"determinate\" value={value} />\n<Stepper activeStep={activeStep} alternativeLabel>...`}
              tokens={`progress.color: primary | success | ...\nstepper.alternativeLabel: true`}
              accessibility={`Provide text alternatives for progress state (e.g., aria-valuenow on custom).`}
            />
          </Stack>
        ),
        tokens: ['Linear label', 'Stepper'],
      },
      {
        title: t({ ko: '슬라이더', en: 'Slider' }),
        description: t({
          ko: '단일 값/범위 슬라이더 예시.',
          en: 'Single value and range slider examples.',
        }),
        content: <SlidersDemo />,
        tokens: ['value / range', 'aria-label'],
      },
      {
        title: t({ ko: 'FAB & Speed dial', en: 'FAB & Speed dial' }),
        description: t({
          ko: '주요 플로팅 액션과 보조 액션 모음.',
          en: 'Primary floating action and secondary actions.',
        }),
        content: <FABDemo />,
        tokens: ['SpeedDial', 'tooltipTitle'],
      },
      {
        title: t({ ko: '데이터 테이블', en: 'Data table' }),
        description: t({
          ko: '정렬/지브라 패턴/작은 행 높이.',
          en: 'Sorting, zebra striping, compact rows.',
        }),
        content: <DataTableDemo />,
        tokens: ['TableSortLabel', 'zebra striping'],
      },
      {
        title: t({ ko: '시트', en: 'Sheets' }),
        description: t({
          ko: 'Bottom/Side Sheet 예시.',
          en: 'Bottom/Side sheet samples.',
        }),
        content: <SheetsDemo />,
        tokens: ['Drawer anchor=bottom/right'],
      },
      {
        title: t({ ko: '스낵바 & 배너', en: 'Snackbars & banners' }),
        description: t({
          ko: '스낵바와 배너(알림) 예시.',
          en: 'Snackbar and banner notifications.',
        }),
        content: <SnackbarsDemo />,
        tokens: ['Snackbar', 'Alert'],
      },
      {
        title: t({ ko: '배너 – 고급', en: 'Banners – advanced' }),
        description: t({
          ko: '접고 펼치는 배너와 큐(Queue) 처리 예시.',
          en: 'Collapsible banner and a simple queue pattern.',
        }),
        content: (
          <Stack>
            <BannersAdvancedDemo />
            <DetailsPanel
              code={`<Collapse in={open}><Alert severity=\"warning\" action={<Button>자세히</Button>} /></Collapse>\nqueue: setQueued([...queued, msg])`}
              tokens={`alert.severity: success|info|warning|error\ncollapse.timing: theme.transitions.duration`}
              accessibility={`Use aria-live=\"polite\" for announcements critical to user tasks.`}
            />
          </Stack>
        ),
        tokens: ['Collapse', 'Queue'],
      },
      {
        title: t({ ko: '다이얼로그', en: 'Dialogs' }),
        description: t({
          ko: '표준/확인 다이얼로그 예시.',
          en: 'Standard and confirm dialogs.',
        }),
        content: <DialogsDemo />,
        tokens: ['DialogTitle/Content/Actions', 'aria-labelledby'],
      },
      {
        title: t({ ko: '다이얼로그 변형', en: 'Dialog variants' }),
        description: t({
          ko: '폼/스크롤/전환 다이얼로그.',
          en: 'Form, scrollable and transition dialogs.',
        }),
        content: <DialogVariantsDemo />,
        tokens: ['scroll=paper', 'Slide transition'],
      },
      {
        title: t({ ko: '폼 컨트롤 묶음', en: 'Form controls (bundle)' }),
        description: t({
          ko: '텍스트필드/셀렉트/토글/체크박스/라디오/텍스트영역/버튼 상태 데모를 한 곳에서.',
          en: 'Text fields, select, toggles, checkboxes, radios, textarea and button states together.',
        }),
        content: <InputsDemo />,
        fullWidth: true,
      },
      {
        title: t({ ko: '날짜/시간 입력', en: 'Date/Time inputs' }),
        description: t({
          ko: '네이티브 date/time/datetime-local 예시(브라우저 지원).',
          en: 'Native date/time/datetime-local inputs (browser support).',
        }),
        content: <DateTimeInputsDemo />,
      },
      {
        title: t({ ko: '아이콘 가이드', en: 'Icon usage' }),
        description: t({
          ko: '기본 크기 24px, 라인 아이콘 위주. 사용 목적에 맞는 ARIA 라벨 필수.',
          en: 'Default size 24px, outline icons preferred. Provide appropriate ARIA labels.',
        }),
        content: (
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip icon={<ShowChartIcon fontSize="small" />} label="Stats" variant="outlined" />
            <IconButton color="primary" size="medium" aria-label="open filters">
              <WidgetsIcon />
            </IconButton>
            <Typography variant="caption" color="text.secondary">
              {t({ ko: 'IconButton 는 aria-label 필수', en: 'IconButton must include aria-label.' })}
            </Typography>
          </Stack>
        ),
        tokens: ['size: 24px', 'stroke icons'],
      },
      {
        title: t({ ko: '입력 필드', en: 'Input fields' }),
        description: t({
          ko: '기본, 에러, 비활성 텍스트 입력 예시.',
          en: 'Default, error and disabled text field examples.',
        }),
        content: (
          <Stack spacing={1.5}>
            <TextField size="small" label={t({ ko: '대회 이름', en: 'Competition name' })} placeholder="MatchCard Cup" fullWidth />
            <TextField
              size="small"
              label={t({ ko: '대회 이름', en: 'Competition name' })}
              error
              helperText={t({ ko: '이름을 입력하세요.', en: 'Please enter a name.' })}
              fullWidth
            />
            <TextField size="small" label={t({ ko: '대회 이름', en: 'Competition name' })} disabled placeholder="Disabled" fullWidth />
          </Stack>
        ),
        tokens: ['Label: subtitle2', 'HelperText: caption'],
      },
      {
        title: t({ ko: '토글 (Switch)', en: 'Toggle (Switch)' }),
        description: t({
          ko: '활성/비활성/비활성화 스위치 상태.',
          en: 'Switch states: on, off, disabled.',
        }),
        content: (
          <Stack direction="row" spacing={2} alignItems="center">
            <Stack spacing={0.5} alignItems="center">
              <Switch defaultChecked />
              <Typography variant="caption" color="text.secondary">
                {t({ ko: '활성', en: 'Active' })}
              </Typography>
            </Stack>
            <Stack spacing={0.5} alignItems="center">
              <Switch />
              <Typography variant="caption" color="text.secondary">
                {t({ ko: '비활성', en: 'Inactive' })}
              </Typography>
            </Stack>
            <Stack spacing={0.5} alignItems="center">
              <Switch disabled defaultChecked />
              <Typography variant="caption" color="text.secondary">
                Disabled
              </Typography>
            </Stack>
          </Stack>
        ),
        tokens: ['Thumb travel: 20px', 'Track radius: 24px'],
      },
      {
        title: t({ ko: '체크박스 & 라디오', en: 'Checkbox & radio' }),
        description: t({
          ko: 'FormControlLabel 로 구성된 체크박스/라디오 패턴.',
          en: 'Checkbox and radio patterns using FormControlLabel.',
        }),
        content: (
          <Stack direction="row" spacing={3} flexWrap="wrap">
            <Stack spacing={0.5}>
              <FormControlLabel control={<Checkbox defaultChecked />} label={t({ ko: '승인', en: 'Approved' })} />
              <FormControlLabel control={<Checkbox />} label={t({ ko: '보류', en: 'Pending' })} />
              <FormControlLabel control={<Checkbox disabled />} label={t({ ko: 'Disabled', en: 'Disabled' })} />
            </Stack>
            <Stack spacing={0.5}>
              <FormControlLabel control={<Radio defaultChecked />} label={t({ ko: '옵션 A', en: 'Option A' })} />
              <FormControlLabel control={<Radio />} label={t({ ko: '옵션 B', en: 'Option B' })} />
              <FormControlLabel control={<Radio disabled />} label={t({ ko: 'Disabled', en: 'Disabled' })} />
            </Stack>
          </Stack>
        ),
        tokens: ['Hit area: 40px', 'Label spacing: 8px'],
      },
      {
        title: t({ ko: '텍스트 영역', en: 'Text area' }),
        description: t({
          ko: '멀티라인 입력과 자동 높이 조절.',
          en: 'Multiline text area with auto height adjustments.',
        }),
        content: (
          <TextField
            label={t({ ko: '경기 요약', en: 'Match summary' })}
            multiline
            minRows={3}
            placeholder={t({ ko: '경기 핵심 내용을 입력하세요.', en: 'Describe the match highlights.' })}
            fullWidth
          />
        ),
        tokens: ['multiline', 'minRows: 3'],
      },
      {
        title: t({ ko: '버튼 상태', en: 'Button states' }),
        description: t({
          ko: '활성/비활성/로딩 버튼.',
          en: 'Active, disabled and loading button states.',
        }),
        content: (
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button variant="contained">{t({ ko: '활성', en: 'Active' })}</Button>
            <Button variant="contained" disabled>
              {t({ ko: '비활성', en: 'Disabled' })}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<CircularProgress size={16} color="inherit" />}
            >
              {t({ ko: '로딩', en: 'Loading' })}
            </Button>
          </Stack>
        ),
        tokens: ['Disabled opacity: 0.38', 'Loading icon: 16px'],
      },
      {
        title: t({ ko: '사용자 카드', en: 'User card' }),
        description: t({
          ko: 'Avatar + 이름 + 역할 + 액션. 카드 높이 72px.',
          en: 'Avatar, name, role and action button. Card height 72px.',
        }),
        content: (
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'primary.100' }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2">Alex Kim</Typography>
              <Typography variant="body2" color="text.secondary">
                {t({ ko: '토너먼트 관리자', en: 'Tournament admin' })}
              </Typography>
            </Box>
            <Button size="small" variant="outlined">
              {t({ ko: '관리', en: 'Manage' })}
            </Button>
          </Paper>
        ),
        tokens: ['height: 72px', 'Avatar: 40px'],
      },
      {
        title: t({ ko: '팀 카드', en: 'Team card' }),
        description: t({
          ko: '로고, 팀명, 승/무/패, 최근 폼을 표시합니다.',
          en: 'Displays crest, team name, W/D/L and recent form.',
        }),
        content: (
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ width: 48, height: 48, borderRadius: 1, bgcolor: 'secondary.100' }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1">Seoul Phoenix</Typography>
                <Typography variant="body2" color="text.secondary">
                  {t({ ko: 'W 8 · D 2 · L 1', en: 'W 8 · D 2 · L 1' })}
                </Typography>
              </Box>
              <Stack direction="row" spacing={0.5}>
                {['W', 'W', 'L', 'D', 'W'].map((result, idx) => (
                  <Chip key={`form-${idx}`} label={result} size="small" color={result === 'W' ? 'success' : result === 'L' ? 'error' : 'warning'} />
                ))}
              </Stack>
            </Stack>
          </Paper>
        ),
        tokens: ['Avatar: 48px', 'Form chips'],
      },
      {
        title: t({ ko: '매치 카드', en: 'Match card' }),
        description: t({
          ko: '팀 정보, 스코어, 시간, CTA 포함한 경기 카드 패턴.',
          en: 'Match card with team info, score, time and CTA.',
        }),
        content: (
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2">Quarter Final</Typography>
                <Typography variant="h6">Falcons 2 - 1 Dragons</Typography>
                <Typography variant="body2" color="text.secondary">
                  {t({ ko: '72분 • 서울 아레나', en: '72" · Seoul Arena' })}
                </Typography>
              </Box>
              <Stack spacing={1} alignItems="flex-end">
                <Button size="small" variant="contained">
                  {t({ ko: '라이브 보기', en: 'Watch live' })}
                </Button>
                <Button size="small" variant="outlined">
                  {t({ ko: '매치 데이터', en: 'Match data' })}
                </Button>
              </Stack>
            </Stack>
          </Paper>
        ),
        tokens: ['Header: subtitle2', 'Score: h6'],
      },
      {
        title: t({ ko: '리스트 아이템', en: 'List item' }),
        description: t({
          ko: '아바타/아이콘 + 텍스트 + 보조 액션을 한 줄에 배치합니다.',
          en: 'One-line item with avatar/icon, text and a supporting action.',
        }),
        content: (
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            {['Player analytics export', 'Team roster update'].map((item, index) => (
              <Stack
                key={item}
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ p: 2, borderBottom: index === 0 ? '1px solid' : 'none', borderColor: 'divider' }}
              >
                <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: 'primary.100' }} />
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {item}
                </Typography>
                <Button size="small" variant="text">
                  {t({ ko: '열기', en: 'Open' })}
                </Button>
              </Stack>
            ))}
          </Paper>
        ),
        tokens: ['Item height: 56px', 'Divider between items'],
      },
      {
        title: t({ ko: '툴팁', en: 'Tooltip' }),
        description: t({
          ko: '아이콘 hover 시 200ms 지연 후 표시, 최대 폭 240px.',
          en: 'Show after 200 ms on hover, max width 240 px.',
        }),
        content: (
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title={t({ ko: '최근 승률을 보여줍니다.', en: 'Displays recent win rate.' })}>
              <IconButton color="primary" size="small">
                <ShowChartIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Typography variant="caption" color="text.secondary">
              {t({ ko: 'Tooltip은 키보드 포커스에도 표시', en: 'Tooltip must appear on keyboard focus as well.' })}
            </Typography>
          </Stack>
        ),
        tokens: ['Delay: 200ms', 'Max width: 240px'],
      },
      {
        title: t({ ko: '테이블', en: 'Table' }),
        description: t({
          ko: '헤더는 subtitle2, 행 높이 48px. 지브라 패턴 사용.',
          en: 'Header row uses subtitle2, rows 48 px tall with zebra striping.',
        }),
        fullWidth: true,
        content: (
          <Box sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Stack sx={{ bgcolor: 'primary.50', px: 2, py: 1 }} direction="row" spacing={2}>
              <Typography variant="subtitle2" sx={{ flex: 2 }}>
                Team
              </Typography>
              <Typography variant="subtitle2" sx={{ flex: 1 }}>
                Pts
              </Typography>
              <Typography variant="subtitle2" sx={{ flex: 1 }}>
                Rank
              </Typography>
            </Stack>
            {['Falcons', 'Dragons', 'Lions'].map((team, idx) => (
              <Stack
                key={`table-${team}`}
                direction="row"
                spacing={2}
                sx={{ px: 2, py: 1.5, bgcolor: idx % 2 === 0 ? 'background.paper' : 'background.default' }}
              >
                <Typography variant="body2" sx={{ flex: 2 }}>
                  {team}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {24 - idx * 3}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {idx + 1}
                </Typography>
              </Stack>
            ))}
          </Box>
        ),
        tokens: ['Row height: 48px', 'Zebra striping'],
      },
      {
        title: t({ ko: '아바타', en: 'Avatar' }),
        description: t({
          ko: '원형 40px 기본, 팀 로고는 48px 사각. 이니셜 fallback 제공.',
          en: 'Circular 40px default, team crests 48px square. Provide initial fallback.',
        }),
        content: (
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'primary.200', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>AK</Box>
            <Box sx={{ width: 48, height: 48, borderRadius: 1, bgcolor: 'secondary.200', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
              MC
            </Box>
          </Stack>
        ),
        tokens: ['User avatar: 40px', 'Team crest: 48px'],
      },
    ],
  }), [t]);

  const patternSection: Section = useMemo(() => ({
    id: 'patterns',
    icon: <ScatterPlotIcon />,
    title: t({ ko: '6. 패턴 (Patterns)', en: '6. Patterns' }),
    summary: t({
      ko: '토너먼트, 분석, 알림 UI 패턴.',
      en: 'Patterns for tournament flows, analytics and notifications.',
    }),
    patterns: [
      {
        title: t({ ko: '토너먼트 설정 행', en: 'Tournament settings row' }),
        description: t({
          ko: '토너먼트 빌더 상단 입력 묶음.',
          en: 'Top bar input cluster for tournament builder.',
        }),
        content: (
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center" rowGap={1.5}>
              <TextField size="small" label={t({ ko: '토너먼트 이름', en: 'Tournament name' })} defaultValue="MatchCard Invitational" sx={{ width: { xs: '100%', md: '50%' } }} />
              <Stack direction="row" spacing={2} alignItems="center" sx={{ width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'space-between', md: 'flex-end' }, ml: { xs: 0, md: 'auto' } }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {t({ ko: '조별 예선', en: 'Group stage' })}
                </Typography>
                <Switch defaultChecked />
              </Stack>
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
              <TextField size="small" type="number" label={t({ ko: '참가 팀 수', en: 'Participants' })} defaultValue={16} sx={{ width: { xs: '100%', md: '33.33%' } }} />
              <FormControl size="small" sx={{ width: { xs: '100%', md: '33.33%' } }}>
                <InputLabel id="pattern-groups">{t({ ko: '그룹 수', en: 'Groups' })}</InputLabel>
                <Select labelId="pattern-groups" label={t({ ko: '그룹 수', en: 'Groups' })} defaultValue="4">
                  {[2, 4, 6, 8].map((value) => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ width: { xs: '100%', md: '33.33%' } }}>
                <InputLabel id="pattern-promotion">{t({ ko: '승격 팀', en: 'Promotion slots' })}</InputLabel>
                <Select labelId="pattern-promotion" label={t({ ko: '승격 팀', en: 'Promotion slots' })} defaultValue="2">
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
        tokens: ['padding: 24px', 'Stack rowGap: 12px'],
      },
      {
        title: t({ ko: '브래킷 카드', en: 'Bracket card' }),
        description: t({
          ko: '라운드/포맷 배지와 팀 슬롯을 포함한 경기 카드.',
          en: 'Match card with round/format badges and participant slots.',
        }),
        content: (
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                R1-M1
              </Typography>
              <Chip label={t({ ko: '단판', en: 'Single' })} size="small" color="secondary" variant="outlined" />
            </Stack>
            <Divider />
            {['Team Alpha', 'Team Beta'].map((team, idx) => (
              <Paper
                key={team}
                variant="outlined"
                sx={{
                  p: 1,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  '&:hover': { backgroundColor: 'action.hover' },
                }}
              >
                <Chip label={idx === 0 ? 'A1' : 'B2'} size="small" variant="outlined" color="primary" />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {team}
                </Typography>
              </Paper>
            ))}
          </Stack>
        ),
        tokens: ['borderRadius: 8px', 'Chip variant: outlined'],
      },
      {
        title: t({ ko: '알림 패턴', en: 'Notification pattern' }),
        description: t({
          ko: '경기 업데이트를 위한 Toast / Snackbar 조합.',
          en: 'Toast / snackbar pattern for match updates.',
        }),
        content: (
          <Stack spacing={1}>
            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'warning.light', borderRadius: 1, p: 2, bgcolor: 'warning.50' }}>
              <Typography variant="subtitle2" color="warning.dark">
                {t({ ko: '곧 시작', en: 'Starting soon' })}
              </Typography>
              <Typography variant="body2">
                {t({ ko: 'MatchCard Cup 준결승이 5분 후 시작됩니다.', en: 'MatchCard Cup semi-final starts in 5 minutes.' })}
              </Typography>
            </Paper>
            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'success.light', borderRadius: 1, p: 2, bgcolor: 'success.50' }}>
              <Typography variant="subtitle2" color="success.dark">
                {t({ ko: '득점 알림', en: 'Score update' })}
              </Typography>
              <Typography variant="body2">
                {t({ ko: 'Team A 3 - 2 Team B (72").', en: 'Team A 3–2 Team B (72").' })}
              </Typography>
            </Paper>
          </Stack>
        ),
        tokens: ['bg: semantic.50', 'border: semantic.light'],
      },
      {
        title: t({ ko: '줌 컨트롤', en: 'Zoom controls' }),
        description: t({
          ko: '브래킷 캔버스 하단 중앙 pill 형태 컨트롤.',
          en: 'Pill style controls centred below the bracket canvas.',
        }),
        content: (
          <Box sx={{ borderRadius: 999, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, p: 1.5 }}>
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
        tokens: ['borderRadius: 999px', 'padding: 12px'],
      },
    ],
  }), [t]);

  const dataVizSection: Section = useMemo(() => ({
    id: 'dataviz',
    icon: <ShowChartIcon />,
    title: t({ ko: '7. 데이터 시각화 (Data Visualization)', en: '7. Data Visualization' }),
    summary: t({
      ko: '트렌드 지표와 차트 카드 패턴.',
      en: 'Trend indicators and chart cards.',
    }),
    patterns: [
      {
        title: t({ ko: '트렌드 인디케이터', en: 'Trend indicator' }),
        description: t({
          ko: '증감 화살표, 퍼센트, 비교 텍스트를 함께 사용합니다.',
          en: 'Use arrow, percentage and comparison text together.',
        }),
        content: (
          <Stack spacing={0.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label="+12%" color="success" size="small" />
              <Typography variant="body2">{t({ ko: '지난 시즌 대비 상승', en: 'Up vs last season' })}</Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {t({ ko: '상승 추세는 초록, 하락은 빨강을 사용합니다.', en: 'Use green for growth, red for decline.' })}
            </Typography>
          </Stack>
        ),
      },
      {
        title: t({ ko: '차트 카드', en: 'Chart card' }),
        description: t({
          ko: '차트 상단에 KPI와 범례를 배치하고, 최소 높이 240px을 확보합니다.',
          en: 'Place KPI and legend above the chart with minimum height 240 px.',
        }),
        content: (
          <Box sx={{ borderRadius: 1, border: '1px dashed', borderColor: 'divider', p: 2, minHeight: 200, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {t({ ko: '득점 추이', en: 'Scoring trend' })}
              </Typography>
              <Chip label={t({ ko: '최근 5경기', en: 'Last 5 matches' })} size="small" variant="outlined" />
            </Stack>
            <Box sx={{ flex: 1, bgcolor: 'primary.50', borderRadius: 1 }} />
          </Box>
        ),
      },
    ],
  }), [t]);

  const interactionSection: Section = useMemo(() => ({
    id: 'interaction',
    icon: <TouchAppIcon />,
    title: t({ ko: '8. 인터랙션 (Interaction)', en: '8. Interaction' }),
    summary: t({
      ko: '상태 토큰, 모션 시간, 입력 피드백 규칙.',
      en: 'State tokens, motion durations and input feedback rules.',
    }),
    patterns: [
      {
        title: t({ ko: '상태 토큰', en: 'State tokens' }),
        description: t({
          ko: 'Hover/Pressed/Focus를 실제 UI와 함께 시각화.',
          en: 'Visualized Hover/Pressed/Focus with real UI.',
        }),
        content: <StateTokensDemo />,
        tokens: ['Hover: action.hover', 'Pressed: action.selected', 'Focus: 2px outline'],
      },
      {
        title: t({ ko: '모션 & 지속시간', en: 'Motion & duration' }),
        description: t({
          ko: '표준 easing: easeOutQuad. Zoom/패널 이동은 200~240ms.',
          en: 'Standard easing easeOutQuad; zoom/panel transitions at 200–240 ms.',
        }),
        content: <MotionDemo />,
        tokens: ['Fast: 120ms', 'Standard: 200ms', 'Large: 240ms'],
      },
    ],
  }), [t]);

  const accessibilitySection: Section = useMemo(() => ({
    id: 'accessibility',
    icon: <AccessibilityNewIcon />,
    title: t({ ko: '9. 접근성 (Accessibility)', en: '9. Accessibility' }),
    summary: t({
      ko: '색 대비, 키보드 네비게이션, ARIA 라벨 규칙.',
      en: 'Colour contrast, keyboard navigation and ARIA label guidance.',
    }),
    patterns: [
      {
        title: t({ ko: '대비 체크', en: 'Contrast check' }),
        description: t({
          ko: '텍스트 대비 4.5:1 이상. 버튼/배지 상태 대비 3:1 이상.',
          en: 'Text contrast 4.5:1 or higher; buttons/badges 3:1 or higher.',
        }),
        content: (
          <Stack spacing={1}>
            <Typography variant="body2">{t({ ko: 'Primary text on Surface-1: 7.2:1', en: 'Primary text on Surface-1: 7.2:1' })}</Typography>
            <Typography variant="body2">{t({ ko: 'Disabled text: rgba(0,0,0,0.38)', en: 'Disabled text: rgba(0,0,0,0.38)' })}</Typography>
          </Stack>
        ),
      },
      {
        title: t({ ko: '키보드 & ARIA', en: 'Keyboard & ARIA' }),
        description: t({
          ko: 'Tab 순서 정의, focusVisible 적용, 버튼/아이콘에 ARIA 라벨 제공.',
          en: 'Define tab order, apply focusVisible and provide ARIA labels for buttons/icons.',
        }),
        content: (
          <Stack spacing={1}>
            <Typography variant="body2">{t({ ko: 'Focusable 요소는 2px primary outline 제공', en: 'Focusable elements show 2px primary outline.' })}</Typography>
            <Typography variant="body2">{t({ ko: 'IconButton aria-label 필수', en: 'IconButton requires aria-label.' })}</Typography>
            <Typography variant="body2">{t({ ko: '속성 예시: aria-live="polite"', en: 'Attribute example: aria-live="polite".' })}</Typography>
          </Stack>
        ),
      },
    ],
  }), [t]);

  const utilitiesSection: Section = useMemo(() => ({
    id: 'utilities',
    icon: <ConstructionIcon />,
    title: t({ ko: '10. 유틸리티 (Utilities)', en: '10. Utilities' }),
    summary: t({
      ko: '토큰 칩, 퀵 액션, 관리자 컨트롤.',
      en: 'Token chips, quick actions and admin controls.',
    }),
    patterns: [
      {
        title: t({ ko: '토큰 칩', en: 'Token chips' }),
        description: t({
          ko: '색상/간격/타이포 토큰을 Chip으로 빠르게 참조합니다.',
          en: 'Surface colour, spacing and typography tokens as chips for quick reference.',
        }),
        content: (
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {['Spacing / 4pt', 'Colour / Primary.500', 'Typography / Body1'].map((label) => (
              <Chip key={label} label={label} size="small" variant="outlined" />
            ))}
          </Stack>
        ),
        tokens: ['Chip size: small', 'variant: outlined'],
      },
      {
        title: t({ ko: '퀵 액션', en: 'Quick actions' }),
        description: t({
          ko: 'Match Start/End, Admin Control 등을 위한 빠른 버튼 세트.',
          en: 'Button set for match start/end and admin control shortcuts.',
        }),
        content: (
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button size="small" variant="contained" color="success" startIcon={<CheckCircleIcon fontSize="small" />}>
              {t({ ko: 'Match Start', en: 'Match start' })}
            </Button>
            <Button size="small" variant="outlined" color="error" startIcon={<ErrorIcon fontSize="small" />}>
              {t({ ko: 'Match End', en: 'Match end' })}
            </Button>
            <Button size="small" variant="outlined" startIcon={<WarningIcon fontSize="small" />}>
              {t({ ko: 'Admin Control', en: 'Admin control' })}
            </Button>
          </Stack>
        ),
        tokens: ['Spacing: 8px', 'Variant mix'],
      },
      {
        title: t({ ko: '보더 & 디바이더', en: 'Border & divider' }),
        description: t({
          ko: '카드는 1px solid divider, 섹션 구분은 Divider 컴포넌트 사용.',
          en: 'Cards use 1px solid divider; sections use the Divider component.',
        }),
        content: (
          <Stack spacing={2}>
            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t({ ko: 'Border 예시', en: 'Border example' })}
              </Typography>
              <Typography variant="body2">{t({ ko: 'border: 1px solid divider', en: 'border: 1px solid divider' })}</Typography>
            </Paper>
            <Divider />
            <Typography variant="caption" color="text.secondary">
              {t({ ko: 'Divider 간격은 위/아래 24px 유지', en: 'Maintain 24px spacing above and below dividers.' })}
            </Typography>
          </Stack>
        ),
        tokens: ['Border: 1px solid divider', 'Divider spacing: 24px'],
      },
    ],
  }), [t]);

  const sections = useMemo(
    () => [overview, identity, colorSection, typographySection, layoutSection, componentSection, patternSection, dataVizSection, interactionSection, accessibilitySection, utilitiesSection],
    [overview, identity, colorSection, typographySection, layoutSection, componentSection, patternSection, dataVizSection, interactionSection, accessibilitySection, utilitiesSection]
  );

  const navItems = useMemo(() => sections.map((section) => ({ href: `#${section.id}`, id: section.id, label: section.title })), [sections]);
  // stabilize ids array to avoid effect churn and potential loops
  const sectionIds = useMemo(() => sections.map((s) => s.id), [sections]);
  const activeId = useScrollSpy(sectionIds);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
        MatchCard Style Guide
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720, mb: 3 }}>
        {t({
          ko: 'Material Design 감성으로 MatchCard 제품 전반에 쓰이는 토큰, 레이아웃, 컴포넌트, 패턴을 정리한 문서입니다.',
          en: 'Material Design inspired catalogue of tokens, layouts, components and patterns used across MatchCard.',
        })}
      </Typography>

      {/* xs~sm: 상단 퀵 링크 버튼 */}
      <AnchorNav
        items={navItems}
        activeId={activeId}
        variant="quick"
        cta={{ label: t({ ko: '토너먼트 빌더 열기', en: 'Open tournament builder' }), href: '/tournament-builder', endIcon: <ArrowForwardIcon fontSize="small" /> }}
        sx={{ mb: 3, display: { xs: 'flex', md: 'none' } }}
      />

      <Divider sx={{ mb: 3 }} />

      {/* md+: 좌측 로컬 앵커 + 본문 */}
      <Box sx={{ display: { xs: 'block', md: 'grid' }, gridTemplateColumns: { md: '240px 1fr' }, gap: 3 }}>
        <AnchorNav items={navItems} activeId={activeId} variant="sidebar" sx={{ display: { xs: 'none', md: 'block' } }} />

        <Box>
          {sections.map((section, index) => (
            <React.Fragment key={section.id}>
              <SectionBlock {...section} />
              {index < sections.length - 1 && <Divider sx={{ mb: 4 }} />}
            </React.Fragment>
          ))}
        </Box>
      </Box>
    </Container>
  );
});

ThemeVisualization.displayName = 'ThemeVisualization';

export default ThemeVisualization;
