import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import DOMPurify from 'dompurify';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert
} from '@mui/material';

// 보안 강화된 입력 검증 스키마
const secureFormSchema = yup.object({
  name: yup.string()
    .min(2, '최소 2자 이상 입력해주세요')
    .max(50, '최대 50자까지 입력 가능합니다')
    .matches(/^[a-zA-Z가-힣0-9\s\-_.]+$/, '허용되지 않은 특수문자가 포함되어 있습니다')
    .required('이름은 필수 입력 항목입니다'),

  email: yup.string()
    .email('올바른 이메일 형식을 입력해주세요')
    .max(100, '이메일은 100자 이하로 입력해주세요')
    .required('이메일은 필수 입력 항목입니다'),

  description: yup.string()
    .max(1000, '설명은 1000자 이하로 입력해주세요')
    .optional(),

  website: yup.string()
    .url('올바른 웹사이트 URL을 입력해주세요')
    .matches(/^https?:\/\//, 'http:// 또는 https://로 시작하는 URL만 허용됩니다')
    .optional()
});

interface SecureFormData {
  name: string;
  email: string;
  description?: string;
  website?: string;
}

interface SecureFormProps {
  onSubmit: (data: SecureFormData) => void;
  loading?: boolean;
  initialData?: Partial<SecureFormData>;
}

/**
 * XSS 방지 및 입력 검증이 강화된 보안 Form 컴포넌트
 */
const SecureForm: React.FC<SecureFormProps> = ({
  onSubmit,
  loading = false,
  initialData = {}
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue
  } = useForm<SecureFormData>({
    resolver: yupResolver(secureFormSchema),
    defaultValues: {
      name: initialData.name || '',
      email: initialData.email || '',
      description: initialData.description || '',
      website: initialData.website || ''
    },
    mode: 'onChange'
  });

  // XSS 방지를 위한 입력값 sanitization
  const sanitizeInput = (value: string): string => {
    return DOMPurify.sanitize(value, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      STRIP_COMMENTS: true
    });
  };

  // 폼 제출 핸들러
  const onFormSubmit = (data: SecureFormData) => {
    // 모든 입력값을 sanitize
    const sanitizedData: SecureFormData = {
      name: sanitizeInput(data.name),
      email: sanitizeInput(data.email),
      description: data.description ? sanitizeInput(data.description) : undefined,
      website: data.website ? sanitizeInput(data.website) : undefined
    };

    onSubmit(sanitizedData);
  };

  // 실시간 입력값 검증 및 sanitization
  const handleInputChange = (fieldName: keyof SecureFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const sanitized = sanitizeInput(event.target.value);
    setValue(fieldName, sanitized, { shouldValidate: true });
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onFormSubmit)} noValidate>
      <Typography variant="h6" gutterBottom>
        보안 강화 폼 예제
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        이 폼은 XSS 방지와 입력 검증이 적용된 보안 강화 컴포넌트입니다.
      </Alert>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* 이름 필드 */}
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="이름"
              fullWidth
              error={!!errors.name}
              helperText={errors.name?.message}
              onChange={handleInputChange('name')}
              inputProps={{
                maxLength: 50,
                'aria-describedby': errors.name ? 'name-error' : undefined
              }}
            />
          )}
        />

        {/* 이메일 필드 */}
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="이메일"
              type="email"
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
              onChange={handleInputChange('email')}
              inputProps={{
                maxLength: 100,
                'aria-describedby': errors.email ? 'email-error' : undefined
              }}
            />
          )}
        />

        {/* 설명 필드 */}
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="설명 (선택사항)"
              multiline
              rows={3}
              fullWidth
              error={!!errors.description}
              helperText={errors.description?.message || `${watch('description')?.length || 0}/1000자`}
              onChange={handleInputChange('description')}
              inputProps={{
                maxLength: 1000,
                'aria-describedby': errors.description ? 'description-error' : undefined
              }}
            />
          )}
        />

        {/* 웹사이트 필드 */}
        <Controller
          name="website"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="웹사이트 (선택사항)"
              fullWidth
              placeholder="https://example.com"
              error={!!errors.website}
              helperText={errors.website?.message}
              onChange={handleInputChange('website')}
              inputProps={{
                'aria-describedby': errors.website ? 'website-error' : undefined
              }}
            />
          )}
        />

        {/* 제출 버튼 */}
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={!isValid || loading}
          sx={{ mt: 2 }}
        >
          {loading ? '처리 중...' : '제출'}
        </Button>
      </Box>
    </Box>
  );
};

export default SecureForm;