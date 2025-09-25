// MatchCard 디자인 토큰 정의
// Material Design 3 기반 스포츠 플랫폼용 통합 스타일 시스템

export const designTokens = {
  // ==========================================
  // 색상 시스템 (Color System)
  // ==========================================
  colors: {
    // 기본 색상 (Primary Colors)
    primary: {
      light: '#282828',  // 다크 그레이 (라이트 모드)
      dark: '#fefefe',   // 거의 화이트 (다크 모드)
    },

    // 보조 색상 (Secondary Colors)
    secondary: {
      light: '#666666',
      dark: '#b0b0b0',
    },

    // 배경 색상 (Background Colors)
    background: {
      light: {
        default: '#fafafa',
        paper: '#ffffff',
        surface: '#ffffff',
        surfaceVariant: '#f5f5f5',
      },
      dark: {
        default: '#121212',
        paper: '#1e1e1e',
        surface: '#1e1e1e',
        surfaceVariant: '#2a2a2a',
      }
    },

    // 텍스트 색상 (Text Colors)
    text: {
      light: {
        primary: '#282828',
        secondary: '#282828',
      },
      dark: {
        primary: '#fefefe',
        secondary: '#b0b0b0',
      }
    },

    // 스포츠 전용 색상 (Sports Colors)
    sports: {
      success: '#4CAF50',    // 승리/골
      warning: '#FFC107',    // 경고/옐로카드
      error: '#F44336',      // 패배/레드카드
      info: '#2196F3',       // 정보/통계
    },

    // 구분선 (Dividers)
    divider: {
      light: 'rgba(0, 0, 0, 0.08)',
      dark: 'rgba(255, 255, 255, 0.08)',
    }
  },

  // ==========================================
  // 타이포그래피 시스템 (Typography System)
  // ==========================================
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',

    // 헤딩 (Headings)
    headings: {
      h1: {
        fontSize: '2.5rem',    // 40px
        fontWeight: 700,
        letterSpacing: '-0.025em',
        lineHeight: 1.2,
      },
      h2: {
        fontSize: '2rem',      // 32px
        fontWeight: 600,
        letterSpacing: '-0.025em',
        lineHeight: 1.25,
      },
      h3: {
        fontSize: '1.5rem',    // 24px
        fontWeight: 600,
        letterSpacing: '-0.015em',
        lineHeight: 1.3,
      },
      h4: {
        fontSize: '1.25rem',   // 20px
        fontWeight: 600,
        letterSpacing: '-0.015em',
        lineHeight: 1.35,
      },
      h5: {
        fontSize: '1.125rem',  // 18px
        fontWeight: 600,
        letterSpacing: '-0.01em',
        lineHeight: 1.4,
      },
      h6: {
        fontSize: '1rem',      // 16px
        fontWeight: 600,
        letterSpacing: '-0.01em',
        lineHeight: 1.45,
      },
    },

    // 본문 (Body Text)
    body: {
      body1: {
        fontSize: '1rem',      // 16px
        fontWeight: 400,
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.875rem',  // 14px
        fontWeight: 400,
        lineHeight: 1.5,
      },
      caption: {
        fontSize: '0.75rem',   // 12px
        fontWeight: 400,
        lineHeight: 1.4,
      },
    }
  },

  // ==========================================
  // 간격 시스템 (Spacing System)
  // ==========================================
  spacing: {
    base: 8,  // 8px 기본 단위
    scale: {
      xs: 4,   // 4px
      sm: 8,   // 8px
      md: 16,  // 16px
      lg: 24,  // 24px
      xl: 32,  // 32px
      xxl: 48, // 48px
    }
  },

  // ==========================================
  // 둥근 모서리 (Border Radius)
  // ==========================================
  borderRadius: {
    none: 0,
    sm: 8,     // 작은 요소 (칩, 태그)
    md: 12,    // 기본 (카드, 입력 필드)
    lg: 16,    // 큰 카드
    xl: 20,    // 버튼
    full: 9999, // 완전 둥근 (아바타)
  },

  // ==========================================
  // 그림자 (Elevation/Shadow)
  // ==========================================
  shadows: {
    none: 'none',
    sm: '0 1px 3px rgba(0, 0, 0, 0.05)',
    md: '0 4px 12px rgba(0, 0, 0, 0.1)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.15)',
    xl: '0 12px 32px rgba(0, 0, 0, 0.2)',
  },

  // ==========================================
  // 반응형 브레이크포인트 (Breakpoints)
  // ==========================================
  breakpoints: {
    // 모바일: 320px ~ 767.98px
    mobile: {
      min: 320,
      max: 767.98
    },
    // 태블릿: 768px ~ 1023.98px
    tablet: {
      min: 768,
      max: 1023.98
    },
    // 데스크톱: 1024px ~ 1279px
    desktop: {
      min: 1024,
      max: 1279
    },
    // 대형 데스크톱: 1280px ~ 1440px
    largeDesktop: {
      min: 1280,
      max: 1440
    },
    // 초대형 데스크톱: 1441px+
    extraLarge: {
      min: 1441
    }
  },

  // 미디어 쿼리 헬퍼
  mediaQueries: {
    mobile: `@media (min-width: 320px) and (max-width: 767.98px)`,
    tablet: `@media (min-width: 768px) and (max-width: 1023.98px)`,
    desktop: `@media (min-width: 1024px) and (max-width: 1279px)`,
    largeDesktop: `@media (min-width: 1280px) and (max-width: 1440px)`,
    extraLarge: `@media (min-width: 1441px)`,

    // max-width 기준
    maxMobile: `@media (max-width: 767.98px)`,
    maxTablet: `@media (max-width: 1023.98px)`,
    maxDesktop: `@media (max-width: 1279px)`,
    maxLarge: `@media (max-width: 1440px)`,

    // min-width 기준
    minTablet: `@media (min-width: 768px)`,
    minDesktop: `@media (min-width: 1024px)`,
    minLarge: `@media (min-width: 1280px)`,
    minExtraLarge: `@media (min-width: 1441px)`
  },

  // 컨테이너 최대 너비
  containerMaxWidth: {
    mobile: '100%',
    tablet: '100%',
    desktop: '1200px',
    largeDesktop: '1320px',
    extraLarge: '1400px'
  },

  // ==========================================
  // 스포츠 특화 토큰 (Sports-specific Tokens)
  // ==========================================
  sports: {
    // 경기 상태 색상
    matchStatus: {
      live: '#ff4444',      // 라이브 경기
      upcoming: '#2196F3',  // 예정된 경기
      finished: '#666666',  // 종료된 경기
      postponed: '#FFC107', // 연기된 경기
    },

    // 점수/결과 색상
    score: {
      home: '#1976D2',      // 홈팀
      away: '#D32F2F',      // 원정팀
      draw: '#666666',      // 무승부
    },

    // 통계 차트 색상
    charts: {
      primary: '#2196F3',
      secondary: '#4CAF50',
      tertiary: '#FF9800',
      quaternary: '#9C27B0',
    }
  }
};

// ==========================================
// 헬퍼 함수들 (Helper Functions)
// ==========================================

// 색상 투명도 적용
export const alpha = (color, opacity) => {
  const rgb = color.match(/\w\w/g);
  if (rgb) {
    const [r, g, b] = rgb.map(x => parseInt(x, 16));
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

// 반응형 spacing 계산
export const getResponsiveSpacing = (size) => ({
  xs: designTokens.spacing.scale[size] * 0.5,
  sm: designTokens.spacing.scale[size] * 0.75,
  md: designTokens.spacing.scale[size],
  lg: designTokens.spacing.scale[size] * 1.25,
  xl: designTokens.spacing.scale[size] * 1.5,
});

// 다크/라이트 모드 색상 선택
export const getColorByMode = (lightColor, darkColor, mode = 'light') => {
  return mode === 'dark' ? darkColor : lightColor;
};

export default designTokens;