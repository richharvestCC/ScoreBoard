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
  Checkbox,
  Typography,
  Divider
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { competitionAPI } from '../../services/api';
import { removeEmptyFields } from '../../utils/formHelpers';

const CreateTemplateDialog = ({ open, onClose, onSuccess, editingTemplate = null }) => {
  const queryClient = useQueryClient();
  const isEditing = Boolean(editingTemplate);

  const [formData, setFormData] = useState({
    name: editingTemplate?.name || '',
    competition_type: editingTemplate?.competition_type || 'tournament',
    format: editingTemplate?.format || 'knockout',
    level: editingTemplate?.level || 'local',
    has_group_stage: editingTemplate?.has_group_stage || false,
    group_stage_format: editingTemplate?.group_stage_format || '',
    knockout_stage_format: editingTemplate?.knockout_stage_format || '',
    description: editingTemplate?.description || '',
    rules: editingTemplate?.rules || '',
    max_participants: editingTemplate?.max_participants || '',
    min_participants: editingTemplate?.min_participants || '',
    entry_fee: editingTemplate?.entry_fee || '',
    prize_description: editingTemplate?.prize_description || '',
    venue_info: editingTemplate?.venue_info || '',
    is_public: editingTemplate?.is_public !== undefined ? editingTemplate.is_public : true,
    season: 'template' // 템플릿임을 명시
  });
  const [errors, setErrors] = useState({});

  const createMutation = useMutation({
    mutationFn: isEditing
      ? (data) => competitionAPI.update(editingTemplate.id, data)
      : competitionAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] });
      queryClient.invalidateQueries({ queryKey: ['templates'] });
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
    if (submitData.min_participants) {
      submitData.min_participants = parseInt(submitData.min_participants);
    }
    if (submitData.entry_fee) {
      submitData.entry_fee = parseFloat(submitData.entry_fee);
    }

    createMutation.mutate(submitData);
  };

  const handleReset = () => {
    if (!isEditing) {
      setFormData({
        name: '',
        competition_type: 'tournament',
        format: 'knockout',
        level: 'local',
        has_group_stage: false,
        group_stage_format: '',
        knockout_stage_format: '',
        description: '',
        rules: '',
        max_participants: '',
        min_participants: '',
        entry_fee: '',
        prize_description: '',
        venue_info: '',
        is_public: true,
        season: 'template'
      });
    }
    setErrors({});
  };

  const handleClose = () => {
    if (!createMutation.isPending) {
      handleReset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {isEditing ? '템플릿 수정' : '새 대회 템플릿 만들기'}
        </DialogTitle>

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
                label="템플릿 이름"
                value={formData.name}
                onChange={handleChange('name')}
                error={!!errors.name}
                helperText={errors.name}
                disabled={createMutation.isPending}
                placeholder="예: 지역 리그전 템플릿"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom color="primary">
                기본 설정
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required disabled={createMutation.isPending}>
                <InputLabel>대회 종류</InputLabel>
                <Select
                  value={formData.competition_type}
                  onChange={handleChange('competition_type')}
                  label="대회 종류"
                >
                  <MenuItem value="league">리그</MenuItem>
                  <MenuItem value="tournament">토너먼트</MenuItem>
                  <MenuItem value="cup">컵대회</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
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
                  <MenuItem value="group_knockout">조별예선+결승토너먼트</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth disabled={createMutation.isPending}>
                <InputLabel>대회 규모</InputLabel>
                <Select
                  value={formData.level}
                  onChange={handleChange('level')}
                  label="대회 규모"
                >
                  <MenuItem value="local">지역</MenuItem>
                  <MenuItem value="regional">광역</MenuItem>
                  <MenuItem value="national">전국</MenuItem>
                  <MenuItem value="international">국제</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
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
            </Grid>

            {formData.has_group_stage && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={createMutation.isPending}>
                  <InputLabel>조별 예선 방식</InputLabel>
                  <Select
                    value={formData.group_stage_format}
                    onChange={handleChange('group_stage_format')}
                    label="조별 예선 방식"
                  >
                    <MenuItem value="round_robin">조별 리그전</MenuItem>
                    <MenuItem value="single_elimination">조별 토너먼트</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            {(formData.format === 'knockout' || formData.format === 'mixed' || formData.format === 'group_knockout') && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={createMutation.isPending}>
                  <InputLabel>결승 토너먼트 방식</InputLabel>
                  <Select
                    value={formData.knockout_stage_format}
                    onChange={handleChange('knockout_stage_format')}
                    label="결승 토너먼트 방식"
                  >
                    <MenuItem value="single_elimination">단일 토너먼트</MenuItem>
                    <MenuItem value="double_elimination">더블 토너먼트</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom color="primary">
                참가 조건
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="최소 참가팀 수"
                value={formData.min_participants}
                onChange={handleChange('min_participants')}
                error={!!errors.min_participants}
                helperText={errors.min_participants}
                disabled={createMutation.isPending}
                inputProps={{ min: 2 }}
              />
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
                      checked={formData.is_public}
                      onChange={handleChange('is_public')}
                      disabled={createMutation.isPending}
                    />
                  }
                  label="공개 대회 (누구나 참가 신청 가능)"
                />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom color="primary">
                상세 정보
              </Typography>
              <Divider sx={{ mb: 2 }} />
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
                placeholder="대회의 목적과 특징을 설명해주세요"
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
                rows={2}
                label="경기장 정보"
                value={formData.venue_info}
                onChange={handleChange('venue_info')}
                error={!!errors.venue_info}
                helperText={errors.venue_info}
                disabled={createMutation.isPending}
                placeholder="경기장 위치, 시설 안내, 주차 정보 등..."
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
            {createMutation.isPending
              ? (isEditing ? '수정 중...' : '생성 중...')
              : (isEditing ? '템플릿 수정' : '템플릿 만들기')
            }
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateTemplateDialog;