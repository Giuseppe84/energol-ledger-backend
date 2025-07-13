"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/auth.routes.ts
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
router.post('/register', auth_controller_1.register);
router.post('/login', auth_controller_1.login);
router.post('/2fa/setup', auth_controller_1.enable2FA);
router.post('/2fa/verify', auth_controller_1.verify2FA);
router.get("/2fa/status", auth_controller_1.get2FAStatus);
router.get("/2fa/generate", auth_controller_1.generate2FASecret);
router.post("/2fa/disable", auth_controller_1.disable2FA);
/*
router.post('/2fa/setup', authenticate, enable2FA);
router.post('/2fa/verify', authenticate, verify2FA);
router.get("/2fa/status", authenticate, get2FAStatus);
router.get("/2fa/generate", authenticate, generate2FASecret);
router.post("/2fa/disable", authenticate, disable2FA);
*/
exports.default = router;
