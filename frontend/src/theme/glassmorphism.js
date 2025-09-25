/**
 * Glassmorphism 디자인 시스템
 * Material Design 3과 호환되는 유리질감 스타일 정의
 */

// Glassmorphism 컬러 팔레트
export const glassColors = {
  primary: {
    light: 'rgba(25, 118, 210, 0.05)', // primary.main with opacity
    medium: 'rgba(25, 118, 210, 0.08)',
    strong: 'rgba(25, 118, 210, 0.12)',
  },
  secondary: {
    light: 'rgba(156, 39, 176, 0.05)', // secondary.main with opacity
    medium: 'rgba(156, 39, 176, 0.08)',
    strong: 'rgba(156, 39, 176, 0.12)',
  },
  surface: {
    light: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(255, 255, 255, 0.08)',
    strong: 'rgba(255, 255, 255, 0.12)',
    elevated: 'rgba(255, 255, 255, 0.16)',
  },
  dark: {
    light: 'rgba(0, 0, 0, 0.05)',
    medium: 'rgba(0, 0, 0, 0.08)',
    strong: 'rgba(0, 0, 0, 0.12)',
  }
};

// Blur 강도 설정
export const blurIntensity = {
  subtle: 'blur(4px)',
  medium: 'blur(8px)',
  strong: 'blur(12px)',
  intense: 'blur(16px)',
};

// 기본 Glassmorphism 스타일
export const glassStyles = {
  // 기본 글래스 카드
  card: {
    background: glassColors.surface.medium,
    backdropFilter: blurIntensity.medium,
    border: `1px solid ${glassColors.surface.light}`,
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      background: glassColors.surface.strong,
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
      transform: 'translateY(-2px)',
    }
  },

  // 네비게이션 카드 (더 강한 효과)
  navigationCard: {
    background: glassColors.surface.elevated,
    backdropFilter: blurIntensity.strong,
    border: `1px solid ${glassColors.surface.medium}`,
    borderRadius: '20px',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.20)',
      boxShadow: '0 16px 50px rgba(0, 0, 0, 0.18)',
      transform: 'translateY(-4px) scale(1.02)',
      border: `1px solid rgba(255, 255, 255, 0.25)`,
    }
  },

  // 통계 카드 (Primary 색상)
  statsCard: {
    background: `linear-gradient(135deg, ${glassColors.primary.medium}, ${glassColors.surface.medium})`,
    backdropFilter: blurIntensity.medium,
    border: `1px solid ${glassColors.primary.light}`,
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(25, 118, 210, 0.15)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      background: `linear-gradient(135deg, ${glassColors.primary.strong}, ${glassColors.surface.strong})`,
      boxShadow: '0 12px 40px rgba(25, 118, 210, 0.25)',
      transform: 'translateY(-2px)',
    }
  },

  // Quick Action 버튼
  quickAction: {
    background: glassColors.surface.light,
    backdropFilter: blurIntensity.subtle,
    border: `1px solid ${glassColors.surface.light}`,
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      background: glassColors.surface.medium,
      boxShadow: '0 6px 25px rgba(0, 0, 0, 0.12)',
      transform: 'translateY(-1px)',
    }
  },

  // 헤더/상단 영역
  header: {
    background: `linear-gradient(135deg, ${glassColors.surface.light}, ${glassColors.surface.medium})`,
    backdropFilter: blurIntensity.medium,
    borderBottom: `1px solid ${glassColors.surface.light}`,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  },

  // 모달/다이얼로그
  modal: {
    background: glassColors.surface.elevated,
    backdropFilter: blurIntensity.intense,
    border: `1px solid ${glassColors.surface.strong}`,
    borderRadius: '24px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
  }
};

// 애니메이션 프리셋
export const glassAnimations = {
  // 부드러운 등장 애니메이션
  fadeInUp: {
    '@keyframes fadeInUp': {
      '0%': {
        opacity: 0,
        transform: 'translateY(30px)',
      },
      '100%': {
        opacity: 1,
        transform: 'translateY(0)',
      }
    },
    animation: 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards'
  },

  // 스케일 등장 애니메이션
  scaleIn: {
    '@keyframes scaleIn': {
      '0%': {
        opacity: 0,
        transform: 'scale(0.9)',
      },
      '100%': {
        opacity: 1,
        transform: 'scale(1)',
      }
    },
    animation: 'scaleIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards'
  },

  // 스태거 애니메이션 (순차 등장)
  stagger: (delay = 0) => ({
    animationDelay: `${delay * 0.1}s`,
    ...glassAnimations.fadeInUp
  })
};

// 반응형 글래스 효과
export const responsiveGlass = {
  mobile: {
    ...glassStyles.card,
    backdropFilter: blurIntensity.subtle, // 모바일에서는 약한 블러
    borderRadius: '12px',
  },
  tablet: {
    ...glassStyles.card,
    backdropFilter: blurIntensity.medium,
    borderRadius: '16px',
  },
  desktop: {
    ...glassStyles.card,
    backdropFilter: blurIntensity.strong,
    borderRadius: '20px',
  }
};

// 테마별 글래스 효과 (다크모드 지원)
export const createGlassTheme = (isDark = false) => {
  const baseColors = isDark ? glassColors.dark : glassColors.surface;

  return {
    card: {
      ...glassStyles.card,
      background: isDark ? 'rgba(18, 18, 18, 0.80)' : glassColors.surface.medium,
      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : glassColors.surface.light}`,
    },
    navigationCard: {
      ...glassStyles.navigationCard,
      background: isDark ? 'rgba(18, 18, 18, 0.85)' : glassColors.surface.elevated,
      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.15)' : glassColors.surface.medium}`,
    }
  };
};

// 유틸리티 함수들
export const glassUtils = {
  // 커스텀 글래스 효과 생성
  createCustomGlass: (opacity = 0.08, blur = 8, color = 'white') => ({
    background: `rgba(${color === 'white' ? '255, 255, 255' : '0, 0, 0'}, ${opacity})`,
    backdropFilter: `blur(${blur}px)`,
    border: `1px solid rgba(${color === 'white' ? '255, 255, 255' : '255, 255, 255'}, ${opacity * 0.5})`,
    borderRadius: '16px',
    boxShadow: `0 8px 32px rgba(0, 0, 0, ${color === 'white' ? 0.1 : 0.3})`,
  }),

  // 호버 효과 추가
  addHoverEffect: (baseStyle, intensity = 1.2) => ({
    ...baseStyle,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      ...baseStyle,
      transform: `translateY(-${2 * intensity}px) scale(${1 + (0.01 * intensity)})`,
      boxShadow: baseStyle.boxShadow?.replace('0.1', `${0.1 * intensity * 1.5}`) || `0 ${8 * intensity}px ${32 * intensity}px rgba(0, 0, 0, ${0.15 * intensity})`,
    }
  })
};

export default {
  colors: glassColors,
  blur: blurIntensity,
  styles: glassStyles,
  animations: glassAnimations,
  responsive: responsiveGlass,
  createTheme: createGlassTheme,
  utils: glassUtils,
};