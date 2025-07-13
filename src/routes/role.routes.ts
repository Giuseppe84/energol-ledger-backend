// src/routes/role.routes.ts
import { Router } from 'express';
import { createRole, getAllRoles, getRoleById, updateRole, deleteRole } from '../controllers/role.controller';
import { authenticate, authorizeRole, hasPermission } from '../middlewares/auth.middleware';

const router = Router();

// Le operazioni sui ruoli dovrebbero essere limitate agli Admin
router.post('/', authenticate, authorizeRole(['Admin']), hasPermission('create:role'), createRole);
//router.post('/', createRole);

//router.get('/', authenticate, authorizeRole(['Admin', 'Manager']), hasPermission('read:role'), getAllRoles);
router.get('/:id', authenticate, authorizeRole(['Admin', 'Manager']), hasPermission('read:role'), getRoleById);
router.put('/:id', authenticate, authorizeRole(['Admin']), hasPermission('update:role'), updateRole);
router.delete('/:id', authenticate, authorizeRole(['Admin']), hasPermission('delete:role'), deleteRole);

export default router;