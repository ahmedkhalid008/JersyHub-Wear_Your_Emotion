import { useQuery } from '@tanstack/react-query';
import { fetchHealthStatus } from '../services/api';

export function useHealthCheck() {
  return useQuery({
    queryKey: ['health-check'],
    queryFn: fetchHealthStatus,
    refetchInterval: 30000,
  });
}
