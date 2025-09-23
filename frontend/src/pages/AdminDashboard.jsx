import React, { useState } from 'react';
import {
  Box,
  Container,
  Tabs,
  Tab,
  Typography,
  Alert,
  Paper
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  SettingsSystemDaydream as SystemIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import DashboardStats from '../components/admin/DashboardStats';
import UserManagement from '../components/admin/UserManagement';
import SystemStatus from '../components/admin/SystemStatus';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState(0);

  // Check if user has admin or moderator role
  const hasAdminAccess = user && ['admin', 'moderator'].includes(user.role);
  const hasSystemAccess = user && user.role === 'admin'; // Only admin can see system status

  if (!hasAdminAccess) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          이 페이지에 접근할 권한이 없습니다. 관리자 권한이 필요합니다.
        </Alert>
      </Container>
    );
  }

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );

  const tabs = [
    {
      label: '대시보드',
      icon: <DashboardIcon />,
      component: <DashboardStats />,
      available: true
    },
    {
      label: '사용자 관리',
      icon: <PeopleIcon />,
      component: <UserManagement />,
      available: true
    },
    {
      label: '시스템 상태',
      icon: <SystemIcon />,
      component: <SystemStatus />,
      available: hasSystemAccess
    }
  ].filter(tab => tab.available);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          관리자 대시보드
        </Typography>
        <Typography variant="body1" color="text.secondary">
          시스템 관리 및 사용자 관리를 위한 관리자 도구입니다.
        </Typography>
      </Box>

      {/* Role-based welcome message */}
      <Alert
        severity="info"
        sx={{ mb: 3 }}
      >
        {user.role === 'admin' ? (
          <>
            <strong>관리자</strong>로 로그인하셨습니다. 모든 관리 기능을 사용할 수 있습니다.
          </>
        ) : (
          <>
            <strong>운영자</strong>로 로그인하셨습니다. 제한된 관리 기능을 사용할 수 있습니다.
          </>
        )}
      </Alert>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="admin dashboard tabs"
          variant="fullWidth"
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
              id={`admin-tab-${index}`}
              aria-controls={`admin-tabpanel-${index}`}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabs.map((tab, index) => (
        <TabPanel key={index} value={currentTab} index={index}>
          {tab.component}
        </TabPanel>
      ))}
    </Container>
  );
};

export default AdminDashboard;