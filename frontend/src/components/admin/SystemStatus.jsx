import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme
} from '@mui/material';
import {
  Storage as DatabaseIcon,
  Computer as ServerIcon,
  AccessTime as UptimeIcon,
  Memory as MemoryIcon,
  Speed as PerformanceIcon,
  CheckCircle as HealthyIcon,
  Error as ErrorIcon,
  Settings as NodeIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';

const SystemStatus = () => {
  const theme = useTheme();

  const {
    data: systemStatus,
    isLoading,
    error
  } = useQuery({
    queryKey: ['systemStatus'],
    queryFn: () => adminAPI.getSystemStatus().then(res => res.data.data),
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        시스템 상태를 불러오는데 실패했습니다: {error.message}
      </Alert>
    );
  }

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);

    if (days > 0) {
      return `${days}일 ${hours}시간 ${minutes}분`;
    } else if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    } else {
      return `${minutes}분`;
    }
  };

  const formatMemory = (mb) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb} MB`;
  };

  const getHealthColor = (status) => {
    return status === 'healthy' ? 'success' : 'error';
  };

  const getHealthIcon = (status) => {
    return status === 'healthy' ? <HealthyIcon /> : <ErrorIcon />;
  };

  const getMemoryUsageColor = (used, total) => {
    const percentage = (used / total) * 100;
    if (percentage > 90) return 'error';
    if (percentage > 70) return 'warning';
    return 'success';
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        시스템 상태
      </Typography>

      {/* Overall Status */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <DatabaseIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h6">데이터베이스</Typography>
              </Box>

              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="body2">상태</Typography>
                <Chip
                  label={systemStatus?.database?.status === 'healthy' ? '정상' : '오류'}
                  color={getHealthColor(systemStatus?.database?.status)}
                  size="small"
                  icon={getHealthIcon(systemStatus?.database?.status)}
                />
              </Box>

              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="body2">응답 시간</Typography>
                <Typography variant="body2" color="text.secondary">
                  {systemStatus?.database?.response_time || 'N/A'}ms
                </Typography>
              </Box>

              {systemStatus?.database?.error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {systemStatus.database.error}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <ServerIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
                <Typography variant="h6">서버</Typography>
              </Box>

              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="body2">상태</Typography>
                <Chip
                  label={systemStatus?.server?.status === 'healthy' ? '정상' : '오류'}
                  color={getHealthColor(systemStatus?.server?.status)}
                  size="small"
                  icon={getHealthIcon(systemStatus?.server?.status)}
                />
              </Box>

              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="body2">가동 시간</Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatUptime(systemStatus?.server?.uptime || 0)}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="body2">환경</Typography>
                <Typography variant="body2" color="text.secondary">
                  {systemStatus?.server?.environment || 'unknown'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Server Information */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                메모리 사용량
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">
                    힙 메모리 사용량
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatMemory(systemStatus?.server?.memory?.used || 0)} / {formatMemory(systemStatus?.server?.memory?.total || 0)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={
                    systemStatus?.server?.memory?.total > 0
                      ? (systemStatus.server.memory.used / systemStatus.server.memory.total) * 100
                      : 0
                  }
                  color={getMemoryUsageColor(
                    systemStatus?.server?.memory?.used || 0,
                    systemStatus?.server?.memory?.total || 1
                  )}
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2">외부 메모리</Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatMemory(systemStatus?.server?.memory?.external || 0)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                시스템 정보
              </Typography>

              <List dense>
                <ListItem disablePadding>
                  <ListItemIcon>
                    <NodeIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Node.js"
                    secondary={systemStatus?.server?.node_version || 'Unknown'}
                  />
                </ListItem>

                <ListItem disablePadding>
                  <ListItemIcon>
                    <UptimeIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="가동 시간"
                    secondary={formatUptime(systemStatus?.server?.uptime || 0)}
                  />
                </ListItem>

                <ListItem disablePadding>
                  <ListItemIcon>
                    <PerformanceIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="환경"
                    secondary={systemStatus?.server?.environment || 'Unknown'}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Timestamp */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          마지막 업데이트: {systemStatus?.timestamp
            ? new Date(systemStatus.timestamp).toLocaleString('ko-KR')
            : 'Unknown'
          }
        </Typography>
      </Box>
    </Box>
  );
};

export default SystemStatus;