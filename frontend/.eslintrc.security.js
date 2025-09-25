// Frontend 보안 강화를 위한 ESLint 설정
module.exports = {
  extends: [
    'react-app',
    'react-app/jest',
    'plugin:security/recommended'
  ],
  plugins: ['security'],
  rules: {
    // 보안 관련 규칙들
    'security/detect-sql-injection': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-non-literal-fs-filename': 'warn',
    'security/detect-unsafe-regex': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'error',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-non-literal-require': 'warn',
    'security/detect-object-injection': 'error',
    'security/detect-possible-timing-attacks': 'error',
    'security/detect-pseudoRandomBytes': 'error',

    // React 보안 관련 추가 규칙
    'react/no-danger': 'error', // dangerouslySetInnerHTML 사용 금지
    'react/no-danger-with-children': 'error',

    // 콘솔 로그 보안 검사
    'no-console': ['warn', {
      allow: ['warn', 'error'] // console.log 경고, warn/error만 허용
    }],

    // 하드코딩된 비밀번호/키 검사
    'security/detect-hardcoded-password': 'error',

    // 기타 보안 관련
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error'
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/*.test.tsx', '**/*.spec.js', '**/*.spec.tsx'],
      rules: {
        // 테스트 파일에서는 일부 보안 규칙 완화
        'security/detect-non-literal-fs-filename': 'off',
        'no-console': 'off'
      }
    }
  ]
};