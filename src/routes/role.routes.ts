// src/routes/role.routes.ts
import { Router } from 'express';
import { createRole, getAllRoles, getRoleById, updateRole, deleteRole } from '../controllers/role.controller';
import { authenticateToken, authorizeRole, hasPermission } from '../middlewares/auth.middleware';

const router = Router();

// Le operazioni sui ruoli dovrebbero essere limitate agli Admin
router.post('/', authenticateToken, authorizeRole(['Admin']), hasPermission('create:role'), createRole);
//router.post('/', createRole);

router.get('/', authenticateToken, authorizeRole(['Admin', 'Manager']), hasPermission('read:role'), getAllRoles);
router.get('/:id', authenticateToken, authorizeRole(['Admin', 'Manager']), hasPermission('read:role'), getRoleById);
router.put('/:id', authenticateToken, authorizeRole(['Admin']), hasPermission('update:role'), updateRole);
router.delete('/:id', authenticateToken, authorizeRole(['Admin']), hasPermission('delete:role'), deleteRole);

export default router;