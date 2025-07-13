// src/routes/auth.routes.ts
import { Router } from 'express';
import { register, login, enable2FA, verify2FA, get2FAStatus, generate2FASecret, disable2FA  } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';


const router = Router();

router.post('/register', register);
router.post('/login', login);

router.post('/2fa/setup', authenticate, enable2FA);
router.post('/2fa/verify', authenticate, verify2FA);
router.get("/2fa/status", authenticate, get2FAStatus);
router.get("/2fa/generate", authenticate, generate2FASecret);
router.post("/2fa/disable", authenticate, disable2FA);

export default router;