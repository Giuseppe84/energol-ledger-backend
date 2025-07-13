"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/property.routes.ts
const express_1 = require("express");
const property_controller_1 = require("../controllers/property.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRole)(['Admin', 'Manager']), (0, auth_middleware_1.hasPermission)('create:property'), property_controller_1.createProperty);
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRole)(['Admin', 'Manager', 'User']), (0, auth_middleware_1.hasPermission)('read:property'), property_controller_1.getAllProperties);
router.get('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRole)(['Admin', 'Manager', 'User']), (0, auth_middleware_1.hasPermission)('read:property'), property_controller_1.getPropertyById);
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRole)(['Admin', 'Manager']), (0, auth_middleware_1.hasPermission)('update:property'), property_controller_1.updateProperty);
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRole)(['Admin']), (0, auth_middleware_1.hasPermission)('delete:property'), property_controller_1.deleteProperty);
exports.default = router;
