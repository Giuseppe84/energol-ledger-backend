// src/routes/serviceType.routes.ts
import { Router } from 'express';
import { createServiceType, getAllServiceTypes, getServiceTypeById, updateServiceType, deleteServiceType } from '../controllers/serviceType.controller';
import { authenticateToken, authorizeRole, hasPermission } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticateToken, authorizeRole(['Admin', 'Manager']), hasPermission('create:serviceType'), createServiceType);
router.get('/', authenticateToken, authorizeRole(['Admin', 'Manager', 'User']), hasPermission('read:serviceType'), getAllServiceTypes);
router.get('/:id', authenticateToken, authorizeRole(['Admin', 'Manager', 'User']), hasPermission('read:serviceType'), getServiceTypeById);
router.put('/:id', authenticateToken, authorizeRole(['Admin', 'Manager']), hasPermission('update:serviceType'), updateServiceType);
router.delete('/:id', authenticateToken, authorizeRole(['Admin']), hasPermission('delete:serviceType'), deleteServiceType);

export default router;