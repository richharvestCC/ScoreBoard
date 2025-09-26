import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Chip,
  Stack,
  Divider
} from '@mui/material';
import {
  SportsScore,
  PlayArrow,
  Edit,
  AccessTime,
  Stadium,
  Groups,
  CalendarToday
} from '@mui/icons-material';
import { useNavigation } from '../contexts/NavigationContext';

// Mock data for demonstration
const mockMatches = [
  {
    id: 'match-001',
    homeTeam: '서울 FC',
    awayTeam: '부산 아이파크',
    date: '2025-09-26',
    time: '19:30',
    venue: '서울월드컵경기장',
    status: '예정',
    competition: 'K리그1'
  },
  {
    id: 'match-002',
    homeTeam: '울산 현대',
    awayTeam: '전북 현대모터스',
    date: '2025-09-26',
    time: '16:00',
    venue: '울산문수축구경기장',
    status: '진행중',
    competition: 'K리그1'
  },
  {
    id: 'match-003',
    homeTeam: '수원 FC',
    awayTeam: '강원 FC',
    date: '2025-09-27',
    time: '14:00',
    venue: '수원종합운동장',
    status: '예정',
    competition: 'K리그1'
  }
];

const MatchRecordHome: React.FC = () => {
  const { navigate } = useNavigation();
  const [selectedMatch, setSelectedMatch] = useState<string>('');
  const [customMatch, setCustomMatch] = useState({
    homeTeam: '',
    awayTeam: '',
    venue: '',
    date: '',
    time: ''
  });
  const [useCustomMatch, setUseCustomMatch] = useState(false);

  const handleMatchSelect = (matchId: string) => {
    setSelectedMatch(matchId);
    setUseCustomMatch(false);
  };

  const handleCustomMatchChange = (field: string, value: string) => {
    setCustomMatch(prev => ({ ...prev, [field]: value }));
    setUseCustomMatch(true);
    setSelectedMatch('');
  };

  const handleStartLiveRecord = () => {
    let url = '';
    if (useCustomMatch) {
      // 커스텀 경기 정보로 실시간 기록 시작
      const queryParams = new URLSearchParams({
        homeTeam: customMatch.homeTeam,
        awayTeam: customMatch.awayTeam,
        venue: customMatch.venue,
        date: customMatch.date,
        time: customMatch.time
      }).toString();
      url = `/admin/match-record/live?${queryParams}`;
    } else if (selectedMatch) {
      // 선택된 경기로 실시간 기록 시작
      url = `/admin/match-record/live/${selectedMatch}`;
    }

    if (url) {
      // 새창에서 실시간 기록 페이지 열기
      window.open(url, 'liveRecord', 'width=1400,height=900,scrollbars=yes,resizable=yes');
    }
  };

  const handleEditRecord = () => {
    if (useCustomMatch) {
      const queryParams = new URLSearchParams({
        homeTeam: customMatch.homeTeam,
        awayTeam: customMatch.awayTeam,
        venue: customMatch.venue,
        date: customMatch.date,
        time: customMatch.time
      }).toString();
      navigate(`/admin/match-record/edit?${queryParams}`);
    } else if (selectedMatch) {
      navigate(`/admin/match-record/edit/${selectedMatch}`);
    }
  };

  const isFormValid = useCustomMatch
    ? customMatch.homeTeam && customMatch.awayTeam && customMatch.venue
    : !!selectedMatch;

  const selectedMatchData = mockMatches.find(match => match.id === selectedMatch);

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SportsScore color="primary" fontSize="large" />
          경기 기록 관리
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          경기를 선택하고 실시간 기록을 시작하거나 기록을 편집하세요.
        </Typography>
      </Box>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
        {/* 기존 경기 선택 */}
        <Box sx={{ flex: 1 }}>
          <Card variant="outlined">
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Stadium color="primary" />
                기존 경기 선택
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                이미 등록된 경기 중에서 선택하세요.
              </Typography>

              <Stack spacing={2}>
                {mockMatches.map((match) => (
                  <Card
                    key={match.id}
                    variant="outlined"
                    sx={{
                      cursor: 'pointer',
                      border: selectedMatch === match.id ? 2 : 1,
                      borderColor: selectedMatch === match.id ? 'primary.main' : 'divider',
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: 1
                      }
                    }}
                    onClick={() => handleMatchSelect(match.id)}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {match.homeTeam} vs {match.awayTeam}
                        </Typography>
                        <Chip
                          label={match.status}
                          size="small"
                          color={match.status === '진행중' ? 'success' : 'default'}
                          variant={match.status === '진행중' ? 'filled' : 'outlined'}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarToday fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            {match.date}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccessTime fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            {match.time}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        📍 {match.venue} • {match.competition}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* 새 경기 입력 */}
        <Box sx={{ flex: 1 }}>
          <Card variant="outlined">
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Edit color="primary" />
                새 경기 입력
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                새로운 경기 정보를 직접 입력하세요.
              </Typography>

              <Stack spacing={3}>
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="홈 팀"
                    fullWidth
                    value={customMatch.homeTeam}
                    onChange={(e) => handleCustomMatchChange('homeTeam', e.target.value)}
                    placeholder="예: 서울 FC"
                  />
                  <TextField
                    label="어웨이 팀"
                    fullWidth
                    value={customMatch.awayTeam}
                    onChange={(e) => handleCustomMatchChange('awayTeam', e.target.value)}
                    placeholder="예: 부산 아이파크"
                  />
                </Stack>

                <TextField
                  label="경기장"
                  fullWidth
                  value={customMatch.venue}
                  onChange={(e) => handleCustomMatchChange('venue', e.target.value)}
                  placeholder="예: 서울월드컵경기장"
                />

                <Stack direction="row" spacing={2}>
                  <TextField
                    label="경기 날짜"
                    type="date"
                    fullWidth
                    value={customMatch.date}
                    onChange={(e) => handleCustomMatchChange('date', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="경기 시간"
                    type="time"
                    fullWidth
                    value={customMatch.time}
                    onChange={(e) => handleCustomMatchChange('time', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Stack>

      {/* 선택된 경기 정보 표시 */}
      {(selectedMatchData || (useCustomMatch && customMatch.homeTeam && customMatch.awayTeam)) && (
        <Card variant="outlined" sx={{ mt: 4, p: 3, backgroundColor: 'primary.50' }}>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Groups color="primary" />
            선택된 경기
          </Typography>
          {selectedMatchData ? (
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {selectedMatchData.homeTeam} vs {selectedMatchData.awayTeam}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                📅 {selectedMatchData.date} {selectedMatchData.time} • 📍 {selectedMatchData.venue}
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {customMatch.homeTeam} vs {customMatch.awayTeam}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                📅 {customMatch.date} {customMatch.time} • 📍 {customMatch.venue}
              </Typography>
            </Box>
          )}
        </Card>
      )}

      {/* 액션 버튼들 */}
      <Box sx={{ mt: 4, display: 'flex', gap: 3, justifyContent: 'center' }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<PlayArrow />}
          onClick={handleStartLiveRecord}
          disabled={!isFormValid}
          sx={{
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            minWidth: 200
          }}
        >
          실시간 입력 시작
        </Button>

        <Button
          variant="outlined"
          size="large"
          startIcon={<Edit />}
          onClick={handleEditRecord}
          disabled={!isFormValid}
          sx={{
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            minWidth: 200
          }}
        >
          경기 입력 (폼)
        </Button>
      </Box>

      {!isFormValid && (
        <Alert severity="info" sx={{ mt: 3, maxWidth: 600, mx: 'auto' }}>
          기존 경기를 선택하거나 새 경기 정보를 입력해주세요.
        </Alert>
      )}
    </Box>
  );
};

export default MatchRecordHome;