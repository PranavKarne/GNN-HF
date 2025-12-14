/**
 * API utility functions
 * Handles authentication headers and common fetch patterns
 */

import { API_ENDPOINTS } from './api';

/**
 * Get authentication headers
 */
export const getAuthHeaders = (options: { contentType?: boolean } = {}): HeadersInit => {
  const token = localStorage.getItem('token');
  
  return {
    ...(options.contentType ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

/**
 * Get auth headers for FormData (no Content-Type)
 */
export const getAuthHeadersForFormData = (): HeadersInit => {
  const token = localStorage.getItem('token');
  
  return {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

/**
 * Generic API fetch with auth
 */
export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const defaultHeaders = getAuthHeaders();
  const hasJsonBody = options.body && !(options.body instanceof FormData);
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(hasJsonBody ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
};

/**
 * Logout and redirect to login
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('email');
  localStorage.removeItem('patientId');
  window.location.href = '/login';
};
