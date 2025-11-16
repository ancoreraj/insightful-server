import express from 'express';
import appUsageController from '../controllers/appUsage.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, appUsageController.getAppUsage);

export default router;
