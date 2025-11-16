import { Router } from 'express';
import {
  createEmployee,
  getEmployee,
  updateEmployee,
  listEmployees,
  deactivateEmployee,
  reactivateEmployee
} from '../controllers/employee.controller';
import { authenticate, requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(requireAuth);

router.post('/', requireAdmin, createEmployee);

router.get('/', listEmployees);

router.get('/:id', getEmployee);

router.put('/:id', requireAdmin, updateEmployee);

router.delete('/:id', requireAdmin, deactivateEmployee);

router.put('/:id/reactivate', requireAdmin, reactivateEmployee);

export default router;
