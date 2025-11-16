import { Router } from 'express';
import {
  createTask,
  createDefaultTask,
  getTask,
  listTasks,
  updateTask,
  deleteTask,
  assignEmployee,
  unassignEmployee
} from '../controllers/task.controller';
import { authenticate, requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(requireAuth);

router.post('/', requireAdmin, createTask);

router.post('/default/:projectId', requireAdmin, createDefaultTask);

router.get('/', listTasks);

router.get('/:id', getTask);

router.put('/:id', requireAdmin, updateTask);

router.delete('/:id', requireAdmin, deleteTask);

router.put('/:id/employee', requireAdmin, assignEmployee);

router.delete('/:id/employee', requireAdmin, unassignEmployee);

export default router;
