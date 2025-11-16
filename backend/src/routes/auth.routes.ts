import { Router } from 'express';
import {
  login,
  refreshToken,
  logout,
  createApiToken,
  listApiTokens,
  revokeApiToken,
  setupAccount
} from '../controllers/auth.controller';
import { authenticate, requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

router.post('/login', login);

router.post('/refresh', refreshToken);

router.post('/logout', logout);

router.post('/setup-account', setupAccount);

router.post('/api-token', authenticate, requireAuth, requireAdmin, createApiToken);

router.get('/api-tokens', authenticate, requireAuth, listApiTokens);

router.delete('/api-token/:id', authenticate, requireAuth, revokeApiToken);

export default router;
