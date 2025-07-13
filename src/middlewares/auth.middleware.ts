import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import prisma from '../utils/prisma';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined in environment variables.");

// Estendi l'interfaccia Request per aggiungere `user`
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        roleId: string;
        permissions: { action: string; resource: string }[];
      };
    }
  }
}

// Middleware principale di autenticazione
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token missing' });

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;

    const user = await prisma.user.findUnique({
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

    const permissions = user.role.permissions.map((rp: any) => ({
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
    const require2FA = (req as any).route?.meta?.require2FA;
    if (payload.twoFA === true && require2FA) {
      return res.status(403).json({ message: '2FA not verified' });
    }

    next();
  } catch (err) {
    console.error('Token verification or DB error:', err);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};


// Middleware per autorizzare il ruolo (es. ['Admin', 'Manager'])
export const authorizeRole = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

    const role = await prisma.role.findUnique({
      where: { id: req.user.roleId },
      select: { name: true },
    });

    if (!role) return res.status(403).json({ message: 'Role not found' });

    if (!allowedRoles.includes(role.name)) {
      return res.status(403).json({ message: 'Access denied: role not authorized' });
    }

    next();
  };
};

// Middleware per controllare permesso (es. 'create:user')
export const hasPermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

    const [action, resource] = permission.split(':');

    const hasPerm = req.user.permissions.some(
      (p) =>
        p.action.toLowerCase() === action.toLowerCase() &&
        p.resource.toLowerCase() === resource.toLowerCase()
    );

    const role = await prisma.role.findUnique({
      where: { id: req.user.roleId },
      select: { name: true },
    });

    if (!hasPerm && role?.name !== 'Admin') {
      return res.status(403).json({ message: `Missing permission: ${permission}` });
    }

    next();
  };
};