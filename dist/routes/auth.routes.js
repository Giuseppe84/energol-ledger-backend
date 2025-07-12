"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/auth.routes.ts
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post('/register', auth_controller_1.register);
router.post('/login', auth_controller_1.login);
router.post('/2fa/setup', auth_middleware_1.isAuthenticated, auth_controller_1.enable2FA);
router.post('/2fa/verify', auth_middleware_1.isAuthenticated, auth_controller_1.verify2FA);
exports.default = router;
