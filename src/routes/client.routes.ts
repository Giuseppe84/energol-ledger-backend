// src/routes/client.routes.ts
import { Router } from 'express';
import { createClient, getAllClients, getClientById, updateClient, deleteClient } from '../controllers/client.controller';
import { authenticate, authorizeRole, hasPermission } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticate, authorizeRole(['Admin', 'Manager']), hasPermission('create:client'), createClient);
router.get('/', authenticate, authorizeRole(['Admin', 'Manager', 'User']), hasPermission('read:client'), getAllClients);
router.get('/:id', authenticate, authorizeRole(['Admin', 'Manager', 'User']), hasPermission('read:client'), getClientById);
router.put('/:id', authenticate, authorizeRole(['Admin', 'Manager']), hasPermission('update:client'), updateClient);
router.delete('/:id', authenticate, authorizeRole(['Admin']), hasPermission('delete:client'), deleteClient);

export default router;
