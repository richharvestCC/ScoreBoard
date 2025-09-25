# 🛠️ ScoreBoard 개발 가이드

**생성일**: 2025년 9월 25일
**최종 업데이트**: 2025년 9월 25일
**통합 문서**: documentation-management-guide.md + 각종 claude.md
**목적**: 개발자 온보딩 및 개발 표준 가이드

---

## 📚 **개발 환경 및 도구**

### **프론트엔드 스택**
- **React 18** + **TypeScript** + **Material-UI v5**
- **Build Tool**: Create React App (CRA)
- **State Management**: React Context + Custom Hooks
- **Styling**: MUI sx props + Material Design 3

### **백엔드 스택**
- **Node.js** + **Express.js** + **TypeScript**
- **Database**: PostgreSQL + Sequelize ORM
- **Authentication**: JWT Bearer Token
- **Logging**: Winston + 구조화된 로그

### **개발 도구**
- **IDE**: Claude Code (권장)
- **Version Control**: Git + GitHub
- **Package Manager**: npm
- **Testing**: Jest + React Testing Library

---

## 🎯 **코딩 표준 및 컨벤션**

### **React 컴포넌트 표준 패턴**
```typescript
interface ComponentNameProps {
  title: string;
  onAction?: (data: DataType) => void;
  variant?: 'primary' | 'secondary';
}

const ComponentName: React.FC<ComponentNameProps> = React.memo(({
  title,
  onAction,
  variant = 'primary'
}) => {
  // 1. State hooks
  const [loading, setLoading] = useState(false);

  // 2. Context hooks
  const { user } = useAuth();

  // 3. Memoized values
  const computedValue = useMemo(() => {
    return expensiveCalculation(data);
  }, [data]);

  // 4. Event handlers
  const handleClick = useCallback((event: React.MouseEvent) => {
    onAction?.(computedValue);
  }, [onAction, computedValue]);

  // 5. Render
  return (
    <Box sx={{ p: 2, display: 'flex' }}>
      {/* JSX */}
    </Box>
  );
});

ComponentName.displayName = 'ComponentName';
export default ComponentName;
```

### **TypeScript 표준**
- **strict 모드 사용**: `tsconfig.json`에서 strict: true
- **명시적 타입 정의**: any 타입 최소화
- **인터페이스 우선**: type보다 interface 선호
- **제네릭 활용**: 재사용성 극대화

### **MUI 스타일링 베스트 프랙티스**
```typescript
// sx prop으로 반응형 스타일링
<Container
  sx={{
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    gap: { xs: 2, md: 4 },
    p: { xs: 2, sm: 3, md: 4 },
    backgroundColor: 'background.paper'
  }}
>
```

---

## 📁 **프로젝트 구조 및 아키텍처**

### **프론트엔드 디렉토리 구조**
```
frontend/src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── common/         # 공통 컴포넌트
│   ├── layout/         # 레이아웃 컴포넌트
│   └── specific/       # 도메인별 컴포넌트
├── pages/              # 페이지 컴포넌트
├── hooks/              # 커스텀 훅
├── contexts/           # React Context
├── services/           # API 서비스
├── utils/              # 유틸리티 함수
├── types/              # TypeScript 타입 정의
└── theme/              # MUI 테마 설정
```

### **백엔드 디렉토리 구조**
```
backend/src/
├── controllers/        # 요청 처리 컨트롤러
├── models/            # Sequelize 모델
├── routes/            # Express 라우터
├── middleware/        # 미들웨어
├── services/          # 비즈니스 로직
├── utils/             # 유틸리티 함수
├── config/            # 설정 파일
└── migrations/        # 데이터베이스 마이그레이션
```

---

## 🔄 **Git 워크플로우**

### **브랜치 전략**
- **main**: 프로덕션 배포 브랜치
- **develop**: 개발 통합 브랜치
- **feature/***: 기능 개발 브랜치
- **hotfix/***: 긴급 수정 브랜치

### **커밋 메시지 컨벤션**
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅, 세미콜론 누락
refactor: 코드 리팩토링
test: 테스트 코드 추가/수정
chore: 빌드 프로세스 또는 보조 도구 수정

예시:
feat: 사용자 권한 기반 메뉴 필터링 추가
fix: 로그인 토큰 갱신 오류 해결
```

### **PR(Pull Request) 프로세스**
1. Feature 브랜치에서 개발
2. 테스트 작성 및 실행
3. PR 생성 및 리뷰 요청
4. 코드 리뷰 및 피드백 반영
5. main/develop으로 병합

---

## 🧪 **테스트 가이드라인**

### **테스트 전략**
- **단위 테스트**: Jest + React Testing Library
- **통합 테스트**: 주요 워크플로우 테스트
- **E2E 테스트**: Playwright (필요 시)

### **테스트 작성 패턴**
```typescript
// React 컴포넌트 테스트
describe('ComponentName', () => {
  it('renders without crashing', () => {
    render(<ComponentName {...defaultProps} />);
  });

  it('displays correct title', () => {
    render(<ComponentName title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('calls onClick when button is clicked', async () => {
    const mockClick = jest.fn();
    render(<ComponentName onAction={mockClick} />);

    await user.click(screen.getByRole('button'));
    expect(mockClick).toHaveBeenCalledTimes(1);
  });
});
```

---

## 🚀 **배포 및 운영**

### **개발 서버 실행**
```bash
# 프론트엔드
cd frontend && npm start

# 백엔드
cd backend && npm start

# 데이터베이스 설정
npm run db:setup
```

### **빌드 및 배포**
```bash
# 프론트엔드 빌드
npm run build

# TypeScript 컴파일 검증
npm run typecheck

# 테스트 실행
npm test
```

### **환경 변수 관리**
```bash
# .env.development
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENV=development

# .env.production
REACT_APP_API_URL=https://api.scoreboard.com
REACT_APP_ENV=production
```

---

## 📊 **성능 및 품질 기준**

### **성능 목표**
- **번들 크기**: < 300KB (gzip)
- **초기 로드 시간**: < 2초
- **컴포넌트 최적화 점수**: 85점+
- **TypeScript 적용률**: 95%+

### **코드 품질 체크리스트**
- [ ] TypeScript strict 모드 오류 없음
- [ ] ESLint 경고 없음
- [ ] React.memo 적절히 적용
- [ ] 접근성(A11Y) 고려 (ARIA 속성, 키보드 네비게이션)
- [ ] 테스트 커버리지 80%+

---

## 🔧 **디버깅 및 문제 해결**

### **일반적인 문제 해결**

#### **컴파일 오류**
```bash
# TypeScript 오류 확인
npm run typecheck

# 의존성 재설치
rm -rf node_modules package-lock.json
npm install
```

#### **성능 문제**
```javascript
// React DevTools Profiler 사용
// 불필요한 리렌더링 확인
// useMemo, useCallback 적절히 사용
```

#### **스타일링 문제**
```typescript
// MUI sx props 확인
// theme breakpoints 올바른 사용
// CSS-in-JS 우선순위 확인
```

---

## 📚 **리소스 및 참고 자료**

### **공식 문서**
- [React 18 Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Material-UI v5 Documentation](https://mui.com/)

### **내부 문서**
- `20250925_project_optimization.md` - 프로젝트 최적화 계획
- `20250925_system_architecture.md` - 시스템 아키텍처
- `20250925_workflow_guide.md` - 개발 워크플로우

### **유용한 도구**
- **React DevTools**: 컴포넌트 디버깅
- **TypeScript Playground**: 타입 테스트
- **MUI Theme Creator**: 테마 커스터마이징

---

## ⚠️ **주의사항 및 보안**

### **보안 가이드라인**
- JWT 토큰을 localStorage 대신 httpOnly 쿠키 사용 고려
- 사용자 입력 데이터 검증 철저히
- XSS 방지를 위한 입력 필터링
- 민감한 정보 환경 변수로 관리

### **성능 고려사항**
- 불필요한 리렌더링 방지
- 대용량 리스트에 가상화 적용
- 이미지 최적화 및 lazy loading
- Bundle splitting으로 초기 로드 시간 단축

---

*📅 최종 업데이트: 2025년 9월 25일*
*🎯 다음 업데이트: 개발 프로세스 개선 시*