"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasPermission = exports.authorizeRole = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const prisma_1 = __importDefault(require("../utils/prisma"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET)
    throw new Error("JWT_SECRET is not defined in environment variables.");
// Middleware principale di autenticazione
const authenticate = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token)
        return res.status(401).json({ message: 'Token missing' });
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await prisma_1.default.user.findUnique({
            where: { id: payload.userId },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: { permission: true },
                        },
                    },
                },
            },
        });
        if (!user || !user.isActive) {
            return res.status(403).json({ message: 'User not found or inactive.' });
        }
        const permissions = user.role.permissions.map((rp) => ({
            action: rp.permission.action,
            resource: rp.permission.resource,
        }));
        req.user = {
            id: user.id,
            email: user.email,
            roleId: user.roleId,
            permissions,
        };
        // Protezione extra contro route non standard
        const require2FA = req.route?.meta?.require2FA;
        if (payload.twoFA === true && require2FA) {
            return res.status(403).json({ message: '2FA not verified' });
        }
        next();
    }
    catch (err) {
        console.error('Token verification or DB error:', err);
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};
exports.authenticate = authenticate;
// Middleware per autorizzare il ruolo (es. ['Admin', 'Manager'])
const authorizeRole = (allowedRoles) => {
    return async (req, res, next) => {
        if (!req.user)
            return res.status(401).json({ message: 'Not authenticated' });
        const role = await prisma_1.default.role.findUnique({
            where: { id: req.user.roleId },
            select: { name: true },
        });
        if (!role)
            return res.status(403).json({ message: 'Role not found' });
        if (!allowedRoles.includes(role.name)) {
            return res.status(403).json({ message: 'Access denied: role not authorized' });
        }
        next();
    };
};
exports.authorizeRole = authorizeRole;
// Middleware per controllare permesso (es. 'create:user')
const hasPermission = (permission) => {
    return async (req, res, next) => {
        if (!req.user)
            return res.status(401).json({ message: 'Not authenticated' });
        const [action, resource] = permission.split(':');
        const hasPerm = req.user.permissions.some((p) => p.action.toLowerCase() === action.toLowerCase() &&
            p.resource.toLowerCase() === resource.toLowerCase());
        const role = await prisma_1.default.role.findUnique({
            where: { id: req.user.roleId },
            select: { name: true },
        });
        if (!hasPerm && role?.name !== 'Admin') {
            return res.status(403).json({ message: `Missing permission: ${permission}` });
        }
        next();
    };
};
exports.hasPermission = hasPermission;
