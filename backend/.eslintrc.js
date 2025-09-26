// Backend 보안 강화를 위한 ESLint 설정
module.exports = {
  env: {
    node: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:security/recommended'
  ],
  plugins: ['security'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // 보안 관련 Critical 규칙들
    'security/detect-sql-injection': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-non-literal-fs-filename': 'error',
    'security/detect-unsafe-regex': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'warn', // 필요시 사용할 수 있으므로 warn
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-non-literal-require': 'warn',
    'security/detect-object-injection': 'error',
    'security/detect-possible-timing-attacks': 'error',
    'security/detect-pseudoRandomBytes': 'error',
    'security/detect-hardcoded-password': 'error',

    // JavaScript 보안 기본 규칙들
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',

    // 민감한 정보 로깅 방지
    'no-console': ['warn', {
      allow: ['warn', 'error'] // console.log 경고, warn/error만 허용
    }],

    // 기타 보안 관련
    'no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    'prefer-const': 'error',
    'no-var': 'error'
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/*.spec.js'],
      rules: {
        // 테스트 파일에서는 일부 보안 규칙 완화
        'security/detect-non-literal-fs-filename': 'off',
        'no-console': 'off'
      }
    },
    {
      files: ['scripts/**/*.js', 'migrations/**/*.js', 'seeders/**/*.js'],
      rules: {
        // 마이그레이션/시드 파일에서는 일부 규칙 완화
        'security/detect-non-literal-fs-filename': 'off',
        'no-console': 'off'
      }
    }
  ]
};