declare const __API_BASE_URL__: string;

const normalizedApiBaseUrl = __API_BASE_URL__.replace(/\/+$/, '');

export const API_BASE_URL = normalizedApiBaseUrl.endsWith('/api') || normalizedApiBaseUrl.endsWith('/api/v1')
  ? normalizedApiBaseUrl
  : `${normalizedApiBaseUrl}/api/v1`;
