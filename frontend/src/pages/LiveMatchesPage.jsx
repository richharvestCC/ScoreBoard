import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Alert,
  Button
} from '@mui/material';
import {
  LiveTv as LiveIcon,
  Assessment as StatsIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import PageContainer from '../components/layout/PageContainer';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { liveScoringAPI } from '../services/api';
import LiveMatchList from '../components/live/LiveMatchList';

const LiveMatchesPage = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState(0);

  // 라이브 통계 조회 (관리자만)
  const { data: liveStats } = useQuery({
    queryKey: ['liveStats'],
    queryFn: () => liveScoringAPI.getLiveStats().then(res => res.data.data),
    enabled: user && ['admin', 'moderator'].includes(user.role),
    refetchInterval: 10000 // 10초마다 새로고침
  });

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`live-tabpanel-${index}`}
      aria-labelledby={`live-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );

  const hasAdminAccess = user && ['admin', 'moderator'].includes(user.role);

  const tabs = [
    {
      label: '라이브 경기',
      icon: <LiveIcon />,
      value: 0
    }
  ];

  if (hasAdminAccess) {
    tabs.push({
      label: '시스템 통계',
      icon: <StatsIcon />,
      value: 1
    });
  }

  return (
    <PageContainer>
      {/* 헤더 */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          라이브 경기 센터
        </Typography>
        <Typography variant="body1" color="text.secondary">
          실시간으로 진행되는 모든 경기를 확인하고 관리합니다.
        </Typography>
      </Box>

      {/* 탭 네비게이션 */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="live matches tabs"
          variant="fullWidth"
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.value}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
              id={`live-tab-${tab.value}`}
              aria-controls={`live-tabpanel-${tab.value}`}
            />
          ))}
        </Tabs>
      </Card>

      {/* 탭 컨텐츠 */}
      <TabPanel value={currentTab} index={0}>
        <LiveMatchList />
      </TabPanel>

      {hasAdminAccess && (
        <TabPanel value={currentTab} index={1}>
          <Grid container spacing={3}>
            {/* 전체 통계 */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    실시간 시스템 통계
                  </Typography>

                  {liveStats ? (
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Box textAlign="center">
                          <Typography variant="h3" color="primary">
                            {liveStats.totalLiveMatches}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            진행 중인 경기
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box textAlign="center">
                          <Typography variant="h3" color="secondary">
                            {liveStats.totalViewers}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            총 시청자 수
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box textAlign="center">
                          <Typography variant="h3" color="success.main">
                            {liveStats.totalViewers > 0 ?
                              Math.round(liveStats.totalViewers / (liveStats.totalLiveMatches || 1)) : 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            평균 시청자/경기
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  ) : (
                    <Alert severity="info">
                      통계 데이터를 불러오는 중입니다...
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* 경기별 상세 통계 */}
            {liveStats?.matchDetails && liveStats.matchDetails.length > 0 && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      경기별 상세 통계
                    </Typography>

                    <Grid container spacing={2}>
                      {liveStats.matchDetails.map((match, index) => (
                        <Grid item xs={12} md={6} lg={4} key={match.matchId}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="subtitle2" gutterBottom>
                                경기 #{match.matchId}
                              </Typography>

                              <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography variant="body2">시청자:</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {match.viewerCount}명
                                </Typography>
                              </Box>

                              <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography variant="body2">관리자:</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {match.managerCount}명
                                </Typography>
                              </Box>

                              <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography variant="body2">상태:</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {match.status}
                                </Typography>
                              </Box>

                              <Typography variant="caption" color="text.secondary">
                                마지막 업데이트: {new Date(match.lastUpdate).toLocaleTimeString('ko-KR')}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </TabPanel>
      )}
    </PageContainer>
  );
};

export default LiveMatchesPage;
