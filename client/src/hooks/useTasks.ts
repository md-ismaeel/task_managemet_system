'use client';

import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { tasksApi } from '@/lib/tasks';
import { Task, TaskFilters, Pagination } from '@/types';

const DEFAULT_FILTERS: TaskFilters = {
  search: '',
  status: '',
  priority: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  limit: 10,
};

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [filters, setFilters] = useState<TaskFilters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = useCallback(async (f: TaskFilters) => {
    setLoading(true);
    try {
      const res = await tasksApi.getAll(f);
      setTasks(res.tasks);
      setPagination(res.pagination);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks(filters);
  }, [filters, fetchTasks]);

  const updateFilters = useCallback((updates: Partial<TaskFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates, page: updates.page ?? 1 }));
  }, []);

  const createTask = useCallback(
    async (payload: Omit<Partial<Task>, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & { title: string }) => {
      setSubmitting(true);
      try {
        const task = await tasksApi.create({
          title: payload.title,
          description: payload.description ?? undefined,
          status: payload.status,
          priority: payload.priority,
          dueDate: payload.dueDate ?? undefined,
        });
        toast.success('Task created!');
        await fetchTasks(filters);
        return task;
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to create task';
        toast.error(msg);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [filters, fetchTasks]
  );

  const updateTask = useCallback(
    async (id: string, payload: Partial<Task>) => {
      console.log('useTasks updateTask called:', id, payload);
      setSubmitting(true);
      try {
        const task = await tasksApi.update(id, payload);
        console.log('updateTask API response:', task);
        setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
        toast.success('Task updated!');
        return task;
      } catch (err: unknown) {
        console.error('updateTask error:', err);
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to update task';
        toast.error(msg);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  const deleteTask = useCallback(
    async (id: string) => {
      console.log('useTasks deleteTask called:', id);
      setSubmitting(true);
      try {
        await tasksApi.delete(id);
        console.log('deleteTask API success');
        setTasks((prev) => prev.filter((t) => t.id !== id));
        if (pagination) {
          setPagination((prev) =>
            prev ? { ...prev, totalCount: prev.totalCount - 1 } : prev
          );
        }
        toast.success('Task deleted');
      } catch (err) {
        console.error('deleteTask error:', err);
        toast.error('Failed to delete task');
      } finally {
        setSubmitting(false);
      }
    },
    [pagination]
  );

  const toggleTask = useCallback(async (id: string) => {
    try {
      const updated = await tasksApi.toggle(id);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      toast.success(`Status → ${updated.status.replace('_', ' ')}`);
    } catch {
      toast.error('Failed to update status');
    }
  }, []);

  return {
    tasks,
    pagination,
    filters,
    loading,
    submitting,
    updateFilters,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    refresh: () => fetchTasks(filters),
  };
};
