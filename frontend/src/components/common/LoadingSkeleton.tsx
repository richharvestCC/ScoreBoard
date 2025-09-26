import React from 'react';
import {
  Box,
  Container,
  CircularProgress,
  Skeleton,
  Card,
  CardContent,
  SxProps,
  Theme
} from '@mui/material';

export interface LoadingSkeletonProps {
  variant?: 'circular' | 'list' | 'card' | 'table' | 'page';
  count?: number;
  height?: number | string;
  width?: number | string;
  animation?: 'pulse' | 'wave' | false;
  container?: boolean;
  sx?: SxProps<Theme>;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'circular',
  count = 3,
  height = 40,
  width = '100%',
  animation = 'pulse',
  container = false,
  sx = {}
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'circular':
        return (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="50vh"
            sx={sx}
            role="status"
            aria-label="콘텐츠 로딩 중"
          >
            <CircularProgress
              size={40}
              aria-describedby="loading-description"
            />
            <span
              id="loading-description"
              className="sr-only"
              style={{
                position: 'absolute',
                width: 1,
                height: 1,
                padding: 0,
                margin: -1,
                overflow: 'hidden',
                clip: 'rect(0, 0, 0, 0)',
                whiteSpace: 'nowrap',
                border: 0
              }}
            >
              데이터를 불러오는 중입니다
            </span>
          </Box>
        );

      case 'list':
        return (
          <Box sx={sx} role="status" aria-label="목록 로딩 중">
            {Array.from({ length: count }, (_, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Skeleton
                    variant="circular"
                    width={40}
                    height={40}
                    animation={animation}
                    sx={{ mr: 2 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton
                      variant="text"
                      width="70%"
                      height={24}
                      animation={animation}
                    />
                    <Skeleton
                      variant="text"
                      width="50%"
                      height={16}
                      animation={animation}
                    />
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        );

      case 'card':
        return (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 3,
            ...sx
          }} role="status" aria-label="카드 목록 로딩 중">
            {Array.from({ length: count }, (_, index) => (
              <Card key={index}>
                <Skeleton
                  variant="rectangular"
                  height={200}
                  animation={animation}
                />
                <CardContent>
                  <Skeleton
                    variant="text"
                    width="80%"
                    height={32}
                    animation={animation}
                    sx={{ mb: 1 }}
                  />
                  <Skeleton
                    variant="text"
                    width="60%"
                    height={20}
                    animation={animation}
                    sx={{ mb: 2 }}
                  />
                  <Skeleton
                    variant="text"
                    width="100%"
                    height={16}
                    animation={animation}
                  />
                  <Skeleton
                    variant="text"
                    width="90%"
                    height={16}
                    animation={animation}
                  />
                </CardContent>
              </Card>
            ))}
          </Box>
        );

      case 'table':
        return (
          <Box sx={sx} role="status" aria-label="테이블 로딩 중">
            {Array.from({ length: count }, (_, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1, p: 1 }}>
                <Skeleton
                  variant="text"
                  width="15%"
                  height={20}
                  animation={animation}
                  sx={{ mr: 2 }}
                />
                <Skeleton
                  variant="text"
                  width="25%"
                  height={20}
                  animation={animation}
                  sx={{ mr: 2 }}
                />
                <Skeleton
                  variant="text"
                  width="20%"
                  height={20}
                  animation={animation}
                  sx={{ mr: 2 }}
                />
                <Skeleton
                  variant="text"
                  width="30%"
                  height={20}
                  animation={animation}
                  sx={{ mr: 2 }}
                />
                <Skeleton
                  variant="text"
                  width="10%"
                  height={20}
                  animation={animation}
                />
              </Box>
            ))}
          </Box>
        );

      case 'page':
        return (
          <Box sx={sx} role="status" aria-label="페이지 로딩 중">
            <Skeleton
              variant="text"
              width="60%"
              height={48}
              animation={animation}
              sx={{ mb: 3 }}
            />
            <Box sx={{ mb: 4 }}>
              <Skeleton
                variant="rectangular"
                width="100%"
                height={56}
                animation={animation}
              />
            </Box>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: 3
            }}>
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton
                  key={index}
                  variant="rectangular"
                  width="100%"
                  height={200}
                  animation={animation}
                />
              ))}
            </Box>
          </Box>
        );

      default:
        return (
          <Skeleton
            width={width}
            height={height}
            animation={animation}
            sx={sx}
          />
        );
    }
  };

  const content = renderSkeleton();

  if (container) {
    return <Container maxWidth="lg">{content}</Container>;
  }

  return content;
};

export default LoadingSkeleton;