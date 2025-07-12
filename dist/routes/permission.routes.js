"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/permission.routes.ts
const express_1 = require("express");
const permission_controller_1 = require("../controllers/permission.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Le operazioni sui permessi dovrebbero essere limitate agli Admin
router.post('/', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRole)(['Admin']), (0, auth_middleware_1.hasPermission)('create:permission'), permission_controller_1.createPermission);
router.get('/', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRole)(['Admin', 'Manager']), (0, auth_middleware_1.hasPermission)('read:permission'), permission_controller_1.getAllPermissions);
router.get('/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRole)(['Admin', 'Manager']), (0, auth_middleware_1.hasPermission)('read:permission'), permission_controller_1.getPermissionById);
router.put('/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRole)(['Admin']), (0, auth_middleware_1.hasPermission)('update:permission'), permission_controller_1.updatePermission);
router.delete('/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRole)(['Admin']), (0, auth_middleware_1.hasPermission)('delete:permission'), permission_controller_1.deletePermission);
exports.default = router;
