import { ApiResponse, HealthStatus } from '../types/api';
import { apiClient } from './api/client';

export async function fetchHealthStatus(): Promise<ApiResponse<HealthStatus>> {
  return apiClient.get<HealthStatus>('/health', { skipAuth: true });
}

export { apiClient } from './api/client';
export { ApiError } from './api/errors';
export { queryKeys } from './api/queryKeys';
