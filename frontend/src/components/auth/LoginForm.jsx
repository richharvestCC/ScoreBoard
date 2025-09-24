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
  Divider,
  Stack,
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

const LoginForm = ({ onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    user_id: '',
    password: '',
  });
  const [validationError, setValidationError] = useState('');

  const { login, isLoginLoading, error, clearError } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (error) clearError();
    if (validationError) setValidationError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 입력 유효성 검사
    if (!formData.user_id.trim()) {
      setValidationError('아이디를 입력해주세요.');
      return;
    }
    if (!formData.password) {
      setValidationError('비밀번호를 입력해주세요.');
      return;
    }
    if (formData.password.length < 6) {
      setValidationError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    login(formData);
  };

  const handleSocialLogin = (provider) => {
    // 소셜 로그인 준비 중 메시지
    setValidationError(`${provider} 로그인은 준비 중입니다.`);
  };

  // 에러 메시지 개선
  const getErrorMessage = (error) => {
    if (error?.includes('Invalid credentials') || error?.includes('login failed')) {
      return '아이디 또는 비밀번호가 올바르지 않습니다. 다시 확인해주세요.';
    }
    if (error?.includes('User not found')) {
      return '존재하지 않는 아이디입니다. 아이디를 확인해주세요.';
    }
    if (error?.includes('Password')) {
      return '비밀번호가 올바르지 않습니다. 다시 입력해주세요.';
    }
    if (error?.includes('Network')) {
      return '네트워크 연결을 확인해주세요.';
    }
    return error || '로그인에 실패했습니다. 잠시 후 다시 시도해주세요.';
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        로그인
      </Typography>

      {(error || validationError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {validationError || getErrorMessage(error)}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          name="user_id"
          type="text"
          label="사용자 ID"
          value={formData.user_id}
          onChange={handleChange}
          margin="normal"
          required
          autoComplete="username"
          autoFocus
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
          autoComplete="current-password"
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={isLoginLoading}
        >
          {isLoginLoading ? (
            <CircularProgress size={24} />
          ) : (
            '로그인'
          )}
        </Button>

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="textSecondary">
            또는
          </Typography>
        </Divider>

        <Stack spacing={2} sx={{ mb: 3 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => handleSocialLogin('카카오')}
            sx={{
              py: 1.5,
              backgroundColor: '#FEE500',
              color: '#000000',
              borderColor: '#FEE500',
              '&:hover': {
                backgroundColor: '#FFEB3B',
                borderColor: '#FFEB3B',
              },
            }}
          >
            카카오 로그인
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => handleSocialLogin('구글')}
            sx={{
              py: 1.5,
              backgroundColor: '#ffffff',
              color: '#757575',
              borderColor: '#dadce0',
              '&:hover': {
                backgroundColor: '#f8f9fa',
                borderColor: '#dadce0',
              },
            }}
          >
            구글 로그인
          </Button>
        </Stack>

        <Box textAlign="center">
          <Typography variant="body2">
            계정이 없으신가요?{' '}
            <Link
              component="button"
              type="button"
              onClick={onSwitchToRegister}
              underline="hover"
            >
              회원가입
            </Link>
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default LoginForm;