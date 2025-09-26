import React, { useMemo, useRef } from 'react';
import { Box } from '@mui/material';

export interface FieldZone {
  id: string;
  name: string;
  gridX: number; // 0-12 (13개 열)
  gridY: number; // 0-8 (9개 행)
  bounds: {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
  };
}

export interface FieldClick {
  x: number;
  y: number;
  zone: FieldZone;
}

// grid.png 기반 117개 구역 (13x9 그리드, 각 격자는 정사각형)
const generateGridZones = (): FieldZone[] => {
  const zones: FieldZone[] = [];
  const cols = 13; // 가로 13개
  const rows = 9; // 세로 9개

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // 19:12 비율의 190x120 공간에 13x9 격자를 전체 영역에 맞춤
      const gridWidth = 190; // viewBox 전체 너비
      const gridHeight = 120; // viewBox 전체 높이
      const offsetX = 0; // 전체 영역 사용
      const offsetY = 0; // 전체 영역 사용

      const x1 = offsetX + (col / cols) * gridWidth;
      const x2 = offsetX + ((col + 1) / cols) * gridWidth;
      const y1 = offsetY + (row / rows) * gridHeight;
      const y2 = offsetY + ((row + 1) / rows) * gridHeight;

      // 구역 이름 생성 (예: A1, B1, ... M9)
      const colName = String.fromCharCode(65 + col); // A, B, C, ... M (13개)
      const rowName = (row + 1).toString(); // 1, 2, 3, ..., 9

      zones.push({
        id: `${colName}${rowName}`,
        name: `${colName}${rowName} 구역`,
        gridX: col,
        gridY: row,
        bounds: { x1, x2, y1, y2 }
      });
    }
  }

  return zones;
};

const GRID_ZONES = generateGridZones();

export interface InteractiveFieldProps {
  onZoneClick: (click: FieldClick) => void;
  variant?: 'futsal' | 'soccer';
}

function findZone(zones: FieldZone[], x: number, y: number): FieldZone {
  const zone = zones.find((candidate) =>
    x >= candidate.bounds.x1 &&
    x < candidate.bounds.x2 &&
    y >= candidate.bounds.y1 &&
    y < candidate.bounds.y2,
  );

  return (
    zone ?? {
      id: 'center-circle',
      name: '센터 서클',
      gridX: 2,
      gridY: 6,
      bounds: { x1: 40, x2: 60, y1: 45, y2: 55 },
    }
  );
}

export const InteractiveField: React.FC<InteractiveFieldProps> = ({ onZoneClick, variant = 'soccer' }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const zones = useMemo(() => {
    // 이제 항상 GRID_ZONES 사용 (variant는 향후 확장용)
    return GRID_ZONES;
  }, []);

  const handleClick = (event: React.MouseEvent<SVGSVGElement>) => {
    const boundingRect = event.currentTarget.getBoundingClientRect();
    const relativeX = ((event.clientX - boundingRect.left) / boundingRect.width) * 190; // viewBox 좌표계
    const relativeY = ((event.clientY - boundingRect.top) / boundingRect.height) * 120; // viewBox 좌표계
    const zone = findZone(zones, relativeX, relativeY);

    // 백분율로 변환 (이벤트 로그용)
    const percentX = (relativeX / 190) * 100;
    const percentY = (relativeY / 120) * 100;

    onZoneClick({
      x: Number(percentX.toFixed(2)),
      y: Number(percentY.toFixed(2)),
      zone,
    });
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: '19 / 12', // MuiBox-root css-1i9isb5 비율에 맞춤
        borderRadius: 0,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
        boxShadow: (theme) => theme.shadows[2],
        // pitch.png를 배경으로 사용
        backgroundImage: 'url(/images/pitch.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <svg
        viewBox="0 0 190 120"
        width="100%"
        height="100%"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1,
          pointerEvents: 'none', // SVG 자체는 클릭 불가
        }}
      >
        {/* 격자 구역들 (grid.png 패턴) */}
        {zones.map((zone) => {
          // 체스보드 패턴 계산 (grid.png처럼)
          const isEvenRow = zone.gridY % 2 === 0;
          const isEvenCol = zone.gridX % 2 === 0;
          const isLightSquare = (isEvenRow && isEvenCol) || (!isEvenRow && !isEvenCol);

          return (
            <rect
              key={zone.id}
              x={zone.bounds.x1}
              y={zone.bounds.y1}
              width={zone.bounds.x2 - zone.bounds.x1}
              height={zone.bounds.y2 - zone.bounds.y1}
              fill={isLightSquare ? 'rgba(200, 230, 200, 0.3)' : 'rgba(220, 200, 220, 0.3)'}
              stroke="rgba(255, 255, 255, 0.5)"
              strokeWidth="0.2"
              data-zone={zone.id}
              onMouseEnter={(e) => {
                e.currentTarget.style.fill = 'rgba(255, 255, 0, 0.4)';
              }}
              onMouseLeave={(e) => {
                const isLightSquare = (zone.gridY % 2 === 0 && zone.gridX % 2 === 0) ||
                                    (zone.gridY % 2 === 1 && zone.gridX % 2 === 1);
                e.currentTarget.style.fill = isLightSquare ? 'rgba(200, 230, 200, 0.3)' : 'rgba(220, 200, 220, 0.3)';
              }}
              onClick={(e) => {
                e.stopPropagation();

                // 구역 중심점 계산
                const centerX = (zone.bounds.x1 + zone.bounds.x2) / 2;
                const centerY = (zone.bounds.y1 + zone.bounds.y2) / 2;

                // 백분율로 변환
                const percentX = (centerX / 190) * 100;
                const percentY = (centerY / 120) * 100;

                onZoneClick({
                  x: Number(percentX.toFixed(2)),
                  y: Number(percentY.toFixed(2)),
                  zone,
                });
              }}
              style={{
                cursor: 'crosshair',
                transition: 'fill 0.2s ease',
                pointerEvents: 'auto', // 각 rect는 클릭 가능
              }}
            />
          );
        })}

        {/* 디버그용 그리드 라인 (필요시 주석 해제) */}
        {/* 세로선 */}
        {/*
        {Array.from({ length: 7 }, (_, i) => (
          <line
            key={`v-${i}`}
            x1={(i / 6) * 100}
            y1={0}
            x2={(i / 6) * 100}
            y2={100}
            stroke="rgba(255, 0, 0, 0.3)"
            strokeWidth="0.2"
          />
        ))}
        */}
        {/* 가로선 */}
        {/*
        {Array.from({ length: 13 }, (_, i) => (
          <line
            key={`h-${i}`}
            x1={0}
            y1={(i / 12) * 100}
            x2={100}
            y2={(i / 12) * 100}
            stroke="rgba(255, 0, 0, 0.3)"
            strokeWidth="0.2"
          />
        ))}
        */}
      </svg>
    </Box>
  );
};

export default InteractiveField;
