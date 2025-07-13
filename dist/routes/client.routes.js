"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/client.routes.ts
const express_1 = require("express");
const client_controller_1 = require("../controllers/client.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRole)(['Admin', 'Manager']), (0, auth_middleware_1.hasPermission)('create:client'), client_controller_1.createClient);
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRole)(['Admin', 'Manager', 'User']), (0, auth_middleware_1.hasPermission)('read:client'), client_controller_1.getAllClients);
router.get('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRole)(['Admin', 'Manager', 'User']), (0, auth_middleware_1.hasPermission)('read:client'), client_controller_1.getClientById);
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRole)(['Admin', 'Manager']), (0, auth_middleware_1.hasPermission)('update:client'), client_controller_1.updateClient);
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRole)(['Admin']), (0, auth_middleware_1.hasPermission)('delete:client'), client_controller_1.deleteClient);
exports.default = router;
