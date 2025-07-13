"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/role.routes.ts
const express_1 = require("express");
const role_controller_1 = require("../controllers/role.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Le operazioni sui ruoli dovrebbero essere limitate agli Admin
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRole)(['Admin']), (0, auth_middleware_1.hasPermission)('create:role'), role_controller_1.createRole);
//router.post('/', createRole);
//router.get('/', authenticate, authorizeRole(['Admin', 'Manager']), hasPermission('read:role'), getAllRoles);
router.get('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRole)(['Admin', 'Manager']), (0, auth_middleware_1.hasPermission)('read:role'), role_controller_1.getRoleById);
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRole)(['Admin']), (0, auth_middleware_1.hasPermission)('update:role'), role_controller_1.updateRole);
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRole)(['Admin']), (0, auth_middleware_1.hasPermission)('delete:role'), role_controller_1.deleteRole);
exports.default = router;
