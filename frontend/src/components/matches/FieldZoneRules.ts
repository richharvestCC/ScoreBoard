// 축구장 구역별 이벤트 규칙 정의
export interface ZoneRule {
  zonePattern: string[]; // 해당되는 구역들 (예: ['A1', 'A2'] 또는 ['ALL_A', 'ALL_M'])
  allowedEvents: string[]; // 허용되는 이벤트 타입들
  specialRules?: {
    [eventType: string]: {
      requiresPrevious?: string[]; // 선행 조건 (예: 반칙이 있어야 프리킥)
      hasToggle?: string[]; // 토글 옵션들 (예: 직접/간접, 홈/어웨이)
      requiresInput?: string[]; // 추가 입력 필요 (예: 선수, 시간)
    };
  };
}

// 이벤트 타입 정의
export interface EventTypeDefinition {
  id: string;
  name: string;
  color: string;
  icon: string;
  description: string;
}

// 모든 가능한 이벤트 타입들
export const ALL_EVENT_TYPES: EventTypeDefinition[] = [
  { id: 'goal', name: '득점', color: '#f44336', icon: '🥅', description: '득점 기록' },
  { id: 'assist', name: '도움', color: '#2196f3', icon: '🎯', description: '어시스트 (득점이 있어야 발생)' },
  { id: 'keypass', name: '기점', color: '#9c27b0', icon: '🔑', description: '키패스 (도움이 있어야 발생)' },
  { id: 'offside', name: '오프사이드', color: '#ff9800', icon: '🚩', description: '오프사이드 반칙' },
  { id: 'foul', name: '파울', color: '#795548', icon: '🚫', description: '파울 반칙' },
  { id: 'violation', name: '반칙', color: '#607d8b', icon: '⚠️', description: '기타 반칙 (반칙창 드롭다운)' },
  { id: 'freekick', name: '프리킥', color: '#4caf50', icon: '⚽', description: '프리킥 (반칙이 있어야 발생)' },
  { id: 'goal_line_out', name: '골라인 아웃', color: '#ff5722', icon: '📐', description: '골라인을 벗어남' },
  { id: 'corner_kick', name: '코너킥', color: '#e91e63', icon: '📐', description: '코너킥' },
  { id: 'touch_line_out', name: '터치라인 아웃', color: '#00bcd4', icon: '📏', description: '터치라인을 벗어남' },
  { id: 'substitution', name: '선수교체', color: '#8bc34a', icon: '🔄', description: '선수 교체' },
];

// 구역별 규칙 정의
export const ZONE_RULES: ZoneRule[] = [
  // 1. 모든 A, M, 1, 9 라인을 제외한 일반 구역
  {
    zonePattern: [
      'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8',
      'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8',
      'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8',
      'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8',
      'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8',
      'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8',
      'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8',
      'I2', 'I3', 'I4', 'I5', 'I6', 'I7', 'I8',
      'J2', 'J3', 'J4', 'J5', 'J6', 'J7', 'J8',
      'K2', 'K3', 'K4', 'K5', 'K6', 'K7', 'K8',
      'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8'
    ],
    allowedEvents: ['goal', 'assist', 'keypass', 'offside', 'foul', 'violation', 'freekick'],
    specialRules: {
      assist: { requiresPrevious: ['goal'] },
      keypass: { requiresPrevious: ['assist'] },
      violation: {
        hasToggle: ['warning', 'ejection', 'home', 'away'],
        requiresInput: ['player', 'violationType']
      },
      freekick: {
        requiresPrevious: ['violation'],
        hasToggle: ['direct', 'indirect'],
        requiresInput: ['player']
      }
    }
  },

  // 2. A라인 (홈팀 골라인)
  {
    zonePattern: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9'],
    allowedEvents: ['goal_line_out', 'corner_kick'],
    specialRules: {
      goal_line_out: {
        requiresInput: ['attacker', 'lastTouch']
      },
      corner_kick: {
        requiresInput: ['defender', 'lastTouch']
      }
    }
  },

  // 3. M라인 (어웨이팀 골라인)
  {
    zonePattern: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9'],
    allowedEvents: ['goal_line_out', 'corner_kick'],
    specialRules: {
      goal_line_out: {
        requiresInput: ['attacker', 'lastTouch']
      },
      corner_kick: {
        requiresInput: ['defender', 'lastTouch']
      }
    }
  },

  // 4. 터치라인 (1, 9 라인)
  {
    zonePattern: [
      'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1', 'J1', 'K1', 'L1',
      'B9', 'C9', 'D9', 'E9', 'F9', 'G9', 'H9', 'I9', 'J9', 'K9', 'L9'
    ],
    allowedEvents: ['touch_line_out']
  },

  // 5. 특수 코너킥 구역들
  {
    zonePattern: ['B2'], // A1,A2,A3 코너킥
    allowedEvents: ['corner_kick'],
    specialRules: {
      corner_kick: {
        requiresInput: ['kicker', 'timeCapture']
      }
    }
  },

  {
    zonePattern: ['L2'], // M1,M2,M3 코너킥
    allowedEvents: ['corner_kick'],
    specialRules: {
      corner_kick: {
        requiresInput: ['kicker', 'timeCapture']
      }
    }
  },

  {
    zonePattern: ['B8'], // A5,A6,A7 코너킥
    allowedEvents: ['corner_kick'],
    specialRules: {
      corner_kick: {
        requiresInput: ['kicker', 'timeCapture']
      }
    }
  },

  {
    zonePattern: ['L8'], // M5,M6,M7 코너킥
    allowedEvents: ['corner_kick'],
    specialRules: {
      corner_kick: {
        requiresInput: ['kicker', 'timeCapture']
      }
    }
  },

  // 6. 선수교체 구역
  {
    zonePattern: ['G9'], // 센터라인 사이드라인 교차점
    allowedEvents: ['substitution']
  }
];

// 구역에서 허용되는 이벤트 타입들을 가져오는 함수
export function getAllowedEventsForZone(zoneId: string): EventTypeDefinition[] {
  // 해당 구역에 적용되는 규칙 찾기
  const applicableRules = ZONE_RULES.filter(rule =>
    rule.zonePattern.includes(zoneId)
  );

  if (applicableRules.length === 0) {
    // 규칙이 없으면 기본 이벤트들 반환
    return ALL_EVENT_TYPES.filter(event =>
      ['goal', 'foul', 'violation', 'offside'].includes(event.id)
    );
  }

  // 모든 적용 가능한 규칙에서 허용된 이벤트들 수집
  const allowedEventIds = new Set<string>();
  applicableRules.forEach(rule => {
    rule.allowedEvents.forEach(eventId => {
      allowedEventIds.add(eventId);
    });
  });

  // 이벤트 정의 반환
  return ALL_EVENT_TYPES.filter(event => allowedEventIds.has(event.id));
}

// 특정 구역과 이벤트에 대한 특수 규칙 가져오기
export function getSpecialRulesForZoneEvent(zoneId: string, eventId: string) {
  const applicableRules = ZONE_RULES.filter(rule =>
    rule.zonePattern.includes(zoneId) &&
    rule.allowedEvents.includes(eventId)
  );

  for (const rule of applicableRules) {
    if (rule.specialRules && rule.specialRules[eventId]) {
      return rule.specialRules[eventId];
    }
  }

  return null;
}

// 후반전 여부에 따른 구역 변환 (A팀 ↔ M팀 사이드 교체)
export function getAdjustedZoneForHalfTime(zoneId: string, isSecondHalf: boolean): string {
  if (!isSecondHalf) return zoneId;

  // 후반전에는 A와 M을 교체
  if (zoneId.startsWith('A')) {
    return zoneId.replace('A', 'M');
  } else if (zoneId.startsWith('M')) {
    return zoneId.replace('M', 'A');
  }

  return zoneId;
}

// 이벤트 정의와 필요 조건을 포함한 확장된 인터페이스
export interface EventDefinition extends EventTypeDefinition {
  requiresPrevious?: string[]; // 선행 조건
}

// 이벤트 정의 확장 (필요 조건 포함)
const EVENT_DEFINITIONS: EventDefinition[] = [
  ...ALL_EVENT_TYPES.map(event => ({ ...event })),
  // 전제조건이 있는 이벤트들을 덮어쓰기
].map(event => {
  switch (event.id) {
    case 'assist':
      return { ...event, requiresPrevious: ['goal'] };
    case 'keypass':
      return { ...event, requiresPrevious: ['assist'] };
    case 'freekick':
      return { ...event, requiresPrevious: ['violation', 'foul'] }; // 반칙이나 파울이 있어야 프리킥
    case 'corner_kick':
      return { ...event, requiresPrevious: ['goal_line_out'] }; // 골라인 아웃이 있어야 코너킥
    default:
      return event;
  }
});

// 이벤트 정의 조회 함수
export const getEventDefinition = (eventId: string): EventDefinition | undefined => {
  return EVENT_DEFINITIONS.find(event => event.id === eventId);
};