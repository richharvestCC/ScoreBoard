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
  CircularProgress,
  Alert,
  Typography,
  Divider,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { competitionAPI } from '../../services/api';
import { removeEmptyFields } from '../../utils/formHelpers';

const CreateFromTemplateDialog = ({ open, onClose, onSuccess, template = null }) => {
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    name: '',
    season: currentYear.toString(),
    start_date: '',
    end_date: '',
    registration_start: '',
    registration_end: '',
    description: template?.description || '',
    venue_info: template?.venue_info || ''
  });
  const [errors, setErrors] = useState({});

  const createMutation = useMutation({
    mutationFn: (data) => competitionAPI.createFromTemplate(template.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['competitions']);
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
    const value = event.target.value;
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

    createMutation.mutate(submitData);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      season: currentYear.toString(),
      start_date: '',
      end_date: '',
      registration_start: '',
      registration_end: '',
      description: template?.description || '',
      venue_info: template?.venue_info || ''
    });
    setErrors({});
  };

  const handleClose = () => {
    if (!createMutation.isLoading) {
      handleReset();
      onClose();
    }
  };

  const getCompetitionTypeLabel = (type) => {
    const types = {
      league: '리그',
      tournament: '토너먼트',
      cup: '컵대회'
    };
    return types[type] || type;
  };

  const getFormatLabel = (format) => {
    const formats = {
      round_robin: '리그전',
      knockout: '토너먼트',
      mixed: '혼합',
      group_knockout: '조별예선+결승토너먼트'
    };
    return formats[format] || format;
  };

  if (!template) {
    return null;
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>템플릿으로 대회 만들기</DialogTitle>

        <DialogContent>
          {createMutation.isError && createMutation.error?.response?.data?.message && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {createMutation.error.response.data.message}
            </Alert>
          )}

          {/* 템플릿 정보 표시 */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                선택된 템플릿: {template.name}
              </Typography>
              <Box display="flex" gap={1} mb={1} flexWrap="wrap">
                <Chip
                  label={getCompetitionTypeLabel(template.competition_type)}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={getFormatLabel(template.format)}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                {template.max_participants && (
                  <Chip
                    label={`최대 ${template.max_participants}팀`}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                )}
              </Box>
              {template.description && (
                <Typography variant="body2" color="text.secondary">
                  {template.description}
                </Typography>
              )}
            </CardContent>
          </Card>

          <Typography variant="subtitle1" gutterBottom color="primary">
            대회 기본 정보
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="대회 이름"
                value={formData.name}
                onChange={handleChange('name')}
                error={!!errors.name}
                helperText={errors.name}
                disabled={createMutation.isLoading}
                placeholder={`${template.name} ${currentYear}`}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="시즌"
                value={formData.season}
                onChange={handleChange('season')}
                error={!!errors.season}
                helperText={errors.season}
                disabled={createMutation.isLoading}
                placeholder={`${currentYear}, ${currentYear}-Spring 등`}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom color="primary" sx={{ mt: 2 }}>
                대회 일정
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="대회 시작일"
                value={formData.start_date}
                onChange={handleChange('start_date')}
                error={!!errors.start_date}
                helperText={errors.start_date}
                disabled={createMutation.isLoading}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: today }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="대회 종료일"
                value={formData.end_date}
                onChange={handleChange('end_date')}
                error={!!errors.end_date}
                helperText={errors.end_date}
                disabled={createMutation.isLoading}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: formData.start_date || today }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="참가신청 시작일"
                value={formData.registration_start}
                onChange={handleChange('registration_start')}
                error={!!errors.registration_start}
                helperText={errors.registration_start}
                disabled={createMutation.isLoading}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: today, max: formData.start_date }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="참가신청 마감일"
                value={formData.registration_end}
                onChange={handleChange('registration_end')}
                error={!!errors.registration_end}
                helperText={errors.registration_end}
                disabled={createMutation.isLoading}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: formData.registration_start || today,
                  max: formData.start_date
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom color="primary" sx={{ mt: 2 }}>
                대회 상세 정보 (선택사항)
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
                helperText={errors.description || "템플릿 설명을 기본값으로 사용하거나 수정할 수 있습니다"}
                disabled={createMutation.isLoading}
                placeholder="이번 대회만의 특별한 정보를 추가해주세요"
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
                disabled={createMutation.isLoading}
                placeholder="구체적인 경기장 위치, 주차 정보, 교통편 등"
              />
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mt: 2 }}>
            템플릿의 대회 규정, 상금 정보, 참가 조건 등은 자동으로 적용됩니다.
            대회 생성 후 수정 페이지에서 세부 조정이 가능합니다.
          </Alert>
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
            disabled={createMutation.isLoading || !formData.name.trim()}
            startIcon={createMutation.isLoading ? <CircularProgress size={16} /> : null}
          >
            {createMutation.isLoading ? '대회 생성 중...' : '대회 만들기'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateFromTemplateDialog;