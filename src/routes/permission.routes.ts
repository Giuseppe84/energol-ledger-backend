// src/routes/permission.routes.ts
import { Router } from 'express';
import { createPermission, getAllPermissions, getPermissionById, updatePermission, deletePermission } from '../controllers/permission.controller';
import { authenticate, authorizeRole, hasPermission } from '../middlewares/auth.middleware';

const router = Router();

// Le operazioni sui permessi dovrebbero essere limitate agli Admin
router.post('/', authenticate, authorizeRole(['Admin']), hasPermission('create:permission'), createPermission);
router.get('/', authenticate, authorizeRole(['Admin', 'Manager']), hasPermission('read:permission'), getAllPermissions);
router.get('/:id', authenticate, authorizeRole(['Admin', 'Manager']), hasPermission('read:permission'), getPermissionById);
router.put('/:id', authenticate, authorizeRole(['Admin']), hasPermission('update:permission'), updatePermission);
router.delete('/:id', authenticate, authorizeRole(['Admin']), hasPermission('delete:permission'), deletePermission);

export default router;