import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Card,
  CardContent,
  Alert,
  Breadcrumbs,
  Link,
  Chip
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  AutoMode as AutoIcon,
  Assessment as StatsIcon,
  CalendarMonth as CalendarIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { competitionAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import SchedulingCalendar from '../components/scheduling/SchedulingCalendar';
import AutoSchedulingDialog from '../components/scheduling/AutoSchedulingDialog';
import SchedulingStatus from '../components/scheduling/SchedulingStatus';

const MatchScheduling = () => {
  const { competitionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState(0);
  const [autoSchedulingOpen, setAutoSchedulingOpen] = useState(false);
  const [selectedMatches, setSelectedMatches] = useState([]);

  // 대회 정보 조회
  const { data: competition, isLoading: competitionLoading } = useQuery({
    queryKey: ['competition', competitionId],
    queryFn: () => competitionAPI.getCompetition(competitionId).then(res => res.data.data),
    enabled: !!competitionId
  });

  // 권한 확인
  const hasSchedulingAccess = user && ['admin', 'moderator', 'organizer'].includes(user.role);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleMatchSelect = (matches) => {
    setSelectedMatches(matches);
  };

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scheduling-tabpanel-${index}`}
      aria-labelledby={`scheduling-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );

  if (competitionLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center">
          <Typography>로딩 중...</Typography>
        </Box>
      </Container>
    );
  }

  if (!competition) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          대회를 찾을 수 없습니다.
        </Alert>
      </Container>
    );
  }

  if (!hasSchedulingAccess) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          경기 스케줄링에 접근할 권한이 없습니다. 관리자 권한이 필요합니다.
        </Alert>
      </Container>
    );
  }

  const tabs = [
    {
      label: '캘린더 뷰',
      icon: <CalendarIcon />,
      value: 0
    },
    {
      label: '스케줄링 상태',
      icon: <StatsIcon />,
      value: 1
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* 브레드크럼 */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          color="inherit"
          onClick={() => navigate('/competitions')}
          sx={{ cursor: 'pointer' }}
        >
          대회 관리
        </Link>
        <Link
          color="inherit"
          onClick={() => navigate(`/competitions/${competitionId}`)}
          sx={{ cursor: 'pointer' }}
        >
          {competition.name}
        </Link>
        <Typography color="text.primary">경기 스케줄링</Typography>
      </Breadcrumbs>

      {/* 헤더 */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            경기 스케줄링
          </Typography>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Typography variant="h6" color="text.secondary">
              {competition.name}
            </Typography>
            <Chip
              label={competition.competition_type}
              color="primary"
              size="small"
            />
            <Chip
              label={competition.season}
              color="secondary"
              size="small"
            />
          </Box>
          <Typography variant="body1" color="text.secondary">
            대회의 모든 경기를 효율적으로 스케줄링하고 관리합니다.
          </Typography>
        </Box>

        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<AutoIcon />}
            onClick={() => setAutoSchedulingOpen(true)}
            color="primary"
          >
            자동 스케줄링
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => navigate(`/competitions/${competitionId}/matches/create`)}
          >
            경기 추가
          </Button>
        </Box>
      </Box>

      {/* 대회 정보 카드 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={3}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                대회 형태
              </Typography>
              <Typography variant="body1">
                {competition.competition_type === 'league' ? '리그전' :
                 competition.competition_type === 'tournament' ? '토너먼트' :
                 competition.competition_type === 'cup' ? '컵대회' : competition.competition_type}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                경기 형식
              </Typography>
              <Typography variant="body1">
                {competition.format}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                시작일
              </Typography>
              <Typography variant="body1">
                {competition.start_date ? new Date(competition.start_date).toLocaleDateString('ko-KR') : '미정'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                종료일
              </Typography>
              <Typography variant="body1">
                {competition.end_date ? new Date(competition.end_date).toLocaleDateString('ko-KR') : '미정'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                상태
              </Typography>
              <Chip
                label={competition.status === 'draft' ? '준비중' :
                       competition.status === 'registration' ? '등록중' :
                       competition.status === 'active' ? '진행중' :
                       competition.status === 'completed' ? '완료' : competition.status}
                color={competition.status === 'active' ? 'success' :
                       competition.status === 'registration' ? 'warning' :
                       competition.status === 'completed' ? 'info' : 'default'}
                size="small"
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* 탭 네비게이션 */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="scheduling tabs"
          variant="fullWidth"
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.value}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
              id={`scheduling-tab-${tab.value}`}
              aria-controls={`scheduling-tabpanel-${tab.value}`}
            />
          ))}
        </Tabs>
      </Card>

      {/* 탭 컨텐츠 */}
      <TabPanel value={currentTab} index={0}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              경기 스케줄 캘린더
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              월별 캘린더에서 경기 일정을 확인하고 편집할 수 있습니다.
            </Typography>
            <SchedulingCalendar
              competitionId={competitionId}
              onMatchSelect={handleMatchSelect}
            />
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              스케줄링 상태 관리
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              경기별 스케줄링 상태를 확인하고 관리합니다.
            </Typography>
            <SchedulingStatus competitionId={competitionId} />
          </CardContent>
        </Card>
      </TabPanel>

      {/* 자동 스케줄링 다이얼로그 */}
      <AutoSchedulingDialog
        open={autoSchedulingOpen}
        onClose={() => setAutoSchedulingOpen(false)}
        competitionId={competitionId}
        competitionName={competition.name}
      />

      {/* 선택된 경기 정보 */}
      {selectedMatches.length > 0 && (
        <Card sx={{ position: 'fixed', bottom: 20, right: 20, width: 300 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              선택된 경기 ({selectedMatches.length}개)
            </Typography>
            {selectedMatches.slice(0, 3).map((match) => (
              <Box key={match.id} sx={{ mb: 1 }}>
                <Typography variant="body2">
                  {match.homeClub?.name} vs {match.awayClub?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(match.match_date).toLocaleString('ko-KR')}
                </Typography>
              </Box>
            ))}
            {selectedMatches.length > 3 && (
              <Typography variant="caption" color="text.secondary">
                외 {selectedMatches.length - 3}개 더...
              </Typography>
            )}
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default MatchScheduling;