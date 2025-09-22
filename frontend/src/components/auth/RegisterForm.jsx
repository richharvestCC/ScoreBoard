import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

const RegisterForm = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    user_id: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    birthdate: '',
    gender: '',
    phone_number: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const { register, isRegisterLoading, error, clearError } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear field-specific error
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }

    if (error) clearError();
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.user_id || formData.user_id.length < 3) {
      errors.user_id = '사용자 ID는 3자 이상이어야 합니다';
    }

    if (!formData.email) {
      errors.email = '이메일은 필수입니다';
    }

    if (!formData.password || formData.password.length < 6) {
      errors.password = '비밀번호는 6자 이상이어야 합니다';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }

    if (!formData.name) {
      errors.name = '이름은 필수입니다';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Remove confirmPassword before sending to API
    const { confirmPassword, ...submitData } = formData;

    register(submitData);
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        회원가입
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          name="user_id"
          label="사용자 ID"
          value={formData.user_id}
          onChange={handleChange}
          margin="normal"
          required
          autoComplete="username"
          error={!!formErrors.user_id}
          helperText={formErrors.user_id}
          autoFocus
        />

        <TextField
          fullWidth
          name="email"
          type="email"
          label="이메일"
          value={formData.email}
          onChange={handleChange}
          margin="normal"
          required
          autoComplete="email"
          error={!!formErrors.email}
          helperText={formErrors.email}
        />

        <TextField
          fullWidth
          name="name"
          label="이름"
          value={formData.name}
          onChange={handleChange}
          margin="normal"
          required
          autoComplete="name"
          error={!!formErrors.name}
          helperText={formErrors.name}
        />

        <TextField
          fullWidth
          name="password"
          type="password"
          label="비밀번호"
          value={formData.password}
          onChange={handleChange}
          margin="normal"
          required
          autoComplete="new-password"
          error={!!formErrors.password}
          helperText={formErrors.password}
        />

        <TextField
          fullWidth
          name="confirmPassword"
          type="password"
          label="비밀번호 확인"
          value={formData.confirmPassword}
          onChange={handleChange}
          margin="normal"
          required
          autoComplete="new-password"
          error={!!formErrors.confirmPassword}
          helperText={formErrors.confirmPassword}
        />

        <TextField
          fullWidth
          name="birthdate"
          type="date"
          label="생년월일"
          value={formData.birthdate}
          onChange={handleChange}
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>성별</InputLabel>
          <Select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            label="성별"
          >
            <MenuItem value="">선택안함</MenuItem>
            <MenuItem value="M">남성</MenuItem>
            <MenuItem value="F">여성</MenuItem>
            <MenuItem value="OTHER">기타</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          name="phone_number"
          label="전화번호"
          value={formData.phone_number}
          onChange={handleChange}
          margin="normal"
          autoComplete="tel"
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={isRegisterLoading}
        >
          {isRegisterLoading ? (
            <CircularProgress size={24} />
          ) : (
            '가입하기'
          )}
        </Button>

        <Box textAlign="center">
          <Typography variant="body2">
            이미 계정이 있으신가요?{' '}
            <Link
              component="button"
              type="button"
              onClick={onSwitchToLogin}
              underline="hover"
            >
              로그인
            </Link>
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default RegisterForm;