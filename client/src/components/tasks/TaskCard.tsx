'use client';

import { useState } from 'react';
import { Calendar, Pencil, Trash2, MoreVertical, RefreshCw } from 'lucide-react';
import { Task } from '@/types';
import { format } from 'date-fns';
import clsx from 'clsx';

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'var(--text-muted)', bg: 'var(--bg-elevated)', border: 'var(--border)' },
  IN_PROGRESS: { label: 'In Progress', color: 'var(--warning)', bg: 'var(--warning-muted)', border: 'var(--warning)' },
  COMPLETED: { label: 'Completed', color: 'var(--success)', bg: 'var(--success-muted)', border: 'var(--success)' },
};

const PRIORITY_CONFIG = {
  LOW: { label: 'Low', color: 'var(--info)', dot: '#60a5fa' },
  MEDIUM: { label: 'Medium', color: 'var(--warning)', dot: '#fbbf24' },
  HIGH: { label: 'High', color: 'var(--danger)', dot: '#f87171' },
};

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

export default function TaskCard({ task, onEdit, onDelete, onToggle }: TaskCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const status = STATUS_CONFIG[task.status];
  const priority = PRIORITY_CONFIG[task.priority];

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(task.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
    setMenuOpen(false);
  };

  return (
    <div
      className={clsx(
        'card p-4 flex flex-col gap-3 transition-all duration-200 group',
        task.status === 'COMPLETED' && 'opacity-70'
      )}
      style={{ borderLeft: `3px solid ${status.border}` }}
    >
      {/* Top row: title + menu */}
      <div className="flex items-start gap-3">
        {/* Priority dot */}
        <div
          className="mt-1 w-2 h-2 rounded-full shrink-0"
          style={{ background: priority.dot }}
          title={`Priority: ${priority.label}`}
        />

        <div className="flex-1 min-w-0">
          <h3
            className={clsx('font-medium text-sm leading-snug', task.status === 'COMPLETED' && 'line-through')}
            style={{ color: 'var(--text-primary)' }}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className="mt-1 text-xs line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {task.description}
            </p>
          )}
        </div>

        {/* Context menu */}
        <div className="relative shrink-0">
          <button
            onClick={() => { console.log('Menu button clicked'); setMenuOpen((v) => !v); }}
            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: 'var(--text-muted)' }}
            onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
          >
            <MoreVertical size={15} />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-7 z-20 w-36 rounded-xl shadow-2xl py-1 animate-fade-in"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
            >
              <button
                onClick={() => { console.log('Edit clicked', task.id); onEdit(task); setMenuOpen(false); }}
                className="w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 transition-colors hover:bg-white/5"
                style={{ color: 'var(--text-secondary)' }}
              >
                <Pencil size={12} /> Edit
              </button>
              <button
                onClick={() => { console.log('Toggle clicked', task.id); onToggle(task.id); setMenuOpen(false); }}
                className="w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 transition-colors hover:bg-white/5"
                style={{ color: 'var(--text-secondary)' }}
              >
                <RefreshCw size={12} /> Toggle status
              </button>
              <div className="my-1" style={{ borderTop: '1px solid var(--border)' }} />
              <button
                onClick={() => { console.log('Delete clicked', task.id); handleDelete(); }}
                className="w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 transition-colors hover:bg-white/5"
                style={{ color: confirmDelete ? 'var(--danger)' : 'var(--text-secondary)' }}
              >
                <Trash2 size={12} />
                {confirmDelete ? 'Click to confirm' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row: status + priority + due date */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Status badge */}
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium"
          style={{ background: status.bg, color: status.color, border: `1px solid ${status.border}30` }}
        >
          {status.label}
        </span>

        {/* Priority badge */}
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-md text-xs"
          style={{ color: priority.color, background: `${priority.dot}15` }}
        >
          {priority.label}
        </span>

        {/* Due date */}
        {task.dueDate && (
          <span
            className="ml-auto inline-flex items-center gap-1 text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            <Calendar size={11} />
            {format(new Date(task.dueDate), 'MMM d, yyyy')}
          </span>
        )}
      </div>
    </div>
  );
}
