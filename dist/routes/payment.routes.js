"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/payment.routes.ts
const express_1 = require("express");
const payment_controller_1 = require("../controllers/payment.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post('/', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRole)(['Admin', 'Manager', 'User']), (0, auth_middleware_1.hasPermission)('create:payment'), payment_controller_1.createPayment);
router.get('/', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRole)(['Admin', 'Manager', 'User']), (0, auth_middleware_1.hasPermission)('read:payment'), payment_controller_1.getAllPayments);
router.get('/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRole)(['Admin', 'Manager', 'User']), (0, auth_middleware_1.hasPermission)('read:payment'), payment_controller_1.getPaymentById);
router.put('/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRole)(['Admin', 'Manager']), (0, auth_middleware_1.hasPermission)('update:payment'), payment_controller_1.updatePayment);
router.delete('/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRole)(['Admin']), (0, auth_middleware_1.hasPermission)('delete:payment'), payment_controller_1.deletePayment);
exports.default = router;
