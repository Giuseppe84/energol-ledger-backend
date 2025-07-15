// src/routes/serviceType.routes.ts
import { Router } from 'express';
import { createService, getAllServices, getServiceById, updateService, deleteService } from '../controllers/service.controller';
import { authenticate, authorizeRole, hasPermission } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticate, authorizeRole(['Admin', 'Manager']), hasPermission('create:serviceType'), createService);
router.get('/', authenticate, authorizeRole(['Admin', 'Manager', 'User']), hasPermission('read:serviceType'), getAllServices);
router.get('/:id', authenticate, authorizeRole(['Admin', 'Manager', 'User']), hasPermission('read:serviceType'), getServiceById);
router.put('/:id', authenticate, authorizeRole(['Admin', 'Manager']), hasPermission('update:serviceType'), updateService);
router.delete('/:id', authenticate, authorizeRole(['Admin']), hasPermission('delete:serviceType'), deleteService);

export default router;