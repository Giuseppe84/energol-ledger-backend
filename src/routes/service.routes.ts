// src/routes/service.routes.ts
import { Router } from 'express';
import { createService, getAllServices, getServiceById, updateService, deleteService } from '../controllers/service.controller';
import { authenticate, authorizeRole, hasPermission } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticate, authorizeRole(['Admin', 'Manager', 'User']), hasPermission('create:service'), createService);
router.get('/', authenticate, authorizeRole(['Admin', 'Manager', 'User']), hasPermission('read:service'), getAllServices);
router.get('/:id', authenticate, authorizeRole(['Admin', 'Manager', 'User']), hasPermission('read:service'), getServiceById);
router.put('/:id', authenticate, authorizeRole(['Admin', 'Manager', 'User']), hasPermission('update:service'), updateService);
router.delete('/:id', authenticate, authorizeRole(['Admin']), hasPermission('delete:service'), deleteService);

export default router;