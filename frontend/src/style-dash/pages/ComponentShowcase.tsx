import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Breadcrumbs,
  Link,
  Tabs,
  Tab,
  Paper,
  useTheme,
  alpha,
} from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import CodePreview from '../components/CodePreview';
import ScoreCard from '../components/sports/ScoreCard';
import StandingsTable from '../components/sports/StandingsTable';
import LiveScoreboard from '../components/sports/LiveScoreboard';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

/**
 * ComponentShowcase Page
 * 스포츠 플랫폼 전용 컴포넌트들의 라이브 미리보기와 코드를 보여주는 페이지
 */
const ComponentShowcase: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Sample data for components
  const sampleScoreCardData = {
    homeTeam: { name: 'Manchester United', score: 2 },
    awayTeam: { name: 'Arsenal FC', score: 1 },
    status: 'finished' as const,
    matchTime: '15:30',
    location: 'Old Trafford',
    competition: 'Premier League',
  };

  const sampleLiveScoreboardData = {
    homeTeam: { name: 'Barcelona', score: 1 },
    awayTeam: { name: 'Real Madrid', score: 1 },
    matchTime: 67,
    period: 'second-half' as const,
    isLive: true,
    events: [
      { time: 23, type: 'goal' as const, team: 'home' as const, player: 'Messi' },
      { time: 45, type: 'yellow-card' as const, team: 'away' as const, player: 'Ramos' },
      { time: 58, type: 'goal' as const, team: 'away' as const, player: 'Benzema' },
    ],
  };

  const sampleStandingsData = Array.from({ length: 20 }, (_, i) => ({
    position: i + 1,
    teamName: `Team ${i + 1}`,
    played: 25,
    won: 15 - i,
    drawn: 5,
    lost: 5 + i,
    goalsFor: 45 - i * 2,
    goalsAgainst: 20 + i,
    goalDifference: 25 - i * 3,
    points: 50 - i * 2,
    form: ['W', 'W', 'L', 'D', 'W'] as ('W' | 'L' | 'D')[],
  }));

  const scoreCardCode = `import ScoreCard from './components/sports/ScoreCard';

// Basic Usage
<ScoreCard
  homeTeam={{ name: 'Manchester United', score: 2 }}
  awayTeam={{ name: 'Arsenal FC', score: 1 }}
  status="finished"
  matchTime="15:30"
  location="Old Trafford"
  competition="Premier League"
/>

// Compact Variant
<ScoreCard
  homeTeam={{ name: 'Man Utd', score: 2 }}
  awayTeam={{ name: 'Arsenal', score: 1 }}
  status="finished"
  matchTime="15:30"
  variant="compact"
/>`;

  const liveScoreboardCode = `import LiveScoreboard from './components/sports/LiveScoreboard';

<LiveScoreboard
  homeTeam={{ name: 'Barcelona', score: 1 }}
  awayTeam={{ name: 'Real Madrid', score: 1 }}
  matchTime={67}
  period="second-half"
  isLive={true}
  events={[
    { time: 23, type: 'goal', team: 'home', player: 'Messi' },
    { time: 45, type: 'yellow-card', team: 'away', player: 'Ramos' },
    { time: 58, type: 'goal', team: 'away', player: 'Benzema' },
  ]}
/>`;

  const standingsTableCode = `import StandingsTable from './components/sports/StandingsTable';

<StandingsTable
  standings={[
    {
      position: 1,
      teamName: 'Manchester City',
      played: 25,
      won: 20,
      drawn: 3,
      lost: 2,
      goalsFor: 65,
      goalsAgainst: 15,
      goalDifference: 50,
      points: 63,
      form: ['W', 'W', 'W', 'D', 'W'],
    },
    // ... more teams
  ]}
  title="Premier League Table"
  highlightPositions={{
    champion: [1],
    uefa: [2, 3, 4],
    relegation: [18, 19, 20],
  }}
/>`;

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
        <Typography color="textPrimary">Components</Typography>
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
          Component Showcase
        </Typography>
        <Typography
          variant="h6"
          color="textSecondary"
          sx={{ mb: 3, maxWidth: 600 }}
        >
          스포츠 플랫폼에 특화된 컴포넌트들의 라이브 미리보기와 사용법을 확인하세요.
          실제 구현 코드와 함께 제공됩니다.
        </Typography>
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
          <Tab label="Score Cards" />
          <Tab label="Live Scoreboard" />
          <Tab label="Standings Table" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <CodePreview
            title="Score Card"
            description="경기 결과와 정보를 표시하는 카드 컴포넌트입니다. 다양한 경기 상태와 크기 옵션을 지원합니다."
            preview={
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ minWidth: 300 }}>
                  <ScoreCard {...sampleScoreCardData} />
                </Box>
                <Box sx={{ minWidth: 250 }}>
                  <ScoreCard {...sampleScoreCardData} variant="compact" />
                </Box>
              </Box>
            }
            code={scoreCardCode}
          />

          <CodePreview
            title="Upcoming Match Card"
            description="예정된 경기를 표시하는 카드 변형입니다."
            preview={
              <Box sx={{ minWidth: 300 }}>
                <ScoreCard
                  homeTeam={{ name: 'Chelsea FC' }}
                  awayTeam={{ name: 'Liverpool FC' }}
                  status="upcoming"
                  matchTime="Tomorrow 16:00"
                  location="Stamford Bridge"
                  competition="Premier League"
                />
              </Box>
            }
            code={`<ScoreCard
  homeTeam={{ name: 'Chelsea FC' }}
  awayTeam={{ name: 'Liverpool FC' }}
  status="upcoming"
  matchTime="Tomorrow 16:00"
  location="Stamford Bridge"
  competition="Premier League"
/>`}
          />

          <CodePreview
            title="Live Match Card"
            description="진행 중인 경기를 표시하는 라이브 카드입니다."
            preview={
              <Box sx={{ minWidth: 300 }}>
                <ScoreCard
                  homeTeam={{ name: 'Tottenham', score: 0 }}
                  awayTeam={{ name: 'Man City', score: 2 }}
                  status="live"
                  matchTime="Live 78'"
                  location="Tottenham Stadium"
                  competition="Premier League"
                />
              </Box>
            }
            code={`<ScoreCard
  homeTeam={{ name: 'Tottenham', score: 0 }}
  awayTeam={{ name: 'Man City', score: 2 }}
  status="live"
  matchTime="Live 78'"
  location="Tottenham Stadium"
  competition="Premier League"
/>`}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <CodePreview
            title="Live Scoreboard"
            description="실시간 경기 스코어보드 컴포넌트입니다. 경기 진행 상황, 시간, 최근 이벤트를 실시간으로 표시합니다."
            preview={
              <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                <LiveScoreboard {...sampleLiveScoreboardData} />
              </Box>
            }
            code={liveScoreboardCode}
          />

          <CodePreview
            title="Finished Match Scoreboard"
            description="종료된 경기의 스코어보드입니다."
            preview={
              <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                <LiveScoreboard
                  homeTeam={{ name: 'Bayern Munich', score: 3 }}
                  awayTeam={{ name: 'Borussia Dortmund', score: 1 }}
                  matchTime={90}
                  period="full-time"
                  isLive={false}
                  events={[
                    { time: 15, type: 'goal', team: 'home', player: 'Lewandowski' },
                    { time: 32, type: 'goal', team: 'home', player: 'Müller' },
                    { time: 67, type: 'goal', team: 'away', player: 'Haaland' },
                    { time: 89, type: 'goal', team: 'home', player: 'Gnabry' },
                  ]}
                />
              </Box>
            }
            code={`<LiveScoreboard
  homeTeam={{ name: 'Bayern Munich', score: 3 }}
  awayTeam={{ name: 'Borussia Dortmund', score: 1 }}
  matchTime={90}
  period="full-time"
  isLive={false}
  events={events}
/>`}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <CodePreview
            title="League Standings Table"
            description="리그 순위표를 표시하는 테이블 컴포넌트입니다. 팀별 통계와 최근 경기 결과, 순위 표시를 지원합니다."
            preview={
              <Box sx={{ maxWidth: '100%', overflow: 'auto' }}>
                <StandingsTable
                  standings={sampleStandingsData.slice(0, 10)}
                  title="Premier League Table (Top 10)"
                  highlightPositions={{
                    champion: [1],
                    uefa: [2, 3, 4],
                    relegation: [18, 19, 20],
                  }}
                />
              </Box>
            }
            code={standingsTableCode}
          />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default ComponentShowcase;