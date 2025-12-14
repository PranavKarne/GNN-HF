/**
 * API Configuration
 * Centralized API base URL configuration
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  PROFILE: `${API_BASE_URL}/api/auth/profile`,
  
  // Predictions
  PREDICT: `${API_BASE_URL}/api/predict`,
  
  // Reports
  SAVE_REPORT: `${API_BASE_URL}/api/save-report`,
  GET_REPORTS: `${API_BASE_URL}/api/get-reports`,
  GET_REPORT: (id: string) => `${API_BASE_URL}/api/get-report/${id}`,
  DOWNLOAD_REPORT: (id: string) => `${API_BASE_URL}/api/download-report/${id}`,
  DELETE_REPORT: (id: string) => `${API_BASE_URL}/api/delete-report/${id}`,
  
  // Dashboard
  DASHBOARD_STATS: `${API_BASE_URL}/api/dashboard-stats`,
  
  // Other
  UPDATE_PASSWORD: `${API_BASE_URL}/api/update-password`,
};
