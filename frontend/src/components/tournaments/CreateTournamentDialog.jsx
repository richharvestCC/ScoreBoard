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
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { competitionAPI } from '../../services/api';
import { removeEmptyFields } from '../../utils/formHelpers';

const CreateTournamentDialog = ({ open, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    tournament_type: 'tournament',
    format: 'knockout',
    level: 'local',
    description: '',
    start_date: '',
    end_date: '',
    max_participants: '',
    entry_fee: '',
    prize_description: '',
    rules: '',
    is_public: true,
    has_group_stage: false
  });
  const [errors, setErrors] = useState({});

  const createMutation = useMutation({
    mutationFn: competitionAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
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

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
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

    const submitData = removeEmptyFields(formData);

    // Convert numeric fields
    if (submitData.max_participants) {
      submitData.max_participants = parseInt(submitData.max_participants);
    }
    if (submitData.entry_fee) {
      submitData.entry_fee = parseFloat(submitData.entry_fee);
    }

    createMutation.mutate(submitData);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      tournament_type: 'tournament',
      format: 'knockout',
      level: 'local',
      description: '',
      start_date: '',
      end_date: '',
      max_participants: '',
      entry_fee: '',
      prize_description: '',
      rules: '',
      is_public: true,
      has_group_stage: false
    });
    setErrors({});
  };

  const handleClose = () => {
    if (!createMutation.isPending) {
      handleReset();
      onClose();
    }
  };

  const currentYear = new Date().getFullYear();
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>새 토너먼트 만들기</DialogTitle>

        <DialogContent>
          {createMutation.isError && createMutation.error?.response?.data?.message && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {createMutation.error.response.data.message}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="토너먼트 이름"
                value={formData.name}
                onChange={handleChange('name')}
                error={!!errors.name}
                helperText={errors.name}
                disabled={createMutation.isPending}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required disabled={createMutation.isPending}>
                <InputLabel>토너먼트 유형</InputLabel>
                <Select
                  value={formData.tournament_type}
                  onChange={handleChange('tournament_type')}
                  label="토너먼트 유형"
                >
                  <MenuItem value="league">리그</MenuItem>
                  <MenuItem value="tournament">토너먼트</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required disabled={createMutation.isPending}>
                <InputLabel>대회 형식</InputLabel>
                <Select
                  value={formData.format}
                  onChange={handleChange('format')}
                  label="대회 형식"
                >
                  <MenuItem value="round_robin">리그전</MenuItem>
                  <MenuItem value="knockout">토너먼트</MenuItem>
                  <MenuItem value="mixed">혼합</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={createMutation.isPending}>
                <InputLabel>대회 규모</InputLabel>
                <Select
                  value={formData.level}
                  onChange={handleChange('level')}
                  label="대회 규모"
                >
                  <MenuItem value="local">지역</MenuItem>
                  <MenuItem value="national">전국</MenuItem>
                  <MenuItem value="international">국제</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="최대 참가팀 수"
                value={formData.max_participants}
                onChange={handleChange('max_participants')}
                error={!!errors.max_participants}
                helperText={errors.max_participants}
                disabled={createMutation.isPending}
                inputProps={{ min: 2, max: 128 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="대회 설명"
                value={formData.description}
                onChange={handleChange('description')}
                error={!!errors.description}
                helperText={errors.description}
                disabled={createMutation.isPending}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="시작일"
                value={formData.start_date}
                onChange={handleChange('start_date')}
                error={!!errors.start_date}
                helperText={errors.start_date}
                disabled={createMutation.isPending}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: today }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="종료일"
                value={formData.end_date}
                onChange={handleChange('end_date')}
                error={!!errors.end_date}
                helperText={errors.end_date}
                disabled={createMutation.isPending}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: formData.start_date || today }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="참가비 (원)"
                value={formData.entry_fee}
                onChange={handleChange('entry_fee')}
                error={!!errors.entry_fee}
                helperText={errors.entry_fee}
                disabled={createMutation.isPending}
                inputProps={{ min: 0, step: 1000 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" height="100%">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.has_group_stage}
                      onChange={handleChange('has_group_stage')}
                  disabled={createMutation.isPending}
                    />
                  }
                  label="조별 예선 진행"
                />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="상금/상품 안내"
                value={formData.prize_description}
                onChange={handleChange('prize_description')}
                error={!!errors.prize_description}
                helperText={errors.prize_description}
                disabled={createMutation.isPending}
                placeholder="우승팀: 100만원, 준우승팀: 50만원..."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="대회 규정"
                value={formData.rules}
                onChange={handleChange('rules')}
                error={!!errors.rules}
                helperText={errors.rules}
                disabled={createMutation.isPending}
                placeholder="경기 시간, 선수 교체 규정, 반칙 규정 등..."
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.is_public}
                    onChange={handleChange('is_public')}
                    disabled={createMutation.isPending}
                  />
                }
                label="공개 토너먼트 (누구나 참가 신청 가능)"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleClose}
            disabled={createMutation.isPending}
          >
            취소
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={createMutation.isPending || !formData.name.trim()}
            startIcon={createMutation.isPending ? <CircularProgress size={16} /> : null}
          >
            {createMutation.isPending ? '생성 중...' : '토너먼트 만들기'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateTournamentDialog;
