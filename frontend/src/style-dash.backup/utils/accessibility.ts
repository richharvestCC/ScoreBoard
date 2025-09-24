/**
 * Accessibility utilities for the Style Guide Dashboard
 * WCAG 2.1 AA 준수를 위한 접근성 유틸리티 함수들
 */

/**
 * 색상 대비비 계산
 * WCAG 2.1 AA 기준: 일반 텍스트 4.5:1, 큰 텍스트 3:1
 */
export const calculateContrastRatio = (foreground: string, background: string): number => {
  const getLuminance = (color: string): number => {
    // RGB 값 추출 (간단한 구현)
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // 상대 광도 계산
    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;

    const rLin = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gLin = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bLin = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * WCAG 준수 여부 확인
 */
export const isWCAGCompliant = (contrastRatio: number, level: 'AA' | 'AAA' = 'AA'): boolean => {
  if (level === 'AA') {
    return contrastRatio >= 4.5;
  }
  return contrastRatio >= 7;
};

/**
 * 키보드 네비게이션 개선을 위한 포커스 스타일
 */
export const focusStyles = {
  '&:focus': {
    outline: '2px solid #005fcc',
    outlineOffset: '2px',
    borderRadius: '4px',
  },
  '&:focus:not(:focus-visible)': {
    outline: 'none',
  },
  '&:focus-visible': {
    outline: '2px solid #005fcc',
    outlineOffset: '2px',
  },
};

/**
 * 스크린 리더를 위한 숨김 텍스트 스타일
 */
export const srOnlyStyles = {
  position: 'absolute' as const,
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap' as const,
  border: 0,
};

/**
 * 모바일 터치 타겟 최소 크기 (44px)
 */
export const touchTargetMinSize = {
  minWidth: '44px',
  minHeight: '44px',
};

/**
 * 애니메이션 감소 설정 (prefers-reduced-motion 지원)
 */
export const respectMotionPreference = (animation: object) => ({
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
    transition: 'none',
  },
  ...animation,
});

export default {
  calculateContrastRatio,
  isWCAGCompliant,
  focusStyles,
  srOnlyStyles,
  touchTargetMinSize,
  respectMotionPreference,
};