import { Response } from 'express';
import { z } from 'zod';
import { Like } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Task, TaskStatus, Priority } from '../entity/Task';
import { AuthenticatedRequest, TaskQuery } from '../types';

// ─── Validation Schemas ────────────────────────────────────────────────────
const VALID_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED'] as const;
const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(2000, 'Description too long').nullable().optional(),
  status: z.enum(VALID_STATUSES).optional().default('PENDING'),
  priority: z.enum(VALID_PRIORITIES).optional().default('MEDIUM'),
  dueDate: z.string().datetime({ offset: true }).nullable().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  status: z.enum(VALID_STATUSES).optional(),
  priority: z.enum(VALID_PRIORITIES).optional(),
  dueDate: z.string().datetime({ offset: true }).nullable().optional(),
});

// ─── GET /tasks ────────────────────────────────────────────────────────────
export const getTasks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const query = req.query as TaskQuery;

    // Pagination
    const page = Math.max(1, parseInt(query.page || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(query.limit || '10')));
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = { userId };
    if (query.status && VALID_STATUSES.includes(query.status as TaskStatus)) {
      where.status = query.status as TaskStatus;
    }
    if (query.priority && VALID_PRIORITIES.includes(query.priority as Priority)) {
      where.priority = query.priority as Priority;
    }
    if (query.search && query.search.trim()) {
      where.title = Like(`%${query.search.trim()}%`);
    }

    // Sorting
    const allowedSortFields = ['createdAt', 'updatedAt', 'title', 'dueDate', 'priority', 'status'];
    const sortBy = allowedSortFields.includes(query.sortBy || '') ? query.sortBy! : 'createdAt';
    const sortOrder: 'ASC' | 'DESC' = query.sortOrder === 'asc' ? 'ASC' : 'DESC';

    const taskRepo = AppDataSource.getRepository(Task);
    const [tasks, totalCount] = await taskRepo.findAndCount({
      where,
      order: { [sortBy]: sortOrder },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      data: {
        tasks,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── GET /tasks/:id ────────────────────────────────────────────────────────
export const getTaskById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const taskRepo = AppDataSource.getRepository(Task);
    const task = await taskRepo.findOne({ where: { id, userId } });

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    res.status(200).json({ success: true, data: { task } });
  } catch (error) {
    console.error('Get task by ID error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── POST /tasks ───────────────────────────────────────────────────────────
export const createTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const validation = createTaskSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const { title, description, status, priority, dueDate } = validation.data;

    const taskRepo = AppDataSource.getRepository(Task);
    const task = taskRepo.create({
      title,
      description: description ?? null,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      userId: req.user!.id,
    });

    await taskRepo.save(task);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task },
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── PATCH /tasks/:id ─────────────────────────────────────────────────────
export const updateTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const taskRepo = AppDataSource.getRepository(Task);
    const task = await taskRepo.findOne({ where: { id, userId } });

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    const validation = updateTaskSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const { title, description, status, priority, dueDate } = validation.data;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;

    await taskRepo.save(task);

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: { task },
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── DELETE /tasks/:id ────────────────────────────────────────────────────
export const deleteTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const taskRepo = AppDataSource.getRepository(Task);
    const task = await taskRepo.findOne({ where: { id, userId } });

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    await taskRepo.remove(task);

    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── PATCH /tasks/:id/toggle ──────────────────────────────────────────────
export const toggleTaskStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const taskRepo = AppDataSource.getRepository(Task);
    const task = await taskRepo.findOne({ where: { id, userId } });

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    // Cycle: PENDING → IN_PROGRESS → COMPLETED → PENDING
    const nextStatus: Record<TaskStatus, TaskStatus> = {
      PENDING: 'IN_PROGRESS',
      IN_PROGRESS: 'COMPLETED',
      COMPLETED: 'PENDING',
    };

    task.status = nextStatus[task.status];
    await taskRepo.save(task);

    res.status(200).json({
      success: true,
      message: `Task status updated to ${task.status}`,
      data: { task },
    });
  } catch (error) {
    console.error('Toggle task error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
