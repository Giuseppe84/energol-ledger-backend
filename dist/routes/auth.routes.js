"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/auth.routes.ts
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post('/register', auth_controller_1.register);
router.post('/login', auth_controller_1.login);
router.post('/2fa/setup', auth_middleware_1.authenticate, auth_controller_1.enable2FA);
router.post('/2fa/verify', auth_middleware_1.authenticate, auth_controller_1.verify2FA);
router.get("/2fa/status", auth_middleware_1.authenticate, auth_controller_1.get2FAStatus);
router.get("/2fa/generate", auth_middleware_1.authenticate, auth_controller_1.generate2FASecret);
router.post("/2fa/disable", auth_middleware_1.authenticate, auth_controller_1.disable2FA);
exports.default = router;
