// src/routes/subject.routes.ts
import { Router } from 'express';
import { createSubject, getAllSubjects, getSubjectById, updateSubject, deleteSubject, assignClientToSubject } from '../controllers/subject.controller';
import { authenticate, authorizeRole, hasPermission } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticate, authorizeRole(['Admin', 'User']), hasPermission('create:subject'), createSubject);
router.get('/', authenticate, authorizeRole(['Admin',  'User']), hasPermission('read:subject'), getAllSubjects);
router.get('/:id', authenticate, authorizeRole(['Admin', 'User']), hasPermission('read:subject'), getSubjectById);
router.put('/:id', authenticate, authorizeRole(['Admin', 'User']), hasPermission('update:subject'), updateSubject);
router.delete('/:id', authenticate, authorizeRole(['Admin']), hasPermission('delete:subject'), deleteSubject);
router.post('/:id/assign-client/:clientId', authenticate, authorizeRole(['Admin']), hasPermission('update:subject'), assignClientToSubject);

export default router;
