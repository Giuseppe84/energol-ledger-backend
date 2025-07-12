"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasPermission = exports.authorizeRole = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'; // Assicurati che sia nel .env
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"
    if (token == null) {
        return res.status(401).json({ message: 'Authentication token required.' });
    }
    jsonwebtoken_1.default.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) {
            console.error('JWT verification error:', err);
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }
        try {
            const user = await prisma_1.default.user.findUnique({
                where: { id: decoded.userId },
                include: {
                    role: {
                        include: {
                            permissions: {
                                include: {
                                    permission: true
                                }
                            }
                        }
                    }
                }
            });
            if (!user || !user.isActive) {
                return res.status(403).json({ message: 'User not found or inactive.' });
            }
            // Mappa i permessi in un formato più semplice (es. ['read:user', 'create:client'])
            const userPermissions = user.role.permissions.map((rp) => ({
                action: rp.permission.action,
                resource: rp.permission.resource
            }));
            req.user = {
                id: user.id,
                email: user.email,
                roleId: user.roleId,
                permissions: userPermissions
            };
            next();
        }
        catch (dbError) {
            console.error('Database error during token authentication:', dbError);
            res.status(500).json({ message: 'Internal server error during authentication.' });
        }
    });
};
exports.authenticateToken = authenticateToken;
const authorizeRole = (requiredRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated.' }); // Questo non dovrebbe accadere se authenticateToken è prima
        }
        // Qui cerchiamo il nome del ruolo dell'utente dal database
        prisma_1.default.role.findUnique({
            where: { id: req.user.roleId },
            select: { name: true }
        })
            .then((role) => {
            if (!role) {
                return res.status(403).json({ message: 'User role not found.' });
            }
            if (requiredRoles.includes(role.name)) {
                next();
            }
            else {
                res.status(403).json({ message: 'Access denied: Insufficient role permissions.' });
            }
        })
            .catch((error) => {
            console.error('Error fetching user role for authorization:', error);
            res.status(500).json({ message: 'Internal server error during authorization.' });
        });
    };
};
exports.authorizeRole = authorizeRole;
const hasPermission = (permissionString) => {
    return (req, res, next) => {
        if (!req.user || !req.user.permissions) {
            return res.status(401).json({ message: 'User not authenticated or permissions not loaded.' });
        }
        const [requiredAction, requiredResource] = permissionString.split(':');
        // Verifica se l'utente ha il permesso specifico o è un ADMIN (che di solito ha tutti i permessi)
        const hasSpecificPermission = req.user.permissions.some(p => p.action === requiredAction.toUpperCase() && p.resource === requiredResource.toUpperCase());
        // Controlla se l'utente ha il ruolo di ADMIN (per bypassare i permessi specifici se è un super utente)
        prisma_1.default.role.findUnique({
            where: { id: req.user.roleId },
            select: { name: true }
        })
            .then((role) => {
            if (!role) {
                return res.status(403).json({ message: 'User role not found for permission check.' });
            }
            if (role.name === 'Admin' || hasSpecificPermission) {
                next();
            }
            else {
                res.status(403).json({ message: `Access denied: Missing '${permissionString}' permission.` });
            }
        })
            .catch((error) => {
            console.error('Error fetching role for permission check:', error);
            res.status(500).json({ message: 'Internal server error during permission check.' });
        });
    };
};
exports.hasPermission = hasPermission;
