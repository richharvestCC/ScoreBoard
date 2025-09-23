/**
 * SVGTournamentBracket - SVG-based Tournament Bracket Rendering Engine
 * Material Design 3 + React 18 + TypeScript
 */

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { Box, useTheme, Typography, Paper } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  Tournament,
  Match,
  Team,
  BracketDimensions,
  TournamentBracketProps
} from '../../../../types/tournament';
import { useResponsive } from '../shared/ResponsiveLayout';
import ZoomPanContainer from './ZoomPanContainer';

// Constants
const MATCH_WIDTH = 200;
const MATCH_HEIGHT = 60;
const ROUND_SPACING = 250;
const MATCH_SPACING = 80;
const CONNECTOR_OFFSET = 30;

// Styled Components
const BracketContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  position: 'relative',
  background: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius
}));

const SVGCanvas = styled('svg')(({ theme }) => ({
  width: '100%',
  height: '100%',
  display: 'block',
  background: 'transparent'
}));

const MatchCard = styled('foreignObject')<{ isWinner?: boolean; isEmpty?: boolean }>(
  ({ theme, isWinner, isEmpty }) => ({
    '& > div': {
      width: '100%',
      height: '100%',
      background: isEmpty
        ? alpha(theme.palette.surface?.containerLow || theme.palette.background.paper, 0.3)
        : alpha(theme.palette.surface?.container || theme.palette.background.paper, 0.9),
      backdropFilter: 'blur(10px)',
      border: `1px solid ${
        isWinner
          ? theme.palette.primary.main
          : alpha(theme.palette.divider, 0.12)
      }`,
      borderRadius: theme.shape.borderRadius,
      padding: theme.spacing(1),
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      cursor: isEmpty ? 'default' : 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',

      '&:hover': isEmpty ? {} : {
        background: alpha(theme.palette.surface?.containerHigh || theme.palette.background.paper, 0.95),
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[4]
      }
    }
  })
);

const TeamRow = styled(Box)<{ isWinner?: boolean }>(({ theme, isWinner }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius / 2,
  background: isWinner
    ? alpha(theme.palette.primary.main, 0.1)
    : 'transparent',
  border: isWinner
    ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
    : '1px solid transparent',
  marginBottom: theme.spacing(0.5),

  '&:last-child': {
    marginBottom: 0
  }
}));

const ConnectorLine = styled('line')(({ theme }) => ({
  stroke: theme.palette.divider,
  strokeWidth: 2,
  fill: 'none'
}));

const ConnectorPath = styled('path')(({ theme }) => ({
  stroke: theme.palette.divider,
  strokeWidth: 2,
  fill: 'none'
}));

// Utility Functions
const calculateBracketDimensions = (teamCount: number): BracketDimensions => {
  const rounds = Math.ceil(Math.log2(teamCount));
  const totalMatches = teamCount - 1;
  const maxMatchesInRound = Math.ceil(teamCount / 2);

  return {
    width: rounds * ROUND_SPACING + MATCH_WIDTH + 100,
    height: maxMatchesInRound * (MATCH_HEIGHT + MATCH_SPACING) + 100,
    rounds,
    matchHeight: MATCH_HEIGHT,
    matchWidth: MATCH_WIDTH,
    roundSpacing: ROUND_SPACING,
    matchSpacing: MATCH_SPACING
  };
};

const generateBracketStructure = (tournament: Tournament, matches: Match[]) => {
  const rounds: Match[][] = [];
  const teamCount = tournament.teamCount;
  const totalRounds = Math.ceil(Math.log2(teamCount));

  for (let round = 1; round <= totalRounds; round++) {
    const roundMatches = matches.filter(match => match.round === round);
    rounds.push(roundMatches);
  }

  return rounds;
};

const getMatchPosition = (
  roundIndex: number,
  matchIndex: number,
  totalMatches: number,
  dimensions: BracketDimensions
) => {
  const x = roundIndex * dimensions.roundSpacing + 50;
  const totalHeight = dimensions.height - 100;
  const spacing = totalHeight / (totalMatches + 1);
  const y = spacing * (matchIndex + 1) - dimensions.matchHeight / 2;

  return { x, y };
};

// Interface for match interaction
interface MatchComponentProps {
  match: Match;
  x: number;
  y: number;
  onMatchClick: (match: Match) => void;
  isResponsive: boolean;
}

const MatchComponent: React.FC<MatchComponentProps> = ({
  match,
  x,
  y,
  onMatchClick,
  isResponsive
}) => {
  const theme = useTheme();
  const isEmpty = !match.team1 && !match.team2;

  const handleClick = useCallback(() => {
    if (!isEmpty) {
      onMatchClick(match);
    }
  }, [match, onMatchClick, isEmpty]);

  return (
    <MatchCard
      x={x}
      y={y}
      width={MATCH_WIDTH}
      height={MATCH_HEIGHT}
      isEmpty={isEmpty}
      isWinner={!!match.winner}
    >
      <Box onClick={handleClick}>
        {isEmpty ? (
          <Typography
            variant="caption"
            color="text.disabled"
            textAlign="center"
          >
            대기 중
          </Typography>
        ) : (
          <>
            {match.team1 && (
              <TeamRow isWinner={match.winner?.id === match.team1.id}>
                <Typography
                  variant={isResponsive ? "caption" : "body2"}
                  sx={{
                    fontWeight: match.winner?.id === match.team1.id ? 600 : 400,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '70%'
                  }}
                >
                  {match.team1.name}
                </Typography>
                <Typography
                  variant={isResponsive ? "caption" : "body2"}
                  sx={{
                    fontWeight: match.winner?.id === match.team1.id ? 600 : 400,
                    color: match.score1 !== undefined ? 'text.primary' : 'text.disabled'
                  }}
                >
                  {match.score1 ?? '-'}
                </Typography>
              </TeamRow>
            )}

            {match.team2 && (
              <TeamRow isWinner={match.winner?.id === match.team2.id}>
                <Typography
                  variant={isResponsive ? "caption" : "body2"}
                  sx={{
                    fontWeight: match.winner?.id === match.team2.id ? 600 : 400,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '70%'
                  }}
                >
                  {match.team2.name}
                </Typography>
                <Typography
                  variant={isResponsive ? "caption" : "body2"}
                  sx={{
                    fontWeight: match.winner?.id === match.team2.id ? 600 : 400,
                    color: match.score2 !== undefined ? 'text.primary' : 'text.disabled'
                  }}
                >
                  {match.score2 ?? '-'}
                </Typography>
              </TeamRow>
            )}
          </>
        )}
      </Box>
    </MatchCard>
  );
};

// Main Component
const SVGTournamentBracket: React.FC<TournamentBracketProps> = ({
  tournament,
  matches,
  onMatchUpdate,
  zoomEnabled = true,
  onZoomChange
}) => {
  const theme = useTheme();
  const { config } = useResponsive();
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  // Calculate bracket dimensions
  const dimensions = useMemo(
    () => calculateBracketDimensions(tournament.teamCount),
    [tournament.teamCount]
  );

  // Generate bracket structure
  const bracketRounds = useMemo(
    () => generateBracketStructure(tournament, matches),
    [tournament, matches]
  );

  // Responsive scaling
  const scale = useMemo(() => {
    switch (config.device) {
      case 'tablet-portrait':
        return 0.7;
      case 'tablet-landscape':
        return 0.85;
      default:
        return 1.0;
    }
  }, [config.device]);

  // Match click handler
  const handleMatchClick = useCallback((match: Match) => {
    setSelectedMatch(match);
    // Future: Open match edit modal
  }, []);

  // Generate connector lines between matches
  const renderConnectors = useCallback(() => {
    const connectors: JSX.Element[] = [];

    bracketRounds.forEach((round, roundIndex) => {
      if (roundIndex === bracketRounds.length - 1) return; // Skip final round

      round.forEach((match, matchIndex) => {
        const currentPos = getMatchPosition(
          roundIndex,
          matchIndex,
          round.length,
          dimensions
        );

        // Find next round match
        const nextRoundMatchIndex = Math.floor(matchIndex / 2);
        const nextRound = bracketRounds[roundIndex + 1];

        if (nextRound && nextRound[nextRoundMatchIndex]) {
          const nextPos = getMatchPosition(
            roundIndex + 1,
            nextRoundMatchIndex,
            nextRound.length,
            dimensions
          );

          const startX = currentPos.x + MATCH_WIDTH;
          const startY = currentPos.y + MATCH_HEIGHT / 2;
          const endX = nextPos.x;
          const endY = nextPos.y + MATCH_HEIGHT / 2;
          const midX = startX + CONNECTOR_OFFSET;

          connectors.push(
            <ConnectorPath
              key={`connector-${roundIndex}-${matchIndex}`}
              d={`M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`}
            />
          );
        }
      });
    });

    return connectors;
  }, [bracketRounds, dimensions]);

  // Zoom change handler
  const handleZoomChange = useCallback((newZoom: number) => {
    onZoomChange?.(newZoom);
  }, [onZoomChange]);

  return (
    <BracketContainer>
      {zoomEnabled ? (
        <ZoomPanContainer
          initialZoom={scale}
          onZoomChange={handleZoomChange}
          enableGestures={config.isTouchDevice || config.device !== 'mobile'}
          showControls={config.device === 'desktop'}
          showSlider={config.device === 'desktop'}
          bounds={{
            minX: -dimensions.width * 0.5,
            maxX: dimensions.width * 0.5,
            minY: -dimensions.height * 0.5,
            maxY: dimensions.height * 0.5
          }}
        >
          <SVGCanvas
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            preserveAspectRatio="xMidYMid meet"
          >
        {/* Render connectors */}
        <g className="connectors">
          {renderConnectors()}
        </g>

        {/* Render matches */}
        <g className="matches">
          {bracketRounds.map((round, roundIndex) =>
            round.map((match, matchIndex) => {
              const position = getMatchPosition(
                roundIndex,
                matchIndex,
                round.length,
                dimensions
              );

              return (
                <MatchComponent
                  key={`match-${match.id}`}
                  match={match}
                  x={position.x}
                  y={position.y}
                  onMatchClick={handleMatchClick}
                  isResponsive={config.device !== 'desktop'}
                />
              );
            })
          )}
        </g>

        {/* Round labels */}
        <g className="round-labels">
          {bracketRounds.map((round, roundIndex) => (
            <text
              key={`round-label-${roundIndex}`}
              x={roundIndex * ROUND_SPACING + 50 + MATCH_WIDTH / 2}
              y={30}
              textAnchor="middle"
              fill={theme.palette.text.secondary}
              fontSize={config.device === 'desktop' ? '14' : '12'}
              fontFamily={theme.typography.fontFamily}
            >
              {roundIndex === bracketRounds.length - 1
                ? '결승'
                : `${Math.pow(2, bracketRounds.length - roundIndex - 1)}강`}
            </text>
          ))}
        </g>
          </SVGCanvas>
        </ZoomPanContainer>
      ) : (
        <SVGCanvas
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          preserveAspectRatio="xMidYMid meet"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left'
          }}
        >
          {/* Render connectors */}
          <g className="connectors">
            {renderConnectors()}
          </g>

          {/* Render matches */}
          <g className="matches">
            {bracketRounds.map((round, roundIndex) =>
              round.map((match, matchIndex) => {
                const position = getMatchPosition(
                  roundIndex,
                  matchIndex,
                  round.length,
                  dimensions
                );

                return (
                  <MatchComponent
                    key={`match-${match.id}`}
                    match={match}
                    x={position.x}
                    y={position.y}
                    onMatchClick={handleMatchClick}
                    isResponsive={config.device !== 'desktop'}
                  />
                );
              })
            )}
          </g>

          {/* Round labels */}
          <g className="round-labels">
            {bracketRounds.map((round, roundIndex) => (
              <text
                key={`round-label-${roundIndex}`}
                x={roundIndex * ROUND_SPACING + 50 + MATCH_WIDTH / 2}
                y={30}
                textAnchor="middle"
                fill={theme.palette.text.secondary}
                fontSize={config.device === 'desktop' ? '14' : '12'}
                fontFamily={theme.typography.fontFamily}
              >
                {roundIndex === bracketRounds.length - 1
                  ? '결승'
                  : `${Math.pow(2, bracketRounds.length - roundIndex - 1)}강`}
              </text>
            ))}
          </g>
        </SVGCanvas>
      )}

      {/* Bracket info overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          background: alpha(theme.palette.surface?.container || theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          padding: 2,
          border: `1px solid ${alpha(theme.palette.divider, 0.12)}`
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {tournament.title}
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          {tournament.teamCount}팀 토너먼트
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {dimensions.rounds}라운드
        </Typography>
      </Box>
    </BracketContainer>
  );
};

export default SVGTournamentBracket;