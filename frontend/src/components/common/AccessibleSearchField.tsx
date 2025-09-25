import React, { useState, useEffect, useRef } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Typography
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { generateAriaLabel, getSearchResultAnnouncement } from '../../utils/a11y';

interface AccessibleSearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  target: string; // 'club', 'match', 'competition' 등
  resultCount?: number;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  autoFocus?: boolean;
  onClear?: () => void;
}

/**
 * 접근성이 강화된 검색 필드 컴포넌트
 * - ARIA 레이블 자동 생성
 * - 스크린 리더를 위한 검색 결과 알림
 * - 키보드 네비게이션 지원
 * - 검색어 초기화 기능
 */
const AccessibleSearchField: React.FC<AccessibleSearchFieldProps> = ({
  value,
  onChange,
  placeholder,
  target,
  resultCount,
  disabled = false,
  fullWidth = true,
  size = 'medium',
  autoFocus = false,
  onClear
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [announceText, setAnnounceText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const announceRef = useRef<HTMLDivElement>(null);

  // 검색 결과가 변경될 때 스크린 리더 알림
  useEffect(() => {
    if (typeof resultCount === 'number' && value.trim()) {
      const announcement = getSearchResultAnnouncement(resultCount, value);
      setAnnounceText(announcement);

      // 접근성 알림을 위한 타이머
      const timer = setTimeout(() => {
        setAnnounceText('');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [resultCount, value]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  const handleClear = () => {
    onChange('');
    onClear?.();

    // 포커스를 검색 필드로 다시 이동
    if (inputRef.current) {
      inputRef.current.focus();
    }

    setAnnounceText('검색어가 초기화되었습니다.');
    setTimeout(() => setAnnounceText(''), 2000);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && value) {
      handleClear();
    }
  };

  const searchLabel = generateAriaLabel('search', target);
  const fieldId = `search-${target}`;

  return (
    <Box sx={{ position: 'relative', width: fullWidth ? '100%' : 'auto' }}>
      <TextField
        ref={inputRef}
        id={fieldId}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder || `${target} 검색...`}
        disabled={disabled}
        fullWidth={fullWidth}
        size={size}
        autoFocus={autoFocus}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon
                color={isFocused ? 'primary' : 'action'}
                aria-hidden="true"
              />
            </InputAdornment>
          ),
          endAdornment: value && (
            <InputAdornment position="end">
              <IconButton
                onClick={handleClear}
                onMouseDown={(e) => e.preventDefault()}
                size="small"
                aria-label={`${target} 검색어 초기화`}
                title="검색어 초기화 (ESC)"
              >
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        inputProps={{
          'aria-label': searchLabel,
          'aria-describedby': resultCount !== undefined ? `${fieldId}-results` : undefined,
          'role': 'searchbox',
          'aria-expanded': 'false',
          'aria-autocomplete': 'list'
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': {
              borderWidth: '2px',
            },
          },
        }}
      />

      {/* 검색 결과 수 표시 (접근성용) */}
      {typeof resultCount === 'number' && value.trim() && (
        <Typography
          id={`${fieldId}-results`}
          variant="caption"
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            mt: 0.5,
            color: 'text.secondary',
            fontSize: '0.75rem'
          }}
          aria-live="polite"
        >
          {resultCount === 0 ? '검색 결과 없음' : `${resultCount}개 결과`}
        </Typography>
      )}

      {/* 스크린 리더용 동적 알림 */}
      <Box
        ref={announceRef}
        aria-live="polite"
        aria-atomic="true"
        sx={{
          position: 'absolute',
          left: '-10000px',
          width: '1px',
          height: '1px',
          overflow: 'hidden'
        }}
      >
        {announceText}
      </Box>
    </Box>
  );
};

export default AccessibleSearchField;