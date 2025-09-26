import React from 'react';
import {
  Box,
  Container,
  Typography,
  useTheme,
  Divider,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { ColorToken, SpacingToken, TypographyToken, TokenGrid } from '../components/TokenDisplay';
import AccessibilityInfo from '../components/AccessibilityInfo';
import { NavigateNext } from '@mui/icons-material';

/**
 * TokenSystemPage Component
 * Material Design 3 토큰 시스템을 시각적으로 보여주는 페이지
 */
const TokenSystemPage: React.FC = () => {
  const theme = useTheme();

  // 현재 테마의 색상 팔레트 추출
  const colorTokens = {
    primary: theme.palette.primary,
    secondary: theme.palette.secondary,
    success: theme.palette.success,
    warning: theme.palette.warning,
    error: theme.palette.error,
    info: theme.palette.info,
  };

  // 간격 토큰들
  const spacingTokens = [
    { name: 'xs', value: Number(theme.spacing(0.5).replace('px', '')), description: '매우 작은 간격 (4px)' },
    { name: 'sm', value: Number(theme.spacing(1).replace('px', '')), description: '작은 간격 (8px)' },
    { name: 'md', value: Number(theme.spacing(2).replace('px', '')), description: '중간 간격 (16px)' },
    { name: 'lg', value: Number(theme.spacing(3).replace('px', '')), description: '큰 간격 (24px)' },
    { name: 'xl', value: Number(theme.spacing(4).replace('px', '')), description: '매우 큰 간격 (32px)' },
    { name: '2xl', value: Number(theme.spacing(6).replace('px', '')), description: '초대형 간격 (48px)' },
  ];

  // 타이포그래피 토큰들
  const typographyTokens: Array<{
    variant: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'caption' | 'button' | 'overline' | 'subtitle1' | 'subtitle2';
    example: string;
    description: string;
  }> = [
    { variant: 'h1', example: 'Heading 1', description: '메인 제목, 브랜딩' },
    { variant: 'h2', example: 'Heading 2', description: '섹션 제목' },
    { variant: 'h3', example: 'Heading 3', description: '하위 섹션 제목' },
    { variant: 'h4', example: 'Heading 4', description: '카드 제목' },
    { variant: 'h5', example: 'Heading 5', description: '작은 제목' },
    { variant: 'h6', example: 'Heading 6', description: '라벨, 범례' },
    { variant: 'body1', example: 'Body Large - 기본 본문 텍스트입니다.', description: '기본 본문' },
    { variant: 'body2', example: 'Body Medium - 보조 본문 텍스트입니다.', description: '보조 본문' },
    { variant: 'caption', example: 'Caption - 캡션과 작은 텍스트', description: '캡션, 메타 정보' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNext fontSize="small" />}
        sx={{ mb: 3 }}
      >
        <Link color="inherit" href="/style-dash" underline="hover">
          Style Guide
        </Link>
        <Typography color="textPrimary">Design Tokens</Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 5 }}>
        <Typography
          variant="h2"
          component="h1"
          sx={{
            mb: 2,
            fontWeight: 700,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Design Tokens
        </Typography>
        <Typography
          variant="h6"
          color="textSecondary"
          sx={{ mb: 3, maxWidth: 600 }}
        >
          Material Design 3을 기반으로 한 MatchCard 플랫폼의 디자인 토큰 시스템입니다.
          일관된 디자인 언어를 구축하기 위한 핵심 요소들을 정의합니다.
        </Typography>
      </Box>

      {/* Color Tokens */}
      <TokenGrid title="Color Palette" columns={{ xs: 1, sm: 2, md: 3, lg: 6 }}>
        {Object.entries(colorTokens).map(([name, palette]) => (
          <React.Fragment key={name}>
            <ColorToken
              name={`${name}.main`}
              value={palette.main}
              description={`주 색상`}
            />
            <ColorToken
              name={`${name}.light`}
              value={palette.light}
              description={`밝은 변형`}
            />
            <ColorToken
              name={`${name}.dark`}
              value={palette.dark}
              description={`어두운 변형`}
            />
          </React.Fragment>
        ))}
      </TokenGrid>

      <Divider sx={{ my: 5 }} />

      {/* Background Colors */}
      <TokenGrid title="Background & Surface" columns={{ xs: 1, sm: 2, md: 4 }}>
        <ColorToken
          name="background.default"
          value={theme.palette.background.default}
          description="기본 배경색"
        />
        <ColorToken
          name="background.paper"
          value={theme.palette.background.paper}
          description="카드, 모달 배경색"
        />
        <ColorToken
          name="text.primary"
          value={theme.palette.text.primary}
          description="주 텍스트 색상"
        />
        <ColorToken
          name="text.secondary"
          value={theme.palette.text.secondary}
          description="보조 텍스트 색상"
        />
      </TokenGrid>

      <Divider sx={{ my: 5 }} />

      {/* Spacing Tokens */}
      <TokenGrid title="Spacing System" columns={{ xs: 1, sm: 2, md: 3 }}>
        {spacingTokens.map((token) => (
          <SpacingToken
            key={token.name}
            name={token.name}
            value={token.value}
            description={token.description}
          />
        ))}
      </TokenGrid>

      <Divider sx={{ my: 5 }} />

      {/* Typography Tokens */}
      <TokenGrid title="Typography Scale" columns={{ xs: 1, md: 2, lg: 3 }}>
        {typographyTokens.map((token) => (
          <TypographyToken
            key={token.variant}
            variant={token.variant}
            example={token.example}
            description={token.description}
          />
        ))}
      </TokenGrid>

      {/* Usage Guidelines */}
      <Box sx={{ mt: 6, p: 4, backgroundColor: theme.palette.background.paper, borderRadius: 2 }}>
        <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
          사용 가이드라인
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>색상:</strong> 스포츠 데이터의 중요도에 따라 색상을 활용하세요.
          success는 득점/승리, warning은 경고, error는 실패/패배를 나타냅니다.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>간격:</strong> 일관된 시각적 리듬을 만들기 위해 8px 기반 시스템을 사용합니다.
          컴포넌트 간 간격은 md(16px) 이상을 권장합니다.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>타이포그래피:</strong> 정보 계층에 따라 적절한 변형을 선택하세요.
          스포츠 데이터는 가독성이 중요하므로 충분한 대비와 크기를 유지합니다.
        </Typography>
      </Box>

      <Divider sx={{ my: 5 }} />

      {/* Accessibility Information */}
      <AccessibilityInfo
        title="접근성 준수 현황"
        description="WCAG 2.1 AA 기준에 따른 디자인 토큰들의 접근성 검증 결과입니다."
      />
    </Container>
  );
};

export default TokenSystemPage;