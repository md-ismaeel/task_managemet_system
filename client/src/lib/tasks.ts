import api from './api';
import { Task, TasksResponse, TaskFilters } from '@/types';

export const tasksApi = {
  getAll: async (filters: Partial<TaskFilters>): Promise<TasksResponse> => {
    const params = new URLSearchParams();
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.priority) params.set('priority', filters.priority);
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

    const { data } = await api.get(`/tasks?${params.toString()}`);
    return data.data;
  },

  getById: async (id: string): Promise<Task> => {
    const { data } = await api.get(`/tasks/${id}`);
    return data.data.task;
  },

  create: async (payload: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: string | null;
  }): Promise<Task> => {
    const { data } = await api.post('/tasks', payload);
    return data.data.task;
  },

  update: async (
    id: string,
    payload: {
      title?: string;
      description?: string | null;
      status?: string;
      priority?: string;
      dueDate?: string | null;
    }
  ): Promise<Task> => {
    const { data } = await api.patch(`/tasks/${id}`, payload);
    return data.data.task;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  toggle: async (id: string): Promise<Task> => {
    const { data } = await api.patch(`/tasks/${id}/toggle`);
    return data.data.task;
  },
};
