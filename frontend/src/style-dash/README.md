# ScoreBoard Style Guide Dashboard

스포츠 플랫폼을 위한 Material Design 3 기반 스타일 가이드 대시보드입니다.

## 🎯 목적

- **일관된 디자인 언어**: 개발팀이 통일된 디자인 시스템을 사용할 수 있도록 지원
- **컴포넌트 라이브러리**: 재사용 가능한 스포츠 전용 컴포넌트 제공
- **접근성 준수**: WCAG 2.1 AA 기준을 충족하는 접근성 가이드라인 제시
- **개발 효율성**: 실시간 미리보기와 코드 샘플로 개발 속도 향상

## 📁 디렉토리 구조

```
src/style-dash/
├── components/           # 재사용 컴포넌트
│   ├── AccessibilityInfo.tsx    # 접근성 정보 표시
│   ├── CodePreview.tsx          # 코드 미리보기
│   ├── TokenDisplay.tsx         # 디자인 토큰 표시
│   └── sports/                  # 스포츠 전용 컴포넌트
│       ├── ScoreCard.tsx        # 경기 스코어 카드
│       ├── StandingsTable.tsx   # 리그 순위표
│       └── LiveScoreboard.tsx   # 실시간 스코어보드
├── pages/               # 페이지 컴포넌트
│   ├── StyleGuideDashboard.tsx  # 메인 대시보드
│   ├── TokenSystemPage.tsx     # 디자인 토큰 페이지
│   └── ComponentShowcase.tsx   # 컴포넌트 쇼케이스
├── utils/               # 유틸리티 함수
│   └── accessibility.ts        # 접근성 검증 도구
└── index.tsx           # 라우팅 설정
```

## 🚀 접근 방법

### 1. URL 접근
```
http://localhost:3000/style-dash
```

### 2. 내비게이션
관리자/모더레이터 권한으로 로그인 후, 헤더의 "스타일 가이드" 버튼 클릭

## 📚 주요 기능

### 🎨 디자인 토큰 시스템
- **색상 팔레트**: Material Design 3 기반 색상 토큰
- **타이포그래피**: 체계적인 글꼴 계층구조
- **간격 시스템**: 8px 기반 일관된 여백 시스템
- **접근성 검증**: 실시간 색상 대비비 확인

### 🏃‍♂️ 스포츠 전용 컴포넌트

#### ScoreCard
```tsx
<ScoreCard
  homeTeam={{ name: 'Manchester United', score: 2 }}
  awayTeam={{ name: 'Arsenal FC', score: 1 }}
  status="finished"
  matchTime="15:30"
  location="Old Trafford"
  competition="Premier League"
/>
```

#### LiveScoreboard
```tsx
<LiveScoreboard
  homeTeam={{ name: 'Barcelona', score: 1 }}
  awayTeam={{ name: 'Real Madrid', score: 1 }}
  matchTime={67}
  period="second-half"
  isLive={true}
  events={events}
/>
```

#### StandingsTable
```tsx
<StandingsTable
  standings={standings}
  title="Premier League Table"
  highlightPositions={{
    champion: [1],
    uefa: [2, 3, 4],
    relegation: [18, 19, 20],
  }}
/>
```

### 🔧 코드 미리보기
- **라이브 미리보기**: 실제 컴포넌트 렌더링 확인
- **코드 샘플**: TypeScript/JSX 구현 예제
- **복사 기능**: 원클릭 코드 복사
- **탭 인터페이스**: Preview/Code 간편 전환

## ♿ 접근성 준수

### WCAG 2.1 AA 기준
- ✅ **색상 대비**: 4.5:1 이상 대비비 유지
- ✅ **키보드 네비게이션**: Tab 키 순서 최적화
- ✅ **터치 타겟**: 최소 44px × 44px 크기
- ✅ **스크린 리더**: ARIA 라벨 및 시맨틱 마크업

### 반응형 디자인
- **모바일**: < 600px (xs)
- **태블릿**: 600px - 900px (sm)
- **데스크톱**: 900px - 1200px (md)
- **대형 화면**: > 1200px (lg)

## 🛠️ 개발 가이드

### 새 컴포넌트 추가
1. `/components/sports/` 디렉토리에 컴포넌트 생성
2. `ComponentShowcase.tsx`에 미리보기 추가
3. Props 타입 정의 및 JSDoc 주석 작성

### 디자인 토큰 활용
```tsx
import { useTheme } from '@mui/material/styles';

const theme = useTheme();
// theme.palette.primary.main
// theme.spacing(2)
// theme.typography.h4
```

### 접근성 고려사항
```tsx
import { focusStyles, touchTargetMinSize } from '../utils/accessibility';

const MyComponent = styled('button')({
  ...focusStyles,
  ...touchTargetMinSize,
});
```

## 📈 향후 계획

- [ ] 다크 모드 지원 강화
- [ ] 더 많은 스포츠 컴포넌트 추가
- [ ] 애니메이션 가이드라인 수립
- [ ] 디자인 토큰 JSON 내보내기 기능
- [ ] Storybook 통합 검토

## 🤝 기여 방법

1. 새로운 컴포넌트나 개선사항 제안
2. 접근성 테스트 및 피드백
3. 사용자 경험 개선 제안
4. 버그 리포트 및 수정

---

**Made with ❤️ for ScoreBoard Platform**