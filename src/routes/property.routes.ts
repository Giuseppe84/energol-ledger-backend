// src/routes/property.routes.ts
import { Router } from 'express';
import { createProperty, getAllProperties, getPropertyById, updateProperty, deleteProperty } from '../controllers/property.controller';
import { authenticate, authorizeRole, hasPermission } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticate, authorizeRole(['Admin', 'Manager']), hasPermission('create:property'), createProperty);
router.get('/', authenticate, authorizeRole(['Admin', 'Manager', 'User']), hasPermission('read:property'), getAllProperties);
router.get('/:id', authenticate, authorizeRole(['Admin', 'Manager', 'User']), hasPermission('read:property'), getPropertyById);
router.put('/:id', authenticate, authorizeRole(['Admin', 'Manager']), hasPermission('update:property'), updateProperty);
router.delete('/:id', authenticate, authorizeRole(['Admin']), hasPermission('delete:property'), deleteProperty);

export default router;
