import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Switch,
  TextField,
  ThemeProvider,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import ShuffleOutlinedIcon from '@mui/icons-material/ShuffleOutlined';
import tournamentTheme from '../../theme/tournamentTheme';

type KnockoutSeriesFormat = 'single' | 'twoLeg' | 'bestOf3' | 'bestOf5';

type BaseTeam = {
  id: number;
  name: string;
};

type GroupedTeam = BaseTeam & {
  group: string;
  groupRank: number;
};

type SeededTeam = GroupedTeam & {
  seedLabel: string;
  seedRank: number;
};

type MatchSlot =
  | { type: 'team'; label: string; detail?: string; teamId: number }
  | { type: 'winner'; label: string; detail: string }
  | { type: 'bye'; label: string };

type BracketMatch = {
  id: string;
  roundIndex: number;
  slots: [MatchSlot, MatchSlot];
  format: KnockoutSeriesFormat;
};

type BracketRound = {
  id: string;
  name: string;
  matches: BracketMatch[];
};

type GroupAssignments = Record<string, GroupedTeam[]>;

type FormatOptions = {
  base: KnockoutSeriesFormat;
  semifinal: KnockoutSeriesFormat;
  final: KnockoutSeriesFormat;
};

const MIN_PARTICIPANTS = 4;
const MAX_PARTICIPANTS = 32;
const MIN_GROUPS = 2;
const MAX_GROUPS = 8;
const MIN_PROMOTION = 1;
const MAX_PROMOTION = 4;

const formatLabels: Record<KnockoutSeriesFormat, string> = {
  single: '단판 경기',
  twoLeg: '2-Leg Aggregate',
  bestOf3: 'Best of 3',
  bestOf5: 'Best of 5',
};

const createInitialTeams = (count: number): BaseTeam[] =>
  Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `팀 ${index + 1}`,
  }));

const createGroupLabels = (count: number): string[] =>
  Array.from({ length: count }, (_, index) => String.fromCharCode(65 + index));

const distributeIntoGroups = (
  teams: BaseTeam[],
  enabled: boolean,
  groupCount: number
): GroupAssignments => {
  if (!enabled || groupCount < MIN_GROUPS) {
    return {};
  }

  const labels = createGroupLabels(groupCount);
  const assignments: GroupAssignments = Object.fromEntries(
    labels.map((label) => [label, [] as GroupedTeam[]])
  );

  teams.forEach((team, index) => {
    const group = labels[index % labels.length];
    const groupRank = Math.floor(index / labels.length) + 1;
    assignments[group].push({ ...team, group, groupRank });
  });

  return assignments;
};

const computeSeededTeams = (
  teams: BaseTeam[],
  groupAssignments: GroupAssignments,
  promotionPerGroup: number,
  useGroupStage: boolean
): SeededTeam[] => {
  if (useGroupStage && Object.keys(groupAssignments).length > 0) {
    const sortedGroups = Object.entries(groupAssignments).sort(([a], [b]) =>
      a.localeCompare(b)
    );
    const seeded: SeededTeam[] = [];

    sortedGroups.forEach(([group, groupTeams]) => {
      const ranked = [...groupTeams].sort((a, b) => a.groupRank - b.groupRank);
      for (let index = 0; index < promotionPerGroup; index += 1) {
        const team = ranked[index];
        if (!team) {
          break;
        }
        seeded.push({
          ...team,
          seedLabel: `${group}${index + 1}`,
          seedRank: seeded.length + 1,
        });
      }
    });

    return seeded;
  }

  return teams.map((team, index) => ({
    ...team,
    group: 'Seed',
    groupRank: index + 1,
    seedLabel: `S${index + 1}`,
    seedRank: index + 1,
  }));
};

const roundNameForIndex = (
  roundIndex: number,
  totalRounds: number,
  bracketSize: number
): string => {
  if (roundIndex === totalRounds - 1) {
    return '결승';
  }
  if (roundIndex === totalRounds - 2 && totalRounds > 2) {
    return '준결승';
  }

  const teamsInRound = bracketSize / Math.pow(2, roundIndex);
  if (teamsInRound >= 8) {
    return `${teamsInRound}강`;
  }
  if (teamsInRound === 4) {
    return '준결승';
  }
  return `라운드 ${roundIndex + 1}`;
};

const determineMatchFormat = (
  roundIndex: number,
  totalRounds: number,
  options: FormatOptions
): KnockoutSeriesFormat => {
  if (roundIndex === totalRounds - 1) {
    return options.final;
  }
  if (roundIndex === totalRounds - 2 && totalRounds > 2) {
    return options.semifinal;
  }
  return options.base;
};

const buildBracketRounds = (
  seededTeams: SeededTeam[],
  formatOptions: FormatOptions
): BracketRound[] => {
  if (seededTeams.length < 2) {
    return [];
  }

  const sortedBySeed = [...seededTeams].sort((a, b) => a.seedRank - b.seedRank);
  const totalTeams = sortedBySeed.length;
  const bracketExponent = Math.ceil(Math.log2(totalTeams));
  const bracketSize = Math.pow(2, bracketExponent);
  const paddedTeams: Array<SeededTeam | null> = [...sortedBySeed];

  while (paddedTeams.length < bracketSize) {
    paddedTeams.push(null);
  }

  const totalRounds = Math.log2(bracketSize);
  const rounds: BracketRound[] = [];

  const firstRoundMatches: BracketMatch[] = [];
  const half = bracketSize / 2;

  for (let index = 0; index < half; index += 1) {
    const primary = paddedTeams[index];
    const secondary = paddedTeams[bracketSize - 1 - index];
    const matchId = `R1-M${index + 1}`;

    const slots: [MatchSlot, MatchSlot] = [
      primary
        ? {
            type: 'team',
            label: primary.name,
            detail: primary.seedLabel,
            teamId: primary.id,
          }
        : { type: 'bye', label: '부전승' },
      secondary
        ? {
            type: 'team',
            label: secondary.name,
            detail: secondary.seedLabel,
            teamId: secondary.id,
          }
        : { type: 'bye', label: '부전승' },
    ];

    firstRoundMatches.push({
      id: matchId,
      roundIndex: 0,
      slots,
      format: determineMatchFormat(0, totalRounds, formatOptions),
    });
  }

  rounds.push({
    id: 'R1',
    name: roundNameForIndex(0, totalRounds, bracketSize),
    matches: firstRoundMatches,
  });

  let previousRound = firstRoundMatches;

  for (let roundIndex = 1; roundIndex < totalRounds; roundIndex += 1) {
    const matchCount = Math.ceil(previousRound.length / 2);
    const currentRound: BracketMatch[] = [];

    for (let matchIndex = 0; matchIndex < matchCount; matchIndex += 1) {
      const sourceA = previousRound[matchIndex * 2];
      const sourceB = previousRound[matchIndex * 2 + 1];
      const matchId = `R${roundIndex + 1}-M${matchIndex + 1}`;

      const slots: [MatchSlot, MatchSlot] = [
        sourceA
          ? {
              type: 'winner',
              label: `${sourceA.id} 승자`,
              detail: `${sourceA.id} 승자`,
            }
          : { type: 'bye', label: '부전승' },
        sourceB
          ? {
              type: 'winner',
              label: `${sourceB.id} 승자`,
              detail: `${sourceB.id} 승자`,
            }
          : { type: 'bye', label: '부전승' },
      ];

      currentRound.push({
        id: matchId,
        roundIndex,
        slots,
        format: determineMatchFormat(roundIndex, totalRounds, formatOptions),
      });
    }

    rounds.push({
      id: `R${roundIndex + 1}`,
      name: roundNameForIndex(roundIndex, totalRounds, bracketSize),
      matches: currentRound,
    });

    previousRound = currentRound;
  }

  return rounds;
};

type ViewportState = {
  scale: number;
  x: number;
  y: number;
};

type PointerStart = {
  x: number;
  y: number;
  originX: number;
  originY: number;
};

const TournamentBuilderCanvas: React.FC<{
  rounds: BracketRound[];
  viewport: ViewportState;
  onWheel: (event: React.WheelEvent<HTMLDivElement>) => void;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: React.PointerEvent<HTMLDivElement>) => void;
  onTeamClick: (teamId: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}> = ({
  rounds,
  viewport,
  onWheel,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onTeamClick,
  onZoomIn,
  onZoomOut,
  onReset,
}) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        flex: 1,
        overflow: 'hidden',
        borderRadius: 1,
        border: `1px solid ${theme.palette.divider}`,
        background: theme.palette.background.paper,
        minHeight: 480,
      }}
    >
      <Box
        component="div"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        sx={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          cursor: 'grab',
          touchAction: 'none',
        }}
      >
        <Box
          sx={{
            transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
            transformOrigin: '0 0',
            transition: 'transform 0.08s ease-out',
            display: 'grid',
            gap: 24,
            gridAutoFlow: 'column',
            padding: 4,
            minWidth: rounds.length * 280,
          }}
        >
          {rounds.map((round) => (
            <Box key={round.id} sx={{ minWidth: 240 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  marginBottom: 1.5,
                  color: theme.palette.primary.main,
                }}
              >
                {round.name}
              </Typography>
              <Stack spacing={2}>
                {round.matches.map((match) => (
                  <Box
                    key={match.id}
                    sx={{
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      backgroundColor: theme.palette.background.default,
                      padding: 1.5,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    }}
                  >
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {match.id}
                      </Typography>
                      <Chip
                        size="small"
                        label={formatLabels[match.format]}
                        color="secondary"
                        variant="outlined"
                      />
                    </Stack>
                    <Divider sx={{ my: 1 }} />
                    <Stack spacing={1}>
                      {match.slots.map((slot, index) => {
                        if (slot.type === 'team') {
                          return (
                            <Paper
                              key={`${match.id}-slot-${index}`}
                              elevation={0}
                              onClick={() => onTeamClick(slot.teamId)}
                              sx={{
                                padding: 1,
                                borderRadius: 1.5,
                                border: `1px solid ${theme.palette.divider}`,
                                backgroundColor: theme.palette.background.paper,
                                cursor: 'pointer',
                                transition: 'background-color 0.2s ease',
                                '&:hover': {
                                  backgroundColor: theme.palette.action.hover,
                                },
                              }}
                            >
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Chip label={slot.detail} size="small" color="primary" variant="outlined" />
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {slot.label}
                                </Typography>
                              </Stack>
                            </Paper>
                          );
                        }

                        if (slot.type === 'winner') {
                          return (
                            <Paper
                              key={`${match.id}-slot-${index}`}
                              elevation={0}
                              sx={{
                                padding: 1,
                                borderRadius: 1.5,
                                border: `1px dashed ${theme.palette.divider}`,
                                backgroundColor: theme.palette.action.hover,
                              }}
                            >
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Chip label="승자" size="small" color="primary" />
                                <Typography variant="body2" color="text.secondary">
                                  {slot.detail}
                                </Typography>
                              </Stack>
                            </Paper>
                          );
                        }

                        return (
                          <Paper
                            key={`${match.id}-slot-${index}`}
                            elevation={0}
                            sx={{
                              padding: 1,
                              borderRadius: 1.5,
                              border: `1px dashed ${theme.palette.divider}`,
                              backgroundColor: theme.palette.background.default,
                            }}
                          >
                            <Typography variant="body2" color="text.secondary">
                              {slot.label}
                            </Typography>
                          </Paper>
                        );
                      })}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>
          ))}
        </Box>
      </Box>
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          padding: theme.spacing(0.5, 1.5),
          borderRadius: 999,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        }}
      >
        <Tooltip title="축소">
          <span>
            <IconButton color="primary" onClick={onZoomOut}>
              <ZoomOutIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="초기화">
          <span>
            <IconButton color="primary" onClick={onReset}>
              <CenterFocusStrongIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="확대">
          <span>
            <IconButton color="primary" onClick={onZoomIn}>
              <ZoomInIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Paper>
  );
};

const TournamentBuilderSettings: React.FC<{
  tournamentName: string;
  participants: number;
  onParticipantsChange: (value: number) => void;
  onTournamentNameChange: (name: string) => void;
  useGroupStage: boolean;
  onToggleGroupStage: (value: boolean) => void;
  groupCount: number;
  onGroupCountChange: (value: number) => void;
  promotionPerGroup: number;
  onPromotionChange: (value: number) => void;
  baseFormat: KnockoutSeriesFormat;
  semifinalFormat: KnockoutSeriesFormat;
  finalFormat: KnockoutSeriesFormat;
  onBaseFormatChange: (value: KnockoutSeriesFormat) => void;
  onSemifinalFormatChange: (value: KnockoutSeriesFormat) => void;
  onFinalFormatChange: (value: KnockoutSeriesFormat) => void;
  onGenerateSeeds: () => void;
  onTemporarySave: () => void;
}> = ({
  tournamentName,
  participants,
  onParticipantsChange,
  onTournamentNameChange,
  useGroupStage,
  onToggleGroupStage,
  groupCount,
  onGroupCountChange,
  promotionPerGroup,
  onPromotionChange,
  baseFormat,
  semifinalFormat,
  finalFormat,
  onBaseFormatChange,
  onSemifinalFormatChange,
  onFinalFormatChange,
  onGenerateSeeds,
  onTemporarySave,
}) => {
  const theme = useTheme();
  const inputRadiusStyle = useMemo(
    () => ({
      '& .MuiOutlinedInput-root': {
        borderRadius: 0.5,
        paddingLeft: 1.5,
        paddingRight: 1.5,
        '& .MuiOutlinedInput-input': {
          padding: theme.spacing(1.5, 1.25),
        },
      },
      '& .MuiOutlinedInput-notchedOutline': {
        borderRadius: 0.5,
      },
    }),
    [theme]
  );

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 1,
        padding: 3,
        border: `1px solid ${theme.palette.divider}`,
        background: theme.palette.background.paper,
      }}
    >
      <Stack spacing={2.5}>
        <Stack spacing={2}>
          <Stack
            direction="row"
            spacing={2}
            flexWrap="wrap"
            alignItems="center"
            rowGap={1.5}
          >
            <TextField
              label="토너먼트 이름"
              value={tournamentName}
              onChange={(event) => onTournamentNameChange(event.target.value)}
              sx={{
                width: { xs: '100%', md: '50%' },
                minWidth: { md: 260 },
                flexShrink: 0,
                ...inputRadiusStyle,
              }}
            />
            <Box
              sx={{
                marginLeft: { xs: 0, md: 'auto' },
                display: 'flex',
                alignItems: 'center',
                justifyContent: { xs: 'space-between', md: 'flex-end' },
                width: { xs: '100%', md: 'auto' },
                gap: 1.5,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontSize: '1em',
                  flex: { xs: 1, md: 'initial' },
                  textAlign: { xs: 'left', md: 'right' },
                }}
              >
                조별 예선
              </Typography>
              <Switch
                checked={useGroupStage}
                onChange={(event) => onToggleGroupStage(event.target.checked)}
                inputProps={{ 'aria-label': '조별 예선' }}
              />
            </Box>
          </Stack>

          {useGroupStage && (
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
              <TextField
                type="number"
                label="참가 팀 수"
                value={participants}
                onChange={(event) =>
                  onParticipantsChange(
                    Math.min(
                      MAX_PARTICIPANTS,
                      Math.max(MIN_PARTICIPANTS, Number(event.target.value) || MIN_PARTICIPANTS)
                    )
                  )
                }
                inputProps={{ min: MIN_PARTICIPANTS, max: MAX_PARTICIPANTS }}
                sx={{
                  width: { xs: '100%', md: '33.33%' },
                  flexShrink: 0,
                  ...inputRadiusStyle,
                }}
              />
              <FormControl
                sx={{
                  width: { xs: '100%', md: '33.33%' },
                  minWidth: { md: 160 },
                  ...inputRadiusStyle,
                }}
              >
                <InputLabel id="group-count-label">그룹 수</InputLabel>
                <Select
                  labelId="group-count-label"
                  value={groupCount}
                  label="그룹 수"
                  onChange={(event) => onGroupCountChange(Number(event.target.value))}
                >
                  {Array.from({ length: MAX_GROUPS - MIN_GROUPS + 1 }, (_, index) => index + MIN_GROUPS).map(
                    (value) => (
                      <MenuItem key={value} value={value}>
                        {value}개
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
              <FormControl
                sx={{
                  width: { xs: '100%', md: '33.33%' },
                  minWidth: { md: 200 },
                  ...inputRadiusStyle,
                }}
              >
                <InputLabel id="promotion-count-label">승격 팀 수</InputLabel>
                <Select
                  labelId="promotion-count-label"
                  value={promotionPerGroup}
                  label="승격 팀 수"
                  onChange={(event) => onPromotionChange(Number(event.target.value))}
                >
                  {Array.from({ length: MAX_PROMOTION - MIN_PROMOTION + 1 }, (_, index) =>
                    index + MIN_PROMOTION
                  ).map((value) => (
                    <MenuItem key={value} value={value}>
                      그룹 상위 {value}팀
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          )}
        </Stack>

        <Divider sx={{ my: 0 }} />

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <FormControl sx={{ minWidth: 200, width: '100%', ...inputRadiusStyle }}>
            <InputLabel id="base-format-label">초기 라운드 형식</InputLabel>
            <Select
              labelId="base-format-label"
              value={baseFormat}
              label="초기 라운드 형식"
              onChange={(event) => onBaseFormatChange(event.target.value as KnockoutSeriesFormat)}
            >
              {Object.entries(formatLabels).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 200, width: '100%', ...inputRadiusStyle }}>
            <InputLabel id="semifinal-format-label">준결승 형식</InputLabel>
            <Select
              labelId="semifinal-format-label"
              value={semifinalFormat}
              label="준결승 형식"
              onChange={(event) => onSemifinalFormatChange(event.target.value as KnockoutSeriesFormat)}
            >
              {Object.entries(formatLabels).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 200, width: '100%', ...inputRadiusStyle }}>
            <InputLabel id="final-format-label">결승 형식</InputLabel>
            <Select
              labelId="final-format-label"
              value={finalFormat}
              label="결승 형식"
              onChange={(event) => onFinalFormatChange(event.target.value as KnockoutSeriesFormat)}
            >
              {Object.entries(formatLabels).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Tooltip title="임시 저장">
            <span>
              <Button
                variant="outlined"
                startIcon={<SaveOutlinedIcon />}
                onClick={onTemporarySave}
              >
                임시 저장
              </Button>
            </span>
          </Tooltip>
          <Tooltip title="시드 생성">
            <span>
              <Button
                variant="contained"
                color="primary"
                startIcon={<ShuffleOutlinedIcon />}
                onClick={onGenerateSeeds}
              >
                시드 생성
              </Button>
            </span>
          </Tooltip>
        </Stack>
      </Stack>
    </Paper>
  );
};

const TournamentPalette: React.FC<{
  groups: GroupAssignments;
  useGroupStage: boolean;
  knockoutTeams: SeededTeam[];
  onTeamClick: (teamId: number) => void;
}> = ({ groups, useGroupStage, knockoutTeams, onTeamClick }) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        marginTop: 3,
        borderRadius: 1,
        border: `1px solid ${theme.palette.divider}`,
        background: theme.palette.background.paper,
      }}
    >
      <Stack direction="row" spacing={3} padding={3} flexWrap="wrap">
        {useGroupStage ? (
          Object.keys(groups).length > 0 ? (
            Object.entries(groups).map(([group, groupTeams]) => (
              <Box key={group} sx={{ minWidth: 220 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  {group}조
                </Typography>
                <Stack spacing={1}>
                  {groupTeams.map((team) => (
                    <Paper
                      key={team.id}
                      elevation={0}
                      onClick={() => onTeamClick(team.id)}
                      sx={{
                        padding: 1,
                        borderRadius: 1.5,
                        border: `1px solid ${theme.palette.divider}`,
                        backgroundColor: theme.palette.background.default,
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: theme.palette.action.hover,
                        },
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip label={`${group}${team.groupRank}`} size="small" variant="outlined" />
                        <Typography variant="body2">{team.name}</Typography>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            ))
          ) : (
            <Typography color="text.secondary">팀을 그룹에 배정하세요.</Typography>
          )
        ) : (
          <Box sx={{ minWidth: 220 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              시드 리스트
            </Typography>
            <Stack spacing={1}>
              {knockoutTeams.map((team) => (
                <Paper
                  key={team.id}
                  elevation={0}
                  onClick={() => onTeamClick(team.id)}
                  sx={{
                    padding: 1,
                    borderRadius: 1.5,
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor: theme.palette.background.default,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label={team.seedLabel} size="small" variant="outlined" />
                    <Typography variant="body2">{team.name}</Typography>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

const TournamentBuilderContent: React.FC = () => {
  const [tournamentName, setTournamentName] = useState('New Tournament');
  const [participants, setParticipants] = useState(8);
  const [teams, setTeams] = useState<BaseTeam[]>(() => createInitialTeams(8));
  const [useGroupStage, setUseGroupStage] = useState(true);
  const [groupCount, setGroupCount] = useState(4);
  const [promotionPerGroup, setPromotionPerGroup] = useState(2);
  const [baseFormat, setBaseFormat] = useState<KnockoutSeriesFormat>('single');
  const [semifinalFormat, setSemifinalFormat] = useState<KnockoutSeriesFormat>('single');
  const [finalFormat, setFinalFormat] = useState<KnockoutSeriesFormat>('bestOf3');
  const [knockoutTeams, setKnockoutTeams] = useState<SeededTeam[]>([]);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [teamEditorOpen, setTeamEditorOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [editedTeamName, setEditedTeamName] = useState('');
  const [viewport, setViewport] = useState<ViewportState>({ scale: 1, x: 0, y: 0 });
  const pointerStartRef = useRef<PointerStart | null>(null);

  useEffect(() => {
    setTeams((previousTeams) => {
      if (participants === previousTeams.length) {
        return previousTeams;
      }

      if (participants > previousTeams.length) {
        const nextTeams = [...previousTeams];
        for (let index = previousTeams.length; index < participants; index += 1) {
          nextTeams.push({ id: index + 1, name: `팀 ${index + 1}` });
        }
        return nextTeams;
      }

      return previousTeams.slice(0, participants);
    });
  }, [participants]);

  const groupAssignments = useMemo(
    () => distributeIntoGroups(teams, useGroupStage, groupCount),
    [teams, useGroupStage, groupCount]
  );

  const formatOptions = useMemo<FormatOptions>(
    () => ({ base: baseFormat, semifinal: semifinalFormat, final: finalFormat }),
    [baseFormat, semifinalFormat, finalFormat]
  );

  const bracketRounds = useMemo(
    () => buildBracketRounds(knockoutTeams, formatOptions),
    [knockoutTeams, formatOptions]
  );

  const handleTeamClick = useCallback(
    (teamId: number) => {
      const team = teams.find((entry) => entry.id === teamId);
      if (!team) {
        return;
      }
      setSelectedTeamId(teamId);
      setEditedTeamName(team.name);
      setTeamEditorOpen(true);
    },
    [teams]
  );

  const handleSaveTeamName = useCallback(() => {
    if (!selectedTeamId) {
      return;
    }

    const trimmed = editedTeamName.trim();
    if (!trimmed) {
      return;
    }

    setTeams((previousTeams) =>
      previousTeams.map((team) =>
        team.id === selectedTeamId
          ? {
              ...team,
              name: trimmed,
            }
          : team
      )
    );

    setKnockoutTeams((previousSeeds) =>
      previousSeeds.map((seed) =>
        seed.id === selectedTeamId
          ? {
              ...seed,
              name: trimmed,
            }
          : seed
      )
    );

    setTeamEditorOpen(false);
  }, [editedTeamName, selectedTeamId]);

  const handleSeedGeneration = useCallback(() => {
    const seeded = computeSeededTeams(
      teams,
      groupAssignments,
      promotionPerGroup,
      useGroupStage
    );

    if (seeded.length < 2) {
      setSnackbarMessage('시드 생성에는 최소 두 팀이 필요합니다.');
      return;
    }

    setKnockoutTeams(seeded);
    setSnackbarMessage('시드가 생성되었습니다.');
  }, [teams, groupAssignments, promotionPerGroup, useGroupStage]);

  const handleTemporarySave = useCallback(() => {
    const payload = {
      name: tournamentName,
      participants,
      groupStage: useGroupStage,
      groupCount,
      promotionPerGroup,
      formats: formatOptions,
      seededTeams: knockoutTeams,
    };

    // 실 서비스에서는 API 호출이나 로컬 저장소에 저장하도록 연결
    // 여기서는 상태 스냅샷을 로그로 남기고 알림을 제공한다.
    // eslint-disable-next-line no-console
    console.info('Tournament draft saved', payload);
    setSnackbarMessage('임시 저장이 완료되었습니다.');
  }, [
    tournamentName,
    participants,
    useGroupStage,
    groupCount,
    promotionPerGroup,
    formatOptions,
    knockoutTeams,
  ]);

  const handleWheel = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    if (event.cancelable) {
      event.preventDefault();
    }
    const delta = event.deltaY < 0 ? 0.1 : -0.1;
    setViewport((previous) => {
      const nextScale = Math.min(2.5, Math.max(0.6, previous.scale + delta));
      return { ...previous, scale: Number(nextScale.toFixed(2)) };
    });
  }, []);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      pointerStartRef.current = {
        x: event.clientX,
        y: event.clientY,
        originX: viewport.x,
        originY: viewport.y,
      };
    },
    [viewport.x, viewport.y]
  );

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const start = pointerStartRef.current;
    if (!start) {
      return;
    }
    setViewport((previous) => ({
      ...previous,
      x: start.originX + (event.clientX - start.x),
      y: start.originY + (event.clientY - start.y),
    }));
  }, []);

  const handlePointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    pointerStartRef.current = null;
  }, []);

  const resetViewport = useCallback(() => {
    setViewport({ scale: 1, x: 0, y: 0 });
  }, []);

  const handleZoomIn = useCallback(() => {
    setViewport((previous) => ({
      ...previous,
      scale: Math.min(2.5, Number((previous.scale + 0.1).toFixed(2))),
    }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setViewport((previous) => ({
      ...previous,
      scale: Math.max(0.6, Number((previous.scale - 0.1).toFixed(2))),
    }));
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <TournamentBuilderSettings
        tournamentName={tournamentName}
        participants={participants}
        onParticipantsChange={setParticipants}
        onTournamentNameChange={setTournamentName}
        useGroupStage={useGroupStage}
        onToggleGroupStage={setUseGroupStage}
        groupCount={groupCount}
        onGroupCountChange={setGroupCount}
        promotionPerGroup={promotionPerGroup}
        onPromotionChange={setPromotionPerGroup}
        baseFormat={baseFormat}
        semifinalFormat={semifinalFormat}
        finalFormat={finalFormat}
        onBaseFormatChange={setBaseFormat}
        onSemifinalFormatChange={setSemifinalFormat}
        onFinalFormatChange={setFinalFormat}
        onGenerateSeeds={handleSeedGeneration}
        onTemporarySave={handleTemporarySave}
      />

      <Box sx={{ display: 'flex', gap: 3, minHeight: 520 }}>
        <TournamentBuilderCanvas
          rounds={bracketRounds}
          viewport={viewport}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onTeamClick={handleTeamClick}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={resetViewport}
        />
      </Box>

      <TournamentPalette
        groups={groupAssignments}
        useGroupStage={useGroupStage}
        knockoutTeams={knockoutTeams}
        onTeamClick={handleTeamClick}
      />

      <Dialog open={teamEditorOpen} onClose={() => setTeamEditorOpen(false)}>
        <DialogTitle>팀 이름 수정</DialogTitle>
        <DialogContent sx={{ minWidth: 320 }}>
          <TextField
            fullWidth
            label="팀 이름"
            value={editedTeamName}
            onChange={(event) => setEditedTeamName(event.target.value)}
            autoFocus
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 0.5,
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderRadius: 0.5,
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTeamEditorOpen(false)}>취소</Button>
          <Button variant="contained" onClick={handleSaveTeamName}>
            저장
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(snackbarMessage)}
        autoHideDuration={3200}
        onClose={() => setSnackbarMessage(null)}
        message={snackbarMessage}
      />
    </Box>
  );
};

const TournamentBuilder: React.FC = () => (
  <ThemeProvider theme={tournamentTheme}>
    <CssBaseline />
    <Box sx={{ padding: 3, backgroundColor: tournamentTheme.palette.background.default }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
        Tournament Builder
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        그룹 스테이지 구성, 시드 생성, 라운드 형식 설정을 한 번에 관리하세요.
      </Typography>
      <TournamentBuilderContent />
    </Box>
  </ThemeProvider>
);

export default TournamentBuilder;
