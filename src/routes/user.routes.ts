// src/routes/user.routes.ts
import { Router } from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser } from '../controllers/user.controller';
import { authenticate, authorizeRole, hasPermission } from '../middlewares/auth.middleware';

const router = Router();

// Applica i middleware
router.get('/', authenticate, authorizeRole(['Admin', 'Manager']), hasPermission('read:user'), getAllUsers);
router.get('/:id', authenticate, authorizeRole(['Admin', 'Manager', 'User']), hasPermission('read:user'), getUserById); // Un utente può leggere il proprio profilo
router.put('/:id', authenticate, authorizeRole(['Admin', 'Manager', 'User']), hasPermission('update:user'), updateUser); // Un utente può modificare il proprio profilo, ma i campi sensibili (ruolo, isActive) devono essere protetti in updateUser
router.delete('/:id', authenticate, authorizeRole(['Admin']), hasPermission('delete:user'), deleteUser);

export default router;