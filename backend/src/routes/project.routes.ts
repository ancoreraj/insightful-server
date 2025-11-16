import { Router } from 'express';
import {
  createProject,
  getProject,
  listProjects,
  updateProject,
  deleteProject,
  addEmployees,
  removeEmployee,
  archiveProject,
  unarchiveProject
} from '../controllers/project.controller';
import { authenticate, requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(requireAuth);

router.post('/', requireAdmin, createProject);

router.get('/', listProjects);

router.get('/:id', getProject);

router.put('/:id', requireAdmin, updateProject);

router.delete('/:id', requireAdmin, deleteProject);

router.put('/:id/archive', requireAdmin, archiveProject);

router.put('/:id/unarchive', requireAdmin, unarchiveProject);

router.post('/:id/employees', requireAdmin, addEmployees);

router.delete('/:id/employees/:employeeId', requireAdmin, removeEmployee);

export default router;
