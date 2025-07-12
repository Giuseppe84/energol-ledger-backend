"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/service.routes.ts
const express_1 = require("express");
const service_controller_1 = require("../controllers/service.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post('/', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRole)(['Admin', 'Manager', 'User']), (0, auth_middleware_1.hasPermission)('create:service'), service_controller_1.createService);
router.get('/', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRole)(['Admin', 'Manager', 'User']), (0, auth_middleware_1.hasPermission)('read:service'), service_controller_1.getAllServices);
router.get('/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRole)(['Admin', 'Manager', 'User']), (0, auth_middleware_1.hasPermission)('read:service'), service_controller_1.getServiceById);
router.put('/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRole)(['Admin', 'Manager', 'User']), (0, auth_middleware_1.hasPermission)('update:service'), service_controller_1.updateService);
router.delete('/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRole)(['Admin']), (0, auth_middleware_1.hasPermission)('delete:service'), service_controller_1.deleteService);
exports.default = router;
