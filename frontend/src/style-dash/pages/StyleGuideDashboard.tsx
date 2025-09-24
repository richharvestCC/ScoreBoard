import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Tabs,
  Tab,
  Container,
  Chip,
  AppBar,
  Toolbar,
  Paper,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Palette,
  TextFormat,
  ViewCompact,
  Speed,
  Code,
  Visibility,
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

/**
 * Style Guide Dashboard - 메인 페이지
 * Material Design 3을 기반으로 한 스타일 가이드 시스템의 홈페이지
 */
const StyleGuideDashboard: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const guideCategories = [
    {
      title: 'Design Tokens',
      description: 'Color palette, typography, spacing, and elevation system',
      icon: <Palette />,
      path: '/style-dash/tokens',
      color: theme.palette.primary.main,
    },
    {
      title: 'Typography',
      description: 'Font hierarchy, sizes, weights, and usage guidelines',
      icon: <TextFormat />,
      path: '/style-dash/typography',
      color: theme.palette.secondary.main,
    },
    {
      title: 'Components',
      description: 'UI components library with live examples and code',
      icon: <ViewCompact />,
      path: '/style-dash/components',
      color: theme.palette.success.main,
    },
    {
      title: 'Sports Elements',
      description: 'Sport-specific components: scoreboards, match cards, standings',
      icon: <Speed />,
      path: '/style-dash/sports',
      color: theme.palette.info.main,
    },
  ];

  return (
    <>
      {/* Header */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(10px)',
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Toolbar>
          <Code sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ScoreBoard Style Guide
          </Typography>
          <Chip
            label="Material 3"
            color="primary"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
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
            Design System
          </Typography>
          <Typography
            variant="h5"
            color="textSecondary"
            sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
          >
            스포츠 플랫폼을 위한 Material Design 3 기반 통합 스타일 가이드
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Visibility />}
              sx={{ borderRadius: 3 }}
            >
              Live Preview
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<Code />}
              sx={{ borderRadius: 3 }}
            >
              View Code
            </Button>
          </Box>
        </Box>

        {/* Navigation Tabs */}
        <Paper
          elevation={0}
          sx={{
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: 3,
            overflow: 'hidden',
            mb: 4,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                minHeight: 64,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
              },
            }}
          >
            <Tab label="Overview" />
            <Tab label="Getting Started" />
            <Tab label="Best Practices" />
            <Tab label="Changelog" />
          </Tabs>

          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              {guideCategories.map((category, index) => (
                <Grid item xs={12} md={6} key={index} {...({} as any)}>
                  <Card
                    sx={{
                      height: '100%',
                      transition: 'all 0.3s ease',
                      border: `2px solid transparent`,
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[8],
                        borderColor: alpha(category.color, 0.3),
                      },
                    }}
                  >
                    <CardContent sx={{ pb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 2,
                            backgroundColor: alpha(category.color, 0.1),
                            color: category.color,
                            mr: 2,
                          }}
                        >
                          {category.icon}
                        </Box>
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                          {category.title}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ lineHeight: 1.6 }}
                      >
                        {category.description}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        size="small"
                        sx={{
                          color: category.color,
                          fontWeight: 500,
                          '&:hover': {
                            backgroundColor: alpha(category.color, 0.1),
                          },
                        }}
                      >
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Typography variant="h6" gutterBottom>
              시작하기
            </Typography>
            <Typography variant="body1" paragraph>
              ScoreBoard 스타일 가이드를 프로젝트에 적용하는 방법을 안내합니다.
            </Typography>
            <Box component="pre" sx={{
              backgroundColor: alpha(theme.palette.text.primary, 0.05),
              p: 2,
              borderRadius: 2,
              overflow: 'auto',
            }}>
              {`import { ThemeProvider } from '@mui/material/styles';
import material3Theme from './theme/material3Theme';

function App() {
  return (
    <ThemeProvider theme={material3Theme}>
      {/* Your app content */}
    </ThemeProvider>
  );
}`}
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Typography variant="h6" gutterBottom>
              모범 사례
            </Typography>
            <Typography variant="body1" paragraph>
              일관된 사용자 경험을 위한 디자인 가이드라인과 모범 사례입니다.
            </Typography>
            <ul>
              <li>스포츠 데이터의 가독성을 높이는 색상 활용</li>
              <li>실시간 업데이트를 위한 적절한 애니메이션 적용</li>
              <li>모바일 우선 반응형 디자인 원칙</li>
              <li>접근성 기준 (WCAG 2.1 AA) 준수</li>
            </ul>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <Typography variant="h6" gutterBottom>
              변경 기록
            </Typography>
            <Typography variant="body1" paragraph>
              스타일 가이드의 최신 업데이트와 변경 사항입니다.
            </Typography>
            <Typography variant="body2" color="textSecondary">
              v1.0.0 - 초기 Material Design 3 기반 스타일 시스템 구축
            </Typography>
          </TabPanel>
        </Paper>
      </Container>
    </>
  );
};

export default StyleGuideDashboard;