import React from 'react';
import {
  Pagination,
  PaginationItem,
  Box,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon
} from '@mui/icons-material';
import { getPaginationAccessibilityProps } from '../../utils/a11y';

interface AccessiblePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  onChange: (page: number) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  showFirstLast?: boolean;
  showSummary?: boolean;
  className?: string;
  'aria-label'?: string;
}

/**
 * 접근성이 강화된 페이지네이션 컴포넌트
 * - 키보드 네비게이션 완전 지원
 * - 스크린 리더를 위한 적절한 ARIA 레이블
 * - 반응형 디자인 (모바일에서 간소화)
 * - 페이지 정보 요약 제공
 */
const AccessiblePagination: React.FC<AccessiblePaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onChange,
  disabled = false,
  size = 'medium',
  showFirstLast = true,
  showSummary = true,
  className,
  'aria-label': ariaLabel = '페이지 네비게이션'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 모바일에서는 간소화된 버전 표시
  const siblingCount = isMobile ? 0 : 1;
  const boundaryCount = isMobile ? 1 : 2;

  if (totalPages <= 1) return null;

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    if (page !== currentPage && !disabled) {
      onChange(page);

      // 페이지 변경 시 스크롤을 상단으로 (부드럽게)
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // 현재 페이지 범위 계산
  const startItem = totalItems ? (currentPage - 1) * (itemsPerPage || 10) + 1 : null;
  const endItem = totalItems ? Math.min(currentPage * (itemsPerPage || 10), totalItems) : null;

  const paginationProps = getPaginationAccessibilityProps(currentPage, totalPages);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        py: 2
      }}
      className={className}
      {...paginationProps}
    >
      {/* 페이지 정보 요약 */}
      {showSummary && totalItems && startItem && endItem && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            order: { xs: 2, sm: 1 },
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          <Box component="span" sx={{ fontWeight: 'medium' }}>
            {startItem}-{endItem}
          </Box>
          {' '}of{' '}
          <Box component="span" sx={{ fontWeight: 'medium' }}>
            {totalItems.toLocaleString()}
          </Box>
          {' '}items
        </Typography>
      )}

      {/* 페이지네이션 네비게이션 */}
      <Box
        sx={{
          order: { xs: 1, sm: 2 }
        }}
      >
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          disabled={disabled}
          size={size}
          siblingCount={siblingCount}
          boundaryCount={boundaryCount}
          showFirstButton={showFirstLast && !isMobile}
          showLastButton={showFirstLast && !isMobile}
          color="primary"
          renderItem={(item) => (
            <PaginationItem
              {...item}
              components={{
                first: FirstPageIcon,
                last: LastPageIcon,
                previous: PrevIcon,
                next: NextIcon,
              }}
              // 접근성 개선을 위한 커스텀 레이블
              {...(item.type === 'first' && {
                'aria-label': '첫 페이지로 이동',
                title: '첫 페이지 (1)'
              })}
              {...(item.type === 'last' && {
                'aria-label': '마지막 페이지로 이동',
                title: `마지막 페이지 (${totalPages})`
              })}
              {...(item.type === 'previous' && {
                'aria-label': '이전 페이지로 이동',
                title: `이전 페이지 (${currentPage - 1})`
              })}
              {...(item.type === 'next' && {
                'aria-label': '다음 페이지로 이동',
                title: `다음 페이지 (${currentPage + 1})`
              })}
              {...(item.type === 'page' && {
                'aria-label': `페이지 ${item.page}${item.page === currentPage ? ', 현재 페이지' : ''}로 이동`,
                title: `페이지 ${item.page}`,
                'aria-current': item.page === currentPage ? 'page' : undefined
              })}
              sx={{
                '&.Mui-selected': {
                  fontWeight: 'bold',
                  '&:focus': {
                    outline: `2px solid ${theme.palette.primary.main}`,
                    outlineOffset: '2px'
                  }
                },
                '&:focus': {
                  outline: `2px solid ${theme.palette.primary.main}`,
                  outlineOffset: '2px'
                }
              }}
            />
          )}
          aria-label={ariaLabel}
        />
      </Box>

      {/* 모바일에서 간단한 페이지 정보 */}
      {isMobile && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            order: 3,
            textAlign: 'center'
          }}
        >
          페이지 {currentPage} / {totalPages}
        </Typography>
      )}
    </Box>
  );
};

export default AccessiblePagination;