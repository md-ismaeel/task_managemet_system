import api from './api';
import { AuthResponse } from '@/types';

export const authApi = {
  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/register', { name, email, password });
    return data.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/login', { email, password });
    return data.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout', {});
  },
};
