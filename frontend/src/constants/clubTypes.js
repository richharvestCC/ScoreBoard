export const CLUB_TYPES = {
  GENERAL: 'general',
  PRO: 'pro',
  YOUTH: 'youth',
  NATIONAL: 'national'
};

export const CLUB_TYPE_LABELS = {
  [CLUB_TYPES.GENERAL]: '일반',
  [CLUB_TYPES.PRO]: '프로',
  [CLUB_TYPES.YOUTH]: '유스',
  [CLUB_TYPES.NATIONAL]: '국가대표'
};

export const CLUB_TYPE_COLORS = {
  [CLUB_TYPES.GENERAL]: 'default',
  [CLUB_TYPES.PRO]: 'primary',
  [CLUB_TYPES.YOUTH]: 'success',
  [CLUB_TYPES.NATIONAL]: 'secondary'
};

export const getClubTypeLabel = (type) => {
  return CLUB_TYPE_LABELS[type] || type;
};

export const getClubTypeColor = (type) => {
  return CLUB_TYPE_COLORS[type] || 'default';
};