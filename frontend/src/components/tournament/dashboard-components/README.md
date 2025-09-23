# Tournament Dashboard Components

Material Design 3 기반 토너먼트 대시보드 컴포넌트 모음

## 📁 폴더 구조

```
dashboard-components/
├── creation/           # 대회 생성 관련 컴포넌트
│   ├── TournamentCreationModal.tsx
│   ├── CompetitionTypeToggle.tsx
│   ├── SafetyCheckDialog.tsx
│   └── TournamentConfigForm.tsx
├── bracket/            # 브래킷 렌더링 컴포넌트
│   ├── SVGTournamentBracket.tsx
│   ├── GroupStageGrid.tsx
│   ├── MatchCard.tsx
│   └── ZoomPanContainer.tsx
├── controls/           # 컨트롤 패널 컴포넌트
│   ├── TournamentHeader.tsx
│   ├── ControlPanel.tsx
│   └── NavigationTabs.tsx
└── shared/             # 공통 컴포넌트
    ├── MaterialToggle.tsx
    ├── ResponsiveLayout.tsx
    └── AnimatedModal.tsx
```

## 🎯 개발 브랜치 전략

각 태스크별로 별도 브랜치에서 개발 후 `feature/tournament-ui`로 머지:

1. `task/tournament-ui-01-components` - 기본 컴포넌트 구조
2. `task/tournament-ui-02-theme` - Material Design 3 테마
3. `task/tournament-ui-03-responsive` - 반응형 레이아웃
4. `task/tournament-ui-04-svg-bracket` - SVG 브래킷 렌더링
5. `task/tournament-ui-05-zoom-gesture` - 줌/핀치 제스처
6. `task/tournament-ui-06-safety-modal` - 안전장치 및 모달
7. `task/tournament-ui-07-animation` - 애니메이션
8. `task/tournament-ui-08-optimization` - 성능 최적화

## 🚀 기술 스택

- **React 18** + **TypeScript**
- **Material-UI v5** (Material Design 3)
- **Framer Motion** (애니메이션)
- **react-zoom-pan-pinch** (줌/핀치)
- **Styled Components** (커스텀 스타일링)

## 📱 반응형 지원

- **데스크톱**: 1920px+ (풀 기능)
- **태블릿 가로**: 1024px-1919px (적응형)
- **태블릿 세로**: 768px-1023px (컴팩트)
- **모바일**: 767px 이하 (지원 제외)