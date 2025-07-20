"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/subject.routes.ts
const express_1 = require("express");
const subject_controller_1 = require("../controllers/subject.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRole)(['Admin', 'User']), (0, auth_middleware_1.hasPermission)('create:subject'), subject_controller_1.createSubject);
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRole)(['Admin', 'User']), (0, auth_middleware_1.hasPermission)('read:subject'), subject_controller_1.getAllSubjects);
router.get('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRole)(['Admin', 'User']), (0, auth_middleware_1.hasPermission)('read:subject'), subject_controller_1.getSubjectById);
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRole)(['Admin', 'User']), (0, auth_middleware_1.hasPermission)('update:subject'), subject_controller_1.updateSubject);
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRole)(['Admin']), (0, auth_middleware_1.hasPermission)('delete:subject'), subject_controller_1.deleteSubject);
exports.default = router;
