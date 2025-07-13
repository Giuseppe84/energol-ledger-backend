// src/routes/serviceType.routes.ts
import { Router } from 'express';
import { createServiceType, getAllServiceTypes, getServiceTypeById, updateServiceType, deleteServiceType } from '../controllers/serviceType.controller';
import { authenticate, authorizeRole, hasPermission } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticate, authorizeRole(['Admin', 'Manager']), hasPermission('create:serviceType'), createServiceType);
router.get('/', authenticate, authorizeRole(['Admin', 'Manager', 'User']), hasPermission('read:serviceType'), getAllServiceTypes);
router.get('/:id', authenticate, authorizeRole(['Admin', 'Manager', 'User']), hasPermission('read:serviceType'), getServiceTypeById);
router.put('/:id', authenticate, authorizeRole(['Admin', 'Manager']), hasPermission('update:serviceType'), updateServiceType);
router.delete('/:id', authenticate, authorizeRole(['Admin']), hasPermission('delete:serviceType'), deleteServiceType);

export default router;