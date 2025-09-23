# Development Technical Debts

**프로젝트**: ScoreBoard
**생성일**: 2025-09-23
**마지막 업데이트**: 2025-09-23

## 📊 개요

이 문서는 ScoreBoard 프로젝트의 기술부채를 체계적으로 관리하기 위해 작성되었습니다.

### 🎯 해결된 Critical Issues (2025-09-23)
- ✅ **UUID 패키지 의존성 충돌** (package.json vs package-lock.json)
- ✅ **XSS 보안 취약점** (CSP unsafe-inline, case-sensitive detection)
- ✅ **TypeScript 타입 안전성** (Express any types, correlation ID 전파)
- ✅ **구조화된 로깅 시스템** (console.log → structured logging)

---

## 🔴 Critical Debts (즉시 해결 필요)

### 1. Frontend JavaScript → TypeScript 마이그레이션
**파일들**:
- `frontend/src/hooks/useAuth.js`
- `frontend/src/stores/authStore.js`
- `frontend/src/utils/formHelpers.js`
- `frontend/src/utils/matchUtils.js`
- `frontend/src/constants/clubTypes.js`
- `frontend/src/components/**/*.jsx` (다수)
- `frontend/src/pages/**/*.jsx` (다수)

**문제점**:
- 타입 안전성 부족으로 런타임 오류 가능성
- IDE 지원 제한 (자동완성, 리팩토링 등)
- 코드 품질 및 유지보수성 저하

**영향도**: High
**예상 소요시간**: 2-3일
**우선순위**: P0

### 2. 혼재된 로깅 시스템
**파일들**:
- `backend/src/controllers/tournamentController.js` (console.error 다수)
- `backend/src/middleware/auth.js:47` (console.error)
- `backend/src/services/matchStatisticsService.js:605` (console.warn)

**문제점**:
- 일부 파일에서 여전히 console.* 사용
- 구조화된 로깅과 혼재되어 일관성 부족
- 프로덕션 환경에서 로그 추적 어려움

**영향도**: Medium
**예상 소요시간**: 1일
**우선순위**: P1

### 3. Navigation 시스템 불일치
**파일들**:
- `frontend/src/hooks/useTypedNavigation.ts` (완전한 타입 시스템)
- `frontend/src/components/layout/Header.jsx` (일부만 적용)
- 기타 컴포넌트들 (아직 useNavigate 직접 사용)

**문제점**:
- 새로운 타입 안전 navigation 시스템이 프로젝트 전체에 적용되지 않음
- 일관성 없는 navigation 패턴

**영향도**: Medium
**예상 소요시간**: 1일
**우선순위**: P1

---

## 🟡 Important Debts (단기간 내 해결)

### 4. 테스트 커버리지 부족
**현황**:
- Unit tests: 거의 없음
- Integration tests: 없음
- E2E tests: 없음

**문제점**:
- 코드 변경 시 side effect 검증 불가
- 리팩토링 안전성 부족
- CI/CD 파이프라인에서 품질 검증 불가

**영향도**: High
**예상 소요시간**: 1주
**우선순위**: P2

### 5. API 에러 처리 일관성 부족
**파일들**:
- `backend/src/controllers/*.js` (다양한 에러 처리 패턴)
- `backend/src/utils/errors.js` (표준화된 에러 클래스 존재하지만 일관성 없는 사용)

**문제점**:
- 에러 응답 형식이 컨트롤러마다 다름
- 클라이언트에서 에러 처리 예측 어려움

**영향도**: Medium
**예상 소요시간**: 2일
**우선순위**: P2

### 6. 환경 설정 관리
**파일들**:
- `backend/.env` (누락된 변수들)
- `frontend/.env` (개발/프로덕션 분리 부족)

**문제점**:
- 환경별 설정 관리 체계화 필요
- Docker 환경 설정 부족
- CI/CD 환경 변수 관리 필요

**영향도**: Medium
**예상 소요시간**: 1일
**우선순위**: P2

---

## 🟢 Minor Debts (여유 있을 때 해결)

### 7. 코드 스타일 표준화
**문제점**:
- ESLint/Prettier 설정 프로젝트 전체 적용 필요
- 일관되지 않은 코딩 컨벤션

**영향도**: Low
**예상 소요시간**: 1일
**우선순위**: P3

### 8. 성능 최적화
**잠재적 개선사항**:
- React 컴포넌트 memo화
- 이미지 최적화
- Bundle 크기 최적화
- Database 쿼리 최적화 (일부는 해결됨)

**영향도**: Low
**예상 소요시간**: 2-3일
**우선순위**: P3

### 9. 문서화 개선
**필요사항**:
- API 문서 자동화 (Swagger/OpenAPI)
- 컴포넌트 문서화 (Storybook)
- 개발자 온보딩 가이드

**영향도**: Low
**예상 소요시간**: 3일
**우선순위**: P3

---

## 📚 Architecture Debts (장기 계획)

### 10. 모노레포 구조 개선
**현재 구조**:
```
ScoreBoard/
├── frontend/     # React 앱
├── backend/      # Express API
└── shared/       # 공통 타입 정의 부족
```

**개선 방향**:
- 공통 타입 정의 패키지
- 공통 유틸리티 라이브러리
- 빌드 시스템 통합

### 11. 마이크로서비스 분리 고려
**현재**: 모놀리식 백엔드
**향후 고려사항**:
- 인증 서비스 분리
- 매치/토너먼트 서비스 분리
- 알림 서비스 분리

### 12. 실시간 기능 확장
**현재**: 기본적인 Socket.io 구현
**개선 필요**:
- 실시간 스코어 업데이트
- 실시간 채팅
- 라이브 통계 업데이트

---

## 🎯 우선순위 로드맵

### Week 1-2 (Critical & Important)
1. **Frontend TypeScript 마이그레이션** (P0)
2. **로깅 시스템 통일** (P1)
3. **Navigation 시스템 일관성** (P1)

### Week 3-4 (Important)
4. **테스트 커버리지 확보** (P2)
5. **API 에러 처리 표준화** (P2)
6. **환경 설정 체계화** (P2)

### Week 5+ (Minor & Architecture)
7. **코드 스타일 표준화** (P3)
8. **성능 최적화** (P3)
9. **문서화 개선** (P3)
10. **아키텍처 개선** (장기)

---

## 📈 메트릭스

### 기술부채 추적
- **Total Debts**: 12개
- **Critical**: 3개
- **Important**: 3개
- **Minor**: 3개
- **Architecture**: 3개

### 해결 현황 (2025-09-23 기준)
- **해결 완료**: 4개 (UUID, XSS, TypeScript, Logging 일부)
- **진행 중**: 0개
- **대기 중**: 12개

---

## 🔄 업데이트 이력

### 2025-09-23
- ✅ Critical Issues 4개 해결 완료
  - UUID 패키지 의존성 충돌 수정
  - XSS 보안 취약점 해결 (CSP, case-sensitivity)
  - TypeScript 타입 안전성 개선 (correlation ID, Express types)
  - 구조화된 로깅 시스템 일부 적용
- 📝 DevDebts.md 문서 최초 생성
- 🧹 브랜치 정리 및 main-develop 동기화 완료

---

## 📝 참고 문서

- [N+1 Query Optimization Report](./claudedocs/n1_query_optimization_report.md)
- [XSS Protection Implementation](./claudedocs/xss_protection_implementation.md)
- [TypeScript Improvements](./claudedocs/typescript_improvements.md)
- [Navigation Improvements Report](./claudedocs/navigation_improvements.md)
- [Logging Documentation](./backend/LOGGING.md)

---

**💡 Note**: 이 문서는 지속적으로 업데이트되며, 새로운 기술부채 발견 시 즉시 추가해야 합니다.