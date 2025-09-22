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
  Alert
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clubAPI } from '../../services/api';

const CreateClubDialog = ({ open, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    founded_year: '',
    logo_url: '',
    contact_email: '',
    contact_phone: '',
    club_type: 'general'
  });
  const [errors, setErrors] = useState({});

  const createMutation = useMutation({
    mutationFn: clubAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['clubs']);
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
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
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

    const submitData = { ...formData };
    if (submitData.founded_year === '') {
      delete submitData.founded_year;
    }
    if (submitData.logo_url === '') {
      delete submitData.logo_url;
    }
    if (submitData.contact_email === '') {
      delete submitData.contact_email;
    }
    if (submitData.contact_phone === '') {
      delete submitData.contact_phone;
    }
    if (submitData.description === '') {
      delete submitData.description;
    }
    if (submitData.location === '') {
      delete submitData.location;
    }

    createMutation.mutate(submitData);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      description: '',
      location: '',
      founded_year: '',
      logo_url: '',
      contact_email: '',
      contact_phone: '',
      club_type: 'general'
    });
    setErrors({});
  };

  const handleClose = () => {
    if (!createMutation.isLoading) {
      handleReset();
      onClose();
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>새 클럽 만들기</DialogTitle>

        <DialogContent>
          {createMutation.isError && createMutation.error?.response?.data?.message && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {createMutation.error.response.data.message}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="클럽 이름"
                value={formData.name}
                onChange={handleChange('name')}
                error={!!errors.name}
                helperText={errors.name}
                disabled={createMutation.isLoading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required disabled={createMutation.isLoading}>
                <InputLabel>클럽 유형</InputLabel>
                <Select
                  value={formData.club_type}
                  onChange={handleChange('club_type')}
                  label="클럽 유형"
                >
                  <MenuItem value="general">일반</MenuItem>
                  <MenuItem value="pro">프로</MenuItem>
                  <MenuItem value="youth">유스</MenuItem>
                  <MenuItem value="national">국가대표</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="클럽 소개"
                value={formData.description}
                onChange={handleChange('description')}
                error={!!errors.description}
                helperText={errors.description}
                disabled={createMutation.isLoading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="위치"
                value={formData.location}
                onChange={handleChange('location')}
                error={!!errors.location}
                helperText={errors.location}
                disabled={createMutation.isLoading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="창단 연도"
                value={formData.founded_year}
                onChange={handleChange('founded_year')}
                error={!!errors.founded_year}
                helperText={errors.founded_year}
                disabled={createMutation.isLoading}
                inputProps={{
                  min: 1800,
                  max: currentYear
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="로고 URL"
                value={formData.logo_url}
                onChange={handleChange('logo_url')}
                error={!!errors.logo_url}
                helperText={errors.logo_url}
                disabled={createMutation.isLoading}
                placeholder="https://example.com/logo.png"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="email"
                label="연락처 이메일"
                value={formData.contact_email}
                onChange={handleChange('contact_email')}
                error={!!errors.contact_email}
                helperText={errors.contact_email}
                disabled={createMutation.isLoading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="연락처 전화번호"
                value={formData.contact_phone}
                onChange={handleChange('contact_phone')}
                error={!!errors.contact_phone}
                helperText={errors.contact_phone}
                disabled={createMutation.isLoading}
                placeholder="010-1234-5678"
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
            disabled={createMutation.isLoading || !formData.name.trim()}
            startIcon={createMutation.isLoading ? <CircularProgress size={16} /> : null}
          >
            {createMutation.isLoading ? '생성 중...' : '클럽 만들기'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateClubDialog;