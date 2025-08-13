// src/routes/service.routes.ts
import { Router } from 'express';
import { createWork, getAllWorks, getWorkById, updateWork, deleteWork, getUnpaidWorks } from '../controllers/work.controller';
import { authenticate, authorizeRole, hasPermission } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticate, authorizeRole(['Admin', 'Manager', 'User']), hasPermission('create:service'), createWork);
router.get('/', authenticate, authorizeRole(['Admin', 'Manager', 'User']), hasPermission('read:service'), getAllWorks);
router.get('/unpaid', getUnpaidWorks);
router.get('/:id', authenticate, authorizeRole(['Admin', 'Manager', 'User']), hasPermission('read:service'), getWorkById);
router.put('/:id', authenticate, authorizeRole(['Admin', 'Manager', 'User']), hasPermission('update:service'), updateWork);
router.delete('/:id', authenticate, authorizeRole(['Admin']), hasPermission('delete:service'), deleteWork);

export default router;