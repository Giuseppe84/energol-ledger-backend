// src/routes/subject.routes.ts
import { Router } from 'express';
import { createSubject, getAllSubjects, getSubjectById, updateSubject, deleteSubject } from '../controllers/subject.controller';
import { authenticate, authorizeRole, hasPermission } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticate, authorizeRole(['ADMIN', 'USER']), hasPermission('create:subject'), createSubject);
router.get('/', authenticate, authorizeRole(['ADMIN',  'USER']), hasPermission('read:subject'), getAllSubjects);
router.get('/:id', authenticate, authorizeRole(['ADMIN', 'USER']), hasPermission('read:subject'), getSubjectById);
router.put('/:id', authenticate, authorizeRole(['ADMIN', 'USER']), hasPermission('update:subject'), updateSubject);
router.delete('/:id', authenticate, authorizeRole(['ADMIN']), hasPermission('delete:subject'), deleteSubject);

export default router;
