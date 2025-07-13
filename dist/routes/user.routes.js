"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/user.routes.ts
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Applica i middleware
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRole)(['Admin', 'Manager']), (0, auth_middleware_1.hasPermission)('read:user'), user_controller_1.getAllUsers);
router.get('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRole)(['Admin', 'Manager', 'User']), (0, auth_middleware_1.hasPermission)('read:user'), user_controller_1.getUserById); // Un utente può leggere il proprio profilo
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRole)(['Admin', 'Manager', 'User']), (0, auth_middleware_1.hasPermission)('update:user'), user_controller_1.updateUser); // Un utente può modificare il proprio profilo, ma i campi sensibili (ruolo, isActive) devono essere protetti in updateUser
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRole)(['Admin']), (0, auth_middleware_1.hasPermission)('delete:user'), user_controller_1.deleteUser);
exports.default = router;
