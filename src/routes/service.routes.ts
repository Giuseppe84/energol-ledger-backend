// src/routes/service.routes.ts
import { Router } from 'express';
import { createService, getAllServices, getServiceById, updateService, deleteService } from '../controllers/service.controller';
import { authenticateToken, authorizeRole, hasPermission } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticateToken, authorizeRole(['Admin', 'Manager', 'User']), hasPermission('create:service'), createService);
router.get('/', authenticateToken, authorizeRole(['Admin', 'Manager', 'User']), hasPermission('read:service'), getAllServices);
router.get('/:id', authenticateToken, authorizeRole(['Admin', 'Manager', 'User']), hasPermission('read:service'), getServiceById);
router.put('/:id', authenticateToken, authorizeRole(['Admin', 'Manager', 'User']), hasPermission('update:service'), updateService);
router.delete('/:id', authenticateToken, authorizeRole(['Admin']), hasPermission('delete:service'), deleteService);

export default router;