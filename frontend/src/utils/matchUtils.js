// Match utility functions and constants

export const MATCH_TYPES = {
  practice: '연습경기',
  casual: '캐주얼',
  friendly: '친선경기',
  tournament: '토너먼트',
  a_friendly: 'A매치 친선',
  a_tournament: 'A매치 토너먼트'
};

export const MATCH_TYPE_COLORS = {
  practice: 'default',
  casual: 'primary',
  friendly: 'success',
  tournament: 'secondary',
  a_friendly: 'warning',
  a_tournament: 'error'
};

export const MATCH_STATUSES = {
  scheduled: '예정',
  in_progress: '진행중',
  completed: '완료',
  cancelled: '취소',
  postponed: '연기'
};

export const MATCH_STATUS_COLORS = {
  scheduled: 'info',
  in_progress: 'warning',
  completed: 'success',
  cancelled: 'error',
  postponed: 'default'
};

export const MATCH_STAGES = {
  group: '조별리그',
  round_of_16: '16강',
  quarter: '8강',
  semi: '준결승',
  final: '결승',
  regular_season: '정규시즌',
  playoff: '플레이오프'
};

export const EVENT_TYPES = {
  goal: '골',
  yellow_card: '옐로우카드',
  red_card: '레드카드',
  substitution: '교체',
  corner: '코너킥',
  penalty: '페널티',
  offside: '오프사이드',
  foul: '파울'
};

export const EVENT_ICONS = {
  goal: '⚽',
  yellow_card: '🟡',
  red_card: '🔴',
  substitution: '🔄',
  corner: '📐',
  penalty: '🎯',
  offside: '🚩',
  foul: '❌'
};

// Helper functions
export const getMatchTypeLabel = (type) => {
  return MATCH_TYPES[type] || type;
};

export const getMatchTypeColor = (type) => {
  return MATCH_TYPE_COLORS[type] || 'default';
};

export const getStatusLabel = (status) => {
  return MATCH_STATUSES[status] || status;
};

export const getStatusColor = (status) => {
  return MATCH_STATUS_COLORS[status] || 'default';
};

export const getStageLabel = (stage) => {
  return MATCH_STAGES[stage] || stage;
};

export const getEventTypeLabel = (type) => {
  return EVENT_TYPES[type] || type;
};

export const getEventIcon = (type) => {
  return EVENT_ICONS[type] || '📝';
};