// src/routes/payment.routes.ts
import { Router } from 'express';
import { createPayment, getAllPayments, getPaymentById, updatePayment, deletePayment } from '../controllers/payment.controller';
import { authenticateToken, authorizeRole, hasPermission } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticateToken, authorizeRole(['Admin', 'Manager', 'User']), hasPermission('create:payment'), createPayment);
router.get('/', authenticateToken, authorizeRole(['Admin', 'Manager', 'User']), hasPermission('read:payment'), getAllPayments);
router.get('/:id', authenticateToken, authorizeRole(['Admin', 'Manager', 'User']), hasPermission('read:payment'), getPaymentById);
router.put('/:id', authenticateToken, authorizeRole(['Admin', 'Manager']), hasPermission('update:payment'), updatePayment);
router.delete('/:id', authenticateToken, authorizeRole(['Admin']), hasPermission('delete:payment'), deletePayment);

export default router;