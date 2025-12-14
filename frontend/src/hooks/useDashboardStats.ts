import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/config/api';
import { getAuthHeaders } from '@/config/apiUtils';

interface DashboardStats {
  totalReports: number;
  highRisk: number;
  moderateRisk: number;
  lowRisk: number;
  totalPatients: number;
}

interface DashboardData {
  stats: DashboardStats;
  latestReport: any | null;
}

interface DashboardResponse {
  status: string;
  stats: DashboardStats;
  latestReport?: any;
}

const fetchDashboardStats = async (): Promise<DashboardData> => {
  const response = await fetch(API_ENDPOINTS.DASHBOARD_STATS, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: DashboardResponse = await response.json();

  if (data.status !== 'success') {
    throw new Error(data.message || 'Failed to load dashboard stats');
  }

  return {
    stats: data.stats,
    latestReport: data.latestReport || null
  };
};

export const useDashboardStats = (options?: Omit<UseQueryOptions<DashboardData, Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery<DashboardData, Error>({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options
  });
};
