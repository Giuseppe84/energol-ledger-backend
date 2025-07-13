"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/serviceType.routes.ts
const express_1 = require("express");
const serviceType_controller_1 = require("../controllers/serviceType.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRole)(['Admin', 'Manager']), (0, auth_middleware_1.hasPermission)('create:serviceType'), serviceType_controller_1.createServiceType);
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRole)(['Admin', 'Manager', 'User']), (0, auth_middleware_1.hasPermission)('read:serviceType'), serviceType_controller_1.getAllServiceTypes);
router.get('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRole)(['Admin', 'Manager', 'User']), (0, auth_middleware_1.hasPermission)('read:serviceType'), serviceType_controller_1.getServiceTypeById);
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRole)(['Admin', 'Manager']), (0, auth_middleware_1.hasPermission)('update:serviceType'), serviceType_controller_1.updateServiceType);
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRole)(['Admin']), (0, auth_middleware_1.hasPermission)('delete:serviceType'), serviceType_controller_1.deleteServiceType);
exports.default = router;
