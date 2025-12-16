/**
 * API utility functions
 * Handles authentication headers and common fetch patterns
 */

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
 * Logout and redirect to login
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('email');
  localStorage.removeItem('patientId');
  window.location.href = '/login';
};
