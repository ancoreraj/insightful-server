import { Router } from 'express';
import {
  createShift,
  findShifts,
  getShift,
  updateShift,
  deleteShift,
  endShift,
  markShiftAsPaid,
  createScreenshot,
  listScreenshots,
  paginateScreenshots,
  getScreenshot,
  deleteScreenshot,
  getScreenshotsWithPermissionIssues,
  getScreenshotStats,
  listActivities,
  listBreaks,
  listProjectTime,
  listManualEntries
} from '../controllers/analytics.controller';
import { authenticate, requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(requireAuth);

router.get('/shift', findShifts);

router.get('/shift/:id', getShift);

router.post('/shift', createShift);

router.put('/shift/:id', updateShift);

router.delete('/shift/:id', requireAdmin, deleteShift);

router.post('/shift/end', endShift);

router.put('/shift/:id/paid', requireAdmin, markShiftAsPaid);

router.get('/screenshot', listScreenshots);

router.get('/screenshot-paginate', paginateScreenshots);

router.get('/screenshot/permission-issues', requireAdmin, getScreenshotsWithPermissionIssues);

router.get('/screenshot/stats', requireAdmin, getScreenshotStats);

router.get('/screenshot/:id', getScreenshot);

router.post('/screenshot', createScreenshot);

router.delete('/screenshot/:id', requireAdmin, deleteScreenshot);

router.get('/activity', listActivities);

router.get('/break', listBreaks);

router.get('/project-time', listProjectTime);

router.get('/manual-entry', listManualEntries);

export default router;
