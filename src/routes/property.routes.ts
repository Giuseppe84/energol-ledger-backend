// src/routes/property.routes.ts
import { Router } from 'express';
import { createProperty, getAllProperties, getPropertyById, updateProperty, deleteProperty } from '../controllers/property.controller';
import { authenticateToken, authorizeRole, hasPermission } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticateToken, authorizeRole(['Admin', 'Manager']), hasPermission('create:property'), createProperty);
router.get('/', authenticateToken, authorizeRole(['Admin', 'Manager', 'User']), hasPermission('read:property'), getAllProperties);
router.get('/:id', authenticateToken, authorizeRole(['Admin', 'Manager', 'User']), hasPermission('read:property'), getPropertyById);
router.put('/:id', authenticateToken, authorizeRole(['Admin', 'Manager']), hasPermission('update:property'), updateProperty);
router.delete('/:id', authenticateToken, authorizeRole(['Admin']), hasPermission('delete:property'), deleteProperty);

export default router;
