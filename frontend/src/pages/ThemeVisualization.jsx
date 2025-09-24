import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Divider,
  Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

const ThemeVisualization = () => {
  const theme = useTheme();

  // Color extraction helper
  const extractColors = (colorNames) => {
    const tones = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];

    return colorNames.map(colorName => {
      const paletteColor = theme.palette[colorName];
      if (!paletteColor) return null;

      const colors = tones
        .filter(tone => paletteColor[tone])
        .map(tone => ({
          tone,
          color: paletteColor[tone]
        }));

      return {
        name: colorName.charAt(0).toUpperCase() + colorName.slice(1),
        colors
      };
    }).filter(Boolean);
  };

  const colorGroups = extractColors(['primary', 'secondary', 'success', 'warning', 'error', 'info']);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography
          variant="h1"
          component="h1"
          gutterBottom
          sx={{
            color: 'primary.700',
            fontWeight: 700,
            mb: 2
          }}
        >
          ScoreBoard - Material Design 3 테마 시각화
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            maxWidth: 600,
            mx: 'auto',
            mb: 4
          }}
        >
          ScoreBoard 플랫폼의 완전한 Material Design 3 색상 팔레트와 디자인 시스템을 확인하세요.
        </Typography>
      </Box>

      {/* Design Tokens Overview */}
      <Box sx={{ mb: 8 }}>
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
          디자인 토큰
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
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
                글꼴
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {theme.typography.fontFamily}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="h6">헤딩 예시</Typography>
                <Typography variant="body1">본문 텍스트</Typography>
                <Typography variant="body2">작은 텍스트</Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
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
                둥근 모서리
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                기본: {theme.shape.borderRadius}px
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Box sx={{ width: 40, height: 40, bgcolor: 'primary.100', borderRadius: 1 }} />
                <Box sx={{ width: 40, height: 40, bgcolor: 'primary.200', borderRadius: 2 }} />
                <Box sx={{ width: 40, height: 40, bgcolor: 'primary.300', borderRadius: 3 }} />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
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
                간격
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                기본 단위: {theme.spacing(1)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 20, bgcolor: 'secondary.400' }} />
                <Box sx={{ width: 16, height: 20, bgcolor: 'secondary.500' }} />
                <Box sx={{ width: 24, height: 20, bgcolor: 'secondary.600' }} />
              </Box>
            </Paper>
          </Grid>
        </Grid>
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
          Color Palette (50-900 Tones)
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
              {group.name} Colors
            </Typography>

            {/* 50-900 Numeric Colors */}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                justifyContent: 'flex-start'
              }}
            >
              {group.colors.map((colorItem) => (
                <Box
                  key={colorItem.tone}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                    flex: '0 0 calc(10% - 8px)',
                    minWidth: 80,
                    '@media (max-width: 900px)': {
                      flex: '0 0 calc(20% - 8px)'
                    },
                    '@media (max-width: 600px)': {
                      flex: '0 0 calc(33.333% - 8px)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      aspectRatio: '1/1',
                      bgcolor: colorItem.color,
                      borderRadius: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      p: 1,
                      boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: 'rgba(0, 0, 0, 0.05) 0px 2px 6px'
                      }
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: parseInt(colorItem.tone) >= 500 ? '#fff' : 'primary.800',
                        textAlign: 'center',
                        fontSize: '1em'
                      }}
                    >
                      {colorItem.tone}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '1em',
                        color: parseInt(colorItem.tone) >= 500 ? '#fff' : 'primary.800',
                        textAlign: 'center',
                        wordBreak: 'break-all',
                        lineHeight: 1.2
                      }}
                    >
                      {colorItem.color.toUpperCase()}
                    </Typography>
                  </Box>
                </Box>
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
          간격 시스템
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
          타이포그래피
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
            H1 헤딩 (40px)
          </Typography>
          <Typography variant="h2" gutterBottom sx={{ textAlign: 'left' }}>
            H2 헤딩 (32px)
          </Typography>
          <Typography variant="h3" gutterBottom>
            H3 헤딩 (24px)
          </Typography>
          <Typography variant="h4" gutterBottom>
            H4 헤딩 (20px)
          </Typography>
          <Typography variant="body1" gutterBottom>
            Body1 본문 텍스트 (16px) - 기본 본문에 사용되는 텍스트입니다.
          </Typography>
          <Typography variant="body2" gutterBottom sx={{ textAlign: 'left', margin: 0 }}>
            Body2 작은 본문 텍스트 (14px) - 부가적인 정보에 사용됩니다.
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
          컴포넌트 예시
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
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
                칩/배지
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip label="성공" color="success" />
                <Chip label="경고" color="warning" />
                <Chip label="오류" color="error" />
                <Chip label="정보" color="info" />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
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
                구분선
              </Typography>
              <Box sx={{ py: 2 }}>
                <Divider />
              </Box>
              <Typography variant="body2" color="text.secondary">
                섹션 구분에 사용되는 요소
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ThemeVisualization;