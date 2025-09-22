import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Autocomplete,
  Typography
} from '@mui/material';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { matchAPI, clubAPI, tournamentAPI } from '../../services/api';
import { removeEmptyFields } from '../../utils/formHelpers';

const CreateMatchDialog = ({ open, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    home_club_id: '',
    away_club_id: '',
    match_date: '',
    venue: '',
    match_type: 'casual',
    tournament_id: '',
    stage: '',
    round_number: '',
    group_name: '',
    duration_minutes: 90,
    referee_name: '',
    weather: '',
    notes: '',
    is_public: true,
    organizer_type: 'user'
  });
  const [errors, setErrors] = useState({});

  // Fetch clubs for selection
  const { data: clubsData } = useQuery({
    queryKey: ['clubs-list'],
    queryFn: () => clubAPI.getAll({ limit: 100 }),
    select: (response) => response.data.data
  });

  // Fetch tournaments for selection
  const { data: tournamentsData } = useQuery({
    queryKey: ['tournaments-list'],
    queryFn: () => tournamentAPI.getAll({ limit: 100 }),
    select: (response) => response.data.data
  });

  const createMutation = useMutation({
    mutationFn: matchAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['matches']);
      onSuccess();
      handleReset();
    },
    onError: (error) => {
      const serverErrors = error.response?.data?.errors || [];
      const errorMap = {};
      serverErrors.forEach(err => {
        errorMap[err.field] = err.message;
      });
      setErrors(errorMap);
    }
  });

  const handleChange = (field) => (event, value) => {
    const newValue = value !== undefined ? value : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: newValue
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Validation
    if (!formData.home_club_id || !formData.away_club_id) {
      setErrors({ clubs: '홈팀과 원정팀을 선택해주세요.' });
      return;
    }

    if (formData.home_club_id === formData.away_club_id) {
      setErrors({ clubs: '홈팀과 원정팀은 다른 팀이어야 합니다.' });
      return;
    }

    const submitData = removeEmptyFields(formData);

    // Convert numeric fields
    if (submitData.duration_minutes) {
      submitData.duration_minutes = parseInt(submitData.duration_minutes);
    }
    if (submitData.round_number) {
      submitData.round_number = parseInt(submitData.round_number);
    }

    createMutation.mutate(submitData);
  };

  const handleReset = () => {
    setFormData({
      home_club_id: '',
      away_club_id: '',
      match_date: '',
      venue: '',
      match_type: 'casual',
      tournament_id: '',
      stage: '',
      round_number: '',
      group_name: '',
      duration_minutes: 90,
      referee_name: '',
      weather: '',
      notes: '',
      is_public: true,
      organizer_type: 'user'
    });
    setErrors({});
  };

  const handleClose = () => {
    if (!createMutation.isLoading) {
      handleReset();
      onClose();
    }
  };

  const clubs = clubsData || [];
  const tournaments = tournamentsData || [];
  const today = new Date().toISOString().slice(0, 16); // for datetime-local input

  const getMatchTypeRequiresStage = (type) => {
    return type === 'tournament' || type === 'a_tournament';
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>새 경기 만들기</DialogTitle>

        <DialogContent>
          {createMutation.isError && createMutation.error?.response?.data?.message && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {createMutation.error.response.data.message}
            </Alert>
          )}

          {errors.clubs && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.clubs}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={clubs}
                getOptionLabel={(option) => option.name}
                value={clubs.find(club => club.id === formData.home_club_id) || null}
                onChange={(event, newValue) => {
                  handleChange('home_club_id')(event, newValue?.id || '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="홈팀"
                    required
                    error={!!errors.home_club_id}
                    helperText={errors.home_club_id}
                    disabled={createMutation.isLoading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={clubs}
                getOptionLabel={(option) => option.name}
                value={clubs.find(club => club.id === formData.away_club_id) || null}
                onChange={(event, newValue) => {
                  handleChange('away_club_id')(event, newValue?.id || '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="원정팀"
                    required
                    error={!!errors.away_club_id}
                    helperText={errors.away_club_id}
                    disabled={createMutation.isLoading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="datetime-local"
                label="경기 일시"
                value={formData.match_date}
                onChange={handleChange('match_date')}
                error={!!errors.match_date}
                helperText={errors.match_date}
                disabled={createMutation.isLoading}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: today }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="경기장"
                value={formData.venue}
                onChange={handleChange('venue')}
                error={!!errors.venue}
                helperText={errors.venue}
                disabled={createMutation.isLoading}
                placeholder="예: 서울월드컵경기장"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required disabled={createMutation.isLoading}>
                <InputLabel>경기 유형</InputLabel>
                <Select
                  value={formData.match_type}
                  onChange={handleChange('match_type')}
                  label="경기 유형"
                >
                  <MenuItem value="practice">연습경기</MenuItem>
                  <MenuItem value="casual">캐주얼</MenuItem>
                  <MenuItem value="friendly">친선경기</MenuItem>
                  <MenuItem value="tournament">토너먼트</MenuItem>
                  <MenuItem value="a_friendly">A매치 친선</MenuItem>
                  <MenuItem value="a_tournament">A매치 토너먼트</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="경기 시간 (분)"
                value={formData.duration_minutes}
                onChange={handleChange('duration_minutes')}
                error={!!errors.duration_minutes}
                helperText={errors.duration_minutes}
                disabled={createMutation.isLoading}
                inputProps={{ min: 1, max: 200 }}
              />
            </Grid>

            {(formData.match_type === 'tournament' || formData.match_type === 'a_tournament') && (
              <>
                <Grid item xs={12}>
                  <Autocomplete
                    options={tournaments}
                    getOptionLabel={(option) => option.name}
                    value={tournaments.find(t => t.id === formData.tournament_id) || null}
                    onChange={(event, newValue) => {
                      handleChange('tournament_id')(event, newValue?.id || '');
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="토너먼트"
                        error={!!errors.tournament_id}
                        helperText={errors.tournament_id}
                        disabled={createMutation.isLoading}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth disabled={createMutation.isLoading}>
                    <InputLabel>단계</InputLabel>
                    <Select
                      value={formData.stage}
                      onChange={handleChange('stage')}
                      label="단계"
                    >
                      <MenuItem value="">선택 안함</MenuItem>
                      <MenuItem value="group">조별리그</MenuItem>
                      <MenuItem value="round_of_16">16강</MenuItem>
                      <MenuItem value="quarter">8강</MenuItem>
                      <MenuItem value="semi">준결승</MenuItem>
                      <MenuItem value="final">결승</MenuItem>
                      <MenuItem value="regular_season">정규시즌</MenuItem>
                      <MenuItem value="playoff">플레이오프</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="라운드"
                    value={formData.round_number}
                    onChange={handleChange('round_number')}
                    error={!!errors.round_number}
                    helperText={errors.round_number}
                    disabled={createMutation.isLoading}
                    inputProps={{ min: 1 }}
                  />
                </Grid>

                {formData.stage === 'group' && (
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="조"
                      value={formData.group_name}
                      onChange={handleChange('group_name')}
                      error={!!errors.group_name}
                      helperText={errors.group_name}
                      disabled={createMutation.isLoading}
                      placeholder="A, B, C..."
                      inputProps={{ maxLength: 1 }}
                    />
                  </Grid>
                )}
              </>
            )}

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="심판"
                value={formData.referee_name}
                onChange={handleChange('referee_name')}
                error={!!errors.referee_name}
                helperText={errors.referee_name}
                disabled={createMutation.isLoading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="날씨"
                value={formData.weather}
                onChange={handleChange('weather')}
                error={!!errors.weather}
                helperText={errors.weather}
                disabled={createMutation.isLoading}
                placeholder="맑음, 흐림, 비..."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="경기 노트"
                value={formData.notes}
                onChange={handleChange('notes')}
                error={!!errors.notes}
                helperText={errors.notes}
                disabled={createMutation.isLoading}
                placeholder="특이사항, 경기 관련 메모..."
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleClose}
            disabled={createMutation.isLoading}
          >
            취소
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={createMutation.isLoading || !formData.home_club_id || !formData.away_club_id}
            startIcon={createMutation.isLoading ? <CircularProgress size={16} /> : null}
          >
            {createMutation.isLoading ? '생성 중...' : '경기 만들기'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateMatchDialog;