// Environment Configuration
export const env = {
  // Base API URL (support Vite and CRA envs). Ensure trailing /api is preserved.
  API_BASE_URL: (() => {
    const vite = (typeof import.meta !== 'undefined' && (import.meta as any).env) ? (import.meta as any).env.VITE_API_BASE_URL : undefined;
    const cra = typeof process !== 'undefined' ? (process.env as any)?.REACT_APP_API_BASE_URL : undefined;
    const raw = vite || cra || 'http://edu-solutions-platform.test';
    const base = String(raw).replace(/\/+$/, '');
    // Accept both /api and /api/v1 if explicitly provided, otherwise default to /api (matches Laravel routes in this repo)
    if (base.endsWith('/api') || base.endsWith('/api/v1')) return base;
    return `${base}/api/v1`;
  })(),

  // Realtime endpoints (optional)
  WS_URL: (() => {
    const vite = (typeof import.meta !== 'undefined' && (import.meta as any).env)?.VITE_WS_URL;
    const cra = typeof process !== 'undefined' ? (process.env as any)?.REACT_APP_WS_URL : undefined;
    return vite || cra || '';
  })(),
  SSE_URL: (() => {
    const vite = (typeof import.meta !== 'undefined' && (import.meta as any).env)?.VITE_SSE_URL;
    const cra = typeof process !== 'undefined' ? (process.env as any)?.REACT_APP_SSE_URL : undefined;
    return vite || cra || '';
  })(),

  // Error monitoring (optional)
  SENTRY_DSN: (() => {
    const vite = (typeof import.meta !== 'undefined' && (import.meta as any).env)?.VITE_SENTRY_DSN;
    const cra = typeof process !== 'undefined' ? (process.env as any)?.REACT_APP_SENTRY_DSN : undefined;
    return vite || cra || '';
  })(),

  // Tuning
  REFETCH_THROTTLE_MS: (() => {
    const vite = Number((typeof import.meta !== 'undefined' && (import.meta as any).env)?.VITE_REFETCH_THROTTLE_MS);
    const cra = Number(typeof process !== 'undefined' ? (process.env as any)?.REACT_APP_REFETCH_THROTTLE_MS : undefined);
    return Number.isFinite(vite) && vite > 0 ? vite : (Number.isFinite(cra) && cra > 0 ? cra : 30000);
  })(),

  // Application environment
  NODE_ENV: (typeof process !== 'undefined' ? process.env.NODE_ENV : (typeof import.meta !== 'undefined' ? (import.meta as any).env?.MODE : 'development')) || 'development',

  // Authentication settings
  TOKEN_STORAGE_KEY: 'auth_token',
  USER_STORAGE_KEY: 'user_data',

  // Upload settings
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],

  // Pagination settings
  DEFAULT_PAGE_SIZE: 15,

  // App settings
  APP_NAME: 'منصة الحلول التعليمية',
  APP_VERSION: '1.0.0',

  // Development settings
  IS_DEVELOPMENT: ((typeof process !== 'undefined' ? process.env.NODE_ENV : undefined) || (typeof import.meta !== 'undefined' ? (import.meta as any).env?.MODE : 'development')) === 'development',
  IS_PRODUCTION: ((typeof process !== 'undefined' ? process.env.NODE_ENV : undefined) || (typeof import.meta !== 'undefined' ? (import.meta as any).env?.MODE : 'development')) === 'production',
};
