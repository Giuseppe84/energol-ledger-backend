// src/routes/permission.routes.ts
import { Router } from 'express';
import { createPermission, getAllPermissions, getPermissionById, updatePermission, deletePermission } from '../controllers/permission.controller';
import { authenticateToken, authorizeRole, hasPermission } from '../middlewares/auth.middleware';

const router = Router();

// Le operazioni sui permessi dovrebbero essere limitate agli Admin
router.post('/', authenticateToken, authorizeRole(['Admin']), hasPermission('create:permission'), createPermission);
router.get('/', authenticateToken, authorizeRole(['Admin', 'Manager']), hasPermission('read:permission'), getAllPermissions);
router.get('/:id', authenticateToken, authorizeRole(['Admin', 'Manager']), hasPermission('read:permission'), getPermissionById);
router.put('/:id', authenticateToken, authorizeRole(['Admin']), hasPermission('update:permission'), updatePermission);
router.delete('/:id', authenticateToken, authorizeRole(['Admin']), hasPermission('delete:permission'), deletePermission);

export default router;