// src/routes/auth.routes.ts
import { Router } from 'express';
import { register, login, enable2FA, verify2FA  } from '../controllers/auth.controller';
import { isAuthenticated } from '../middlewares/auth.middleware';


const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/2fa/setup', isAuthenticated, enable2FA);
router.post('/2fa/verify', isAuthenticated, verify2FA);


export default router;