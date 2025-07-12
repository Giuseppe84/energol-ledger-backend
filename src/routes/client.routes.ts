// src/routes/client.routes.ts
import { Router } from 'express';
import { createClient, getAllClients, getClientById, updateClient, deleteClient } from '../controllers/client.controller';
import { authenticateToken, authorizeRole, hasPermission } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticateToken, authorizeRole(['Admin', 'Manager']), hasPermission('create:client'), createClient);
router.get('/', authenticateToken, authorizeRole(['Admin', 'Manager', 'User']), hasPermission('read:client'), getAllClients);
router.get('/:id', authenticateToken, authorizeRole(['Admin', 'Manager', 'User']), hasPermission('read:client'), getClientById);
router.put('/:id', authenticateToken, authorizeRole(['Admin', 'Manager']), hasPermission('update:client'), updateClient);
router.delete('/:id', authenticateToken, authorizeRole(['Admin']), hasPermission('delete:client'), deleteClient);

export default router;
