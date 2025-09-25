# Codex Worklog - 2025-09-25

## ✅ 완료 사항
- `AGENTS.md` 생성 및 저장소 기준 가이드 문서화 (구조, 빌드/테스트 명령, 스타일/PR 규칙 포함).
- `.claude/claude.md` 내 노출된 GitHub Personal Access Token을 `<redacted>`로 치환.
- `AGENTS.md` 추가를 `docs: add repository guidelines` 커밋으로 기록.
- `frontend/claude.md`, `backend/claude.md`, `.claude/claude.md` 규칙 검토로 프론트·백엔드 및 공통 보안 지침 파악.

## 🔍 현재 파악된 컨텍스트
- 작업 브랜치: `feature/login-off` (로그인 우회 + UI 재디자인 기반).
- Phase 3 신규 기능은 보류, Material 3 테마와 UI 파운데이션 확립이 당면 과제.
- React Query v5 전환 미완료 상태 (`onSuccess`/`onError` 구버전 패턴 다수 존재).

## 🎯 다음 작업 우선순위 제안
1. **React Query v5 호환성 완전 마이그레이션**: 남아 있는 deprecated 콜백 제거 및 사이드 이펙트 정리.
2. **헤더·사이드바 인증 가드 정리**: 로그인 우회 상태에서도 네비게이션이 흔들리지 않도록 최소 의존성 유지.
3. **Material 3 테마 토큰 적용 검증**: 공통 컴포넌트에서 테마 토큰/글래스모피즘 스타일 활용 패턴을 확정.

## ⏱️ 예상 시간
- React Query v5 정비: 약 2시간.
- 레이아웃 인증 의존성 정리: 약 1시간.
- 테마 토큰 기반 기본 컴포넌트 검증: 약 1.5시간.

## 📝 참고
- `.claude/` 디렉터리는 `.gitignore` 되어 있지만, PAT는 GitHub 콘솔에서 즉시 폐기하는 것을 권장.
- 작업 기록은 `docs/YYYYMMDD-codex-work.md` 형식으로 지속 추가 예정.

## 🧱 진행 중 작업
- React Query v5 호환성 정리: `useMutation` 호출부 전반에서 `isPending`으로 상태 동기화하고 `queryClient.invalidateQueries({ queryKey })` 서식을 도입.
- UI 개발 모드 대비 헤더/사이드바 정비: `frontend/src/components/layout/Header.tsx`에서 `useAuth` 연동, UI Dev 배지 표시, 로그아웃 핸들러 추가. `Sidebar.tsx`는 사용자 네임/역할 표기를 모드에 맞게 보강.
- Material 3 페이지 컨테이너 기초: `frontend/src/components/layout/PageContainer.tsx` 신설 후 `TemplateManagement`와 `LiveMatchesPage`에 적용해 토큰 기반 레이아웃을 통일.

## ✅ 실행한 검증
- `frontend`: `npm run typecheck`
