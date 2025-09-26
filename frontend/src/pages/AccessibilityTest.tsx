import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Divider,
  Paper,
  Grid,
  Button,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import {
  LoadingSkeleton,
  ErrorBoundary,
  EmptyState,
  SecureForm,
  AccessibleSearchField,
  AccessiblePagination
} from '../components/common';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`a11y-tabpanel-${index}`}
      aria-labelledby={`a11y-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `a11y-tab-${index}`,
    'aria-controls': `a11y-tabpanel-${index}`,
  };
}

/**
 * 접근성(A11Y) 컴포넌트들을 테스트하고 데모하는 페이지
 */
const AccessibilityTest: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [formData, setFormData] = useState({});

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleFormSubmit = (data: any) => {
    setFormData(data);
    console.log('Form submitted:', data);
  };

  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        접근성(A11Y) 컴포넌트 테스트
      </Typography>

      <Alert severity="info" sx={{ mb: 4 }}>
        이 페이지는 접근성 강화 컴포넌트들의 동작을 테스트하고 데모하기 위한 페이지입니다.
        스크린 리더, 키보드 네비게이션, ARIA 속성 등을 테스트할 수 있습니다.
      </Alert>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="접근성 컴포넌트 테스트"
        >
          <Tab label="로딩 & 상태" {...a11yProps(0)} />
          <Tab label="검색 & 네비게이션" {...a11yProps(1)} />
          <Tab label="폼 & 보안" {...a11yProps(2)} />
          <Tab label="에러 처리" {...a11yProps(3)} />
        </Tabs>
      </Box>

      {/* 탭 패널 1: 로딩 및 상태 컴포넌트 */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                LoadingSkeleton 테스트
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  onClick={simulateLoading}
                  disabled={isLoading}
                >
                  3초 로딩 시뮬레이션
                </Button>
              </Box>

              {isLoading ? (
                <LoadingSkeleton variant="card" count={3} />
              ) : (
                <Typography>
                  로딩이 완료되었습니다. 위 버튼을 다시 클릭하여 LoadingSkeleton을 확인해보세요.
                </Typography>
              )}
            </Paper>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                EmptyState 테스트
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="h6">검색 결과 없음:</Typography>
                <EmptyState
                  variant="search"
                  title="검색 결과가 없습니다"
                  description="다른 검색어를 사용해보세요."
                  compact
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="h6">새 항목 만들기:</Typography>
                <EmptyState
                  variant="create"
                  title="등록된 항목이 없습니다"
                  description="새 항목을 만들어보세요."
                  compact
                  actions={[
                    {
                      label: '새 항목 만들기',
                      onClick: () => alert('새 항목 만들기 클릭됨'),
                      variant: 'contained'
                    }
                  ]}
                />
              </Box>
            </Paper>
          </Box>
        </Box>
      </TabPanel>

      {/* 탭 패널 2: 검색 및 네비게이션 */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                AccessibleSearchField 테스트
              </Typography>

              <AccessibleSearchField
                value={searchValue}
                onChange={setSearchValue}
                target="test"
                placeholder="접근성 강화된 검색 필드"
                resultCount={searchValue ? Math.floor(Math.random() * 10) : undefined}
                onClear={() => console.log('Search cleared')}
              />

              <Typography variant="body2" sx={{ mt: 2 }}>
                현재 검색어: "{searchValue}"
                <br />
                • ESC 키로 검색어 초기화
                • 자동 ARIA 레이블 생성
                • 검색 결과 수 알림
              </Typography>
            </Paper>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                AccessiblePagination 테스트
              </Typography>

              <AccessiblePagination
                currentPage={currentPage}
                totalPages={15}
                totalItems={148}
                itemsPerPage={10}
                onChange={setCurrentPage}
                showSummary
              />

              <Typography variant="body2" sx={{ mt: 2 }}>
                현재 페이지: {currentPage}
                <br />
                • 키보드 네비게이션 지원
                • 스크린 리더 친화적 레이블
                • 반응형 디자인 (모바일 최적화)
              </Typography>
            </Paper>
          </Box>
        </Box>
      </TabPanel>

      {/* 탭 패널 3: 폼 및 보안 */}
      <TabPanel value={tabValue} index={2}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            SecureForm 테스트
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            <Box sx={{ flex: 2 }}>
              <SecureForm
                onSubmit={handleFormSubmit}
                loading={false}
              />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom>
                폼 보안 기능:
              </Typography>
              <ul>
                <li>XSS 방지 (DOMPurify)</li>
                <li>입력값 검증 (Yup)</li>
                <li>실시간 검증</li>
                <li>ARIA 에러 메시지</li>
                <li>키보드 네비게이션</li>
              </ul>

              {Object.keys(formData).length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6">제출된 데이터:</Typography>
                  <pre style={{ fontSize: '12px', backgroundColor: '#f5f5f5', padding: '8px' }}>
                    {JSON.stringify(formData, null, 2)}
                  </pre>
                </Box>
              )}
            </Box>
          </Box>
        </Paper>
      </TabPanel>

      {/* 탭 패널 4: 에러 처리 */}
      <TabPanel value={tabValue} index={3}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                ErrorBoundary 테스트
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => setShowError(!showError)}
                >
                  {showError ? '에러 컴포넌트 제거' : '의도적 에러 발생'}
                </Button>
              </Box>

              <ErrorBoundary>
                {showError && (
                  <ErrorThrowingComponent />
                )}
                {!showError && (
                  <Typography>
                    정상적으로 작동하는 컴포넌트입니다.
                    위 버튼을 클릭하여 ErrorBoundary 동작을 확인해보세요.
                  </Typography>
                )}
              </ErrorBoundary>
            </Paper>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                에러 상태 EmptyState
              </Typography>

              <EmptyState
                variant="error"
                title="오류가 발생했습니다"
                description="예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
                actions={[
                  {
                    label: '다시 시도',
                    onClick: () => window.location.reload(),
                    variant: 'contained'
                  },
                  {
                    label: '홈으로 이동',
                    onClick: () => window.location.href = '/',
                    variant: 'outlined'
                  }
                ]}
              />
            </Paper>
          </Box>
        </Box>
      </TabPanel>
    </Container>
  );
};

// 의도적으로 에러를 발생시키는 컴포넌트
const ErrorThrowingComponent: React.FC = () => {
  throw new Error('테스트용 에러: ErrorBoundary가 이 에러를 잡아야 합니다.');
};

export default AccessibilityTest;