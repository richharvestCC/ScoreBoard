/**
 * 접근성(A11Y) 유틸리티 함수들
 */

/**
 * 스크린 리더를 위한 시맨틱 라벨 생성
 * @param {string} action - 액션 타입 (예: 'search', 'filter', 'create')
 * @param {string} target - 대상 (예: 'club', 'match', 'competition')
 * @returns {string} 적절한 ARIA 라벨
 */
export function generateAriaLabel(action, target) {
  const actionLabels = {
    search: '검색',
    filter: '필터링',
    create: '생성',
    edit: '수정',
    delete: '삭제',
    view: '보기',
    sort: '정렬'
  };

  const targetLabels = {
    club: '클럽',
    match: '경기',
    competition: '대회',
    tournament: '토너먼트',
    user: '사용자',
    team: '팀'
  };

  const actionLabel = actionLabels[action] || action;
  const targetLabel = targetLabels[target] || target;

  return `${targetLabel} ${actionLabel}`;
}

/**
 * 키보드 네비게이션을 위한 핸들러
 * @param {Function} callback - 실행할 콜백 함수
 * @returns {Function} 키보드 이벤트 핸들러
 */
export function handleKeyboardActivation(callback) {
  return (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback(event);
    }
  };
}

/**
 * 폼 필드 오류에 대한 접근성 속성 생성
 * @param {string} fieldName - 필드 이름
 * @param {boolean} hasError - 오류 여부
 * @param {string} errorMessage - 오류 메시지
 * @returns {Object} 접근성 속성 객체
 */
export function getFieldAccessibilityProps(fieldName, hasError, errorMessage) {
  const baseProps = {
    id: fieldName,
    name: fieldName,
    'aria-required': 'true',
  };

  if (hasError && errorMessage) {
    return {
      ...baseProps,
      'aria-invalid': 'true',
      'aria-describedby': `${fieldName}-error`,
      'aria-errormessage': errorMessage
    };
  }

  return {
    ...baseProps,
    'aria-invalid': 'false'
  };
}

/**
 * 로딩 상태에 대한 접근성 속성
 * @param {boolean} isLoading - 로딩 여부
 * @param {string} loadingText - 로딩 텍스트
 * @returns {Object} 로딩 상태 접근성 속성
 */
export function getLoadingAccessibilityProps(isLoading, loadingText = '데이터를 불러오는 중입니다') {
  if (!isLoading) return {};

  return {
    'aria-busy': 'true',
    'aria-live': 'polite',
    'aria-label': loadingText,
    role: 'status'
  };
}

/**
 * 목록 아이템에 대한 접근성 속성
 * @param {number} index - 아이템 인덱스
 * @param {number} total - 전체 아이템 개수
 * @param {string} itemType - 아이템 타입
 * @returns {Object} 목록 아이템 접근성 속성
 */
export function getListItemAccessibilityProps(index, total, itemType = '항목') {
  return {
    role: 'listitem',
    'aria-posinset': index + 1,
    'aria-setsize': total,
    'aria-label': `${index + 1}번째 ${itemType}, 총 ${total}개 중`
  };
}

/**
 * 버튼 상태에 따른 접근성 속성
 * @param {boolean} isDisabled - 비활성화 여부
 * @param {boolean} isPressed - 눌린 상태 여부 (토글 버튼용)
 * @param {string} description - 버튼 설명
 * @returns {Object} 버튼 접근성 속성
 */
export function getButtonAccessibilityProps(isDisabled = false, isPressed = null, description = '') {
  const props = {
    'aria-disabled': isDisabled.toString()
  };

  if (isPressed !== null) {
    props['aria-pressed'] = isPressed.toString();
  }

  if (description) {
    props['aria-describedby'] = `${description}-desc`;
  }

  return props;
}

/**
 * 검색 결과에 대한 접근성 알림
 * @param {number} resultCount - 결과 개수
 * @param {string} searchTerm - 검색어
 * @returns {string} 검색 결과 알림 텍스트
 */
export function getSearchResultAnnouncement(resultCount, searchTerm = '') {
  if (resultCount === 0) {
    return searchTerm ?
      `"${searchTerm}"에 대한 검색 결과가 없습니다.` :
      '검색 결과가 없습니다.';
  }

  return searchTerm ?
    `"${searchTerm}"에 대한 검색 결과 ${resultCount}개를 찾았습니다.` :
    `총 ${resultCount}개의 결과를 찾았습니다.`;
}

/**
 * 페이지네이션 네비게이션 레이블
 * @param {number} currentPage - 현재 페이지
 * @param {number} totalPages - 전체 페이지 수
 * @returns {Object} 페이지네이션 접근성 속성
 */
export function getPaginationAccessibilityProps(currentPage, totalPages) {
  return {
    role: 'navigation',
    'aria-label': '페이지 네비게이션',
    'aria-current': 'page',
    'aria-description': `현재 ${currentPage}페이지, 총 ${totalPages}페이지 중`
  };
}

/**
 * 모달/다이얼로그 접근성 속성
 * @param {string} modalTitle - 모달 제목
 * @param {string} modalId - 모달 ID
 * @returns {Object} 모달 접근성 속성
 */
export function getModalAccessibilityProps(modalTitle, modalId) {
  return {
    role: 'dialog',
    'aria-modal': 'true',
    'aria-labelledby': `${modalId}-title`,
    'aria-describedby': `${modalId}-description`,
    'aria-label': modalTitle
  };
}