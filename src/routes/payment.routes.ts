// src/routes/payment.routes.ts
import { Router } from 'express';
import { createPayment, getAllPayments, getPaymentById, updatePayment, deletePayment } from '../controllers/payment.controller';
import { authenticate, authorizeRole, hasPermission } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticate, authorizeRole(['Admin', 'Manager', 'User']), hasPermission('create:payment'), createPayment);
router.get('/', authenticate, authorizeRole(['Admin', 'Manager', 'User']), hasPermission('read:payment'), getAllPayments);
router.get('/:id', authenticate, authorizeRole(['Admin', 'Manager', 'User']), hasPermission('read:payment'), getPaymentById);
router.put('/:id', authenticate, authorizeRole(['Admin', 'Manager']), hasPermission('update:payment'), updatePayment);
router.delete('/:id', authenticate, authorizeRole(['Admin']), hasPermission('delete:payment'), deletePayment);

export default router;