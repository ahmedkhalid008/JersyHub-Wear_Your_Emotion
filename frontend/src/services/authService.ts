import { apiClient } from './api/client';
import { ApiResponse } from '../types/api';
import { User } from '../types/user';
import { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';

export const authService = {
  async register(userData: RegisterRequest): Promise<User> {
    const response: ApiResponse<User> = await apiClient.post<User>('/auth/register', userData, { skipAuth: true });
    return response.data;
  },

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response: ApiResponse<AuthResponse> = await apiClient.post<AuthResponse>('/auth/login', credentials, { skipAuth: true });
    return response.data;
  },

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const response: ApiResponse<AuthResponse> = await apiClient.post<AuthResponse>(
      '/auth/refresh',
      { refreshToken },
      { skipAuth: true }
    );
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response: ApiResponse<User> = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  async logout(refreshToken?: string): Promise<void> {
    try {
      await apiClient.post<void>('/auth/logout', refreshToken ? { refreshToken } : {});
    } catch {
      // Ignore network/authorization failure on logout endpoint so client state is always cleared
    }
  },
};
