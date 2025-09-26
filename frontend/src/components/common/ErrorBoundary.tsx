import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Card,
  CardContent,
  CardActions,
  Divider
} from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  BugReport as BugReportIcon
} from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      eventId: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 ErrorBoundary Caught an Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.groupEnd();
    }

    // In production, you might want to send to error reporting service
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, eventId } = this.state;
      const { showDetails = process.env.NODE_ENV === 'development' } = this.props;

      return (
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            textAlign="center"
            role="alert"
            aria-live="assertive"
          >
            <Card sx={{ width: '100%', maxWidth: 600 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ mb: 3 }}>
                  <ErrorIcon
                    sx={{
                      fontSize: 64,
                      color: 'error.main',
                      mb: 2
                    }}
                    aria-hidden="true"
                  />
                  <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    앗, 문제가 발생했습니다
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                  >
                    예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
                  </Typography>
                </Box>

                {eventId && (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    <AlertTitle>오류 ID</AlertTitle>
                    문제를 신고할 때 다음 ID를 포함해주세요: <strong>{eventId}</strong>
                  </Alert>
                )}

                {showDetails && error && (
                  <>
                    <Divider sx={{ my: 3 }} />
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="h6" gutterBottom>
                        <BugReportIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        개발자 정보
                      </Typography>
                      <Alert severity="error" sx={{ mb: 2 }}>
                        <AlertTitle>오류 메시지</AlertTitle>
                        <Typography
                          component="pre"
                          sx={{
                            fontSize: '0.875rem',
                            fontFamily: 'monospace',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                          }}
                        >
                          {error.toString()}
                        </Typography>
                      </Alert>

                      {errorInfo && errorInfo.componentStack && (
                        <Alert severity="warning">
                          <AlertTitle>컴포넌트 스택</AlertTitle>
                          <Typography
                            component="pre"
                            sx={{
                              fontSize: '0.75rem',
                              fontFamily: 'monospace',
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                              maxHeight: 200,
                              overflow: 'auto'
                            }}
                          >
                            {errorInfo.componentStack}
                          </Typography>
                        </Alert>
                      )}
                    </Box>
                  </>
                )}
              </CardContent>

              <CardActions sx={{ p: 3, pt: 0, justifyContent: 'center', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={this.handleRetry}
                  startIcon={<RefreshIcon />}
                  size="large"
                >
                  다시 시도
                </Button>
                <Button
                  variant="outlined"
                  onClick={this.handleRefresh}
                  startIcon={<RefreshIcon />}
                  size="large"
                >
                  페이지 새로고침
                </Button>
                <Button
                  variant="text"
                  onClick={this.handleGoHome}
                  startIcon={<HomeIcon />}
                  size="large"
                >
                  홈으로 이동
                </Button>
              </CardActions>
            </Card>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

// HOC for function components
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

export default ErrorBoundary;