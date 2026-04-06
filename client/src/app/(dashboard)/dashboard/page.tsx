'use client';

import { useState } from 'react';
import { Plus, ClipboardList, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import { Task } from '@/types';
import TaskCard from '@/components/tasks/TaskCard';
import TaskFilters from '@/components/tasks/TaskFilters';
import TaskFormModal from '@/components/tasks/TaskFormModal';
import Pagination from '@/components/tasks/Pagination';

export default function DashboardPage() {
  const { user } = useAuth();
  const {
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
  } = useTasks();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const openCreate = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSubmit = async (data: Partial<Task>) => {
    if (editingTask) {
      await updateTask(editingTask.id, data);
    } else {
      await createTask(data as Parameters<typeof createTask>[0]);
    }
  };

  // Stats derived from current page (rough totals shown as pills)
  const pending = tasks.filter((t) => t.status === 'PENDING').length;
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
  const total = pagination?.totalCount ?? tasks.length;

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
            {user ? `Hey, ${user.name.split(' ')[0]} 👋` : 'My Tasks'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {total === 0 ? 'No tasks yet — create your first one.' : `${total} task${total !== 1 ? 's' : ''} in total`}
          </p>
        </div>

        <button onClick={openCreate} className="btn-primary shrink-0">
          <Plus size={15} />
          <span>New task</span>
        </button>
      </div>

      {/* Status stat pills */}
      {tasks.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-5">
          {[
            { label: 'Total', count: total, icon: ClipboardList, color: 'var(--text-secondary)', bg: 'var(--bg-elevated)' },
            { label: 'Pending', count: pending, icon: Clock, color: 'var(--text-muted)', bg: 'var(--bg-elevated)' },
            { label: 'In Progress', count: inProgress, icon: AlertCircle, color: 'var(--warning)', bg: 'var(--warning-muted)' },
            { label: 'Done', count: completed, icon: CheckCircle2, color: 'var(--success)', bg: 'var(--success-muted)' },
          ].map(({ label, count, icon: Icon, color, bg }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: bg, color }}
            >
              <Icon size={12} />
              {label}: {count}
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div
        className="card p-3.5 mb-4"
        style={{ borderColor: 'var(--border)' }}
      >
        <TaskFilters
          filters={filters}
          onUpdate={updateFilters}
          totalCount={pagination?.totalCount ?? 0}
        />
      </div>

      {/* Task list */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="card p-4 animate-pulse"
              style={{ height: 88, borderColor: 'var(--border)' }}
            />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div
          className="card p-12 text-center"
          style={{ borderColor: 'var(--border)', borderStyle: 'dashed' }}
        >
          <ClipboardList size={40} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
            {filters.search || filters.status || filters.priority
              ? 'No tasks match your filters'
              : 'No tasks yet'}
          </p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
            {filters.search || filters.status || filters.priority
              ? 'Try adjusting your search or filters.'
              : 'Click "New task" to get started.'}
          </p>
          {(filters.search || filters.status || filters.priority) && (
            <button
              onClick={() => updateFilters({ search: '', status: '', priority: '' })}
              className="btn-ghost text-xs mx-auto"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={openEdit}
              onDelete={deleteTask}
              onToggle={toggleTask}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            pagination={pagination}
            onPageChange={(page) => updateFilters({ page })}
          />
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <TaskFormModal
          task={editingTask}
          onClose={() => { setModalOpen(false); setEditingTask(null); }}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}
    </>
  );
}
