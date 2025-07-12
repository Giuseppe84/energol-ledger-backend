// src/routes/subject.routes.ts
import { Router } from 'express';
import { createSubject, getAllSubjects, getSubjectById, updateSubject, deleteSubject } from '../controllers/subject.controller';
import { authenticateToken, authorizeRole, hasPermission } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticateToken, authorizeRole(['Admin', 'Manager']), hasPermission('create:subject'), createSubject);
router.get('/', authenticateToken, authorizeRole(['Admin', 'Manager', 'User']), hasPermission('read:subject'), getAllSubjects);
router.get('/:id', authenticateToken, authorizeRole(['Admin', 'Manager', 'User']), hasPermission('read:subject'), getSubjectById);
router.put('/:id', authenticateToken, authorizeRole(['Admin', 'Manager']), hasPermission('update:subject'), updateSubject);
router.delete('/:id', authenticateToken, authorizeRole(['Admin']), hasPermission('delete:subject'), deleteSubject);

export default router;
