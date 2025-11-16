import { Router } from 'express';
import employeeRoutes from './employee.routes';
import projectRoutes from './project.routes';
import taskRoutes from './task.routes';
import analyticsRoutes from './analytics.routes';
import authRoutes from './auth.routes';
import appUsageRoutes from './appUsage.routes';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    version: '1.0.0',
    name: 'Insightful API Clone',
    endpoints: {
      auth: '/auth',
      employees: '/employee',
      projects: '/project',
      tasks: '/task',
      analytics: '/analytics',
      appUsage: '/app-usage'
    }
  });
});

router.use('/auth', authRoutes);
router.use('/employee', employeeRoutes);
router.use('/project', projectRoutes);
router.use('/task', taskRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/app-usage', appUsageRoutes);

export default router;
