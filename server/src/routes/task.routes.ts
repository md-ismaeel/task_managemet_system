import { Router } from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
} from '../controllers/task.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All task routes are protected
router.use(authenticate);

// POST /tasks     — create new task
router.route('/').get(getTasks).post(createTask);

// GET    /tasks/:id — get single task
// PATCH  /tasks/:id — update task
// DELETE /tasks/:id — delete task
router.route('/:id').get(getTaskById).patch(updateTask).delete(deleteTask);

// PATCH /tasks/:id/toggle — cycle task status
router.patch('/:id/toggle', toggleTaskStatus);

export default router;
