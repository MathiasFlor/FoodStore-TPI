import { axiosInstance } from '@/shared/api/axiosInstance';
import type { MessageResponse, UserCreate, UserPublic } from '../types/auth.types';

export const authApi = {
  register: async (payload: UserCreate): Promise<UserPublic> => {
    const { data } = await axiosInstance.post<UserPublic>('/auth/register', payload);
    return data;
  },

  login: async (username: string, password: string): Promise<MessageResponse> => {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    const { data } = await axiosInstance.post<MessageResponse>('/auth/token', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return data;
  },

  logout: async (): Promise<MessageResponse> => {
    const { data } = await axiosInstance.post<MessageResponse>('/auth/logout');
    return data;
  },

  me: async (): Promise<UserPublic> => {
    const { data } = await axiosInstance.get<UserPublic>('/auth/me');
    return data;
  },
};