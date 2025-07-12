// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import dotenv from 'dotenv';
import { error } from 'node:console';

dotenv.config();

// Estendi l'interfaccia Request di Express per includere l'utente autenticato
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

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'; // Assicurati che sia nel .env

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (token == null) {
    return res.status(401).json({ message: 'Authentication token required.' });
  }

  jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
    if (err) {
      console.error('JWT verification error:', err);
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }

    try {
      const user = await prisma.user.findUnique({
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
      const userPermissions = user.role.permissions.map((rp:any) => ({
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
    } catch (dbError) {
      console.error('Database error during token authentication:', dbError);
      res.status(500).json({ message: 'Internal server error during authentication.' });
    }
  });
};

export const authorizeRole = (requiredRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated.' }); // Questo non dovrebbe accadere se authenticateToken è prima
    }

    // Qui cerchiamo il nome del ruolo dell'utente dal database
    prisma.role.findUnique({
      where: { id: req.user.roleId },
      select: { name: true }
    })
    .then((role: { name: string } | null) => {
      if (!role) {
        return res.status(403).json({ message: 'User role not found.' });
      }
      if (requiredRoles.includes(role.name)) {
        next();
      } else {
        res.status(403).json({ message: 'Access denied: Insufficient role permissions.' });
      }
    })
    .catch((error:any) => {
      console.error('Error fetching user role for authorization:', error);
      res.status(500).json({ message: 'Internal server error during authorization.' });
    });
  };
};

export const hasPermission = (permissionString: string) => { // E.g., "create:user", "read:client"
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.permissions) {
      return res.status(401).json({ message: 'User not authenticated or permissions not loaded.' });
    }

    const [requiredAction, requiredResource] = permissionString.split(':');

    // Verifica se l'utente ha il permesso specifico o è un ADMIN (che di solito ha tutti i permessi)
    const hasSpecificPermission = req.user.permissions.some(
      p => p.action === requiredAction.toUpperCase() && p.resource === requiredResource.toUpperCase()
    );

    // Controlla se l'utente ha il ruolo di ADMIN (per bypassare i permessi specifici se è un super utente)
    prisma.role.findUnique({
      where: { id: req.user.roleId },
      select: { name: true }
    })
    .then((role:any) => {
      if (!role) {
        return res.status(403).json({ message: 'User role not found for permission check.' });
      }
      if (role.name === 'Admin' || hasSpecificPermission) {
        next();
      } else {
        res.status(403).json({ message: `Access denied: Missing '${permissionString}' permission.` });
      }
    })
    .catch((error: unknown) => {
      console.error('Error fetching role for permission check:', error);
      res.status(500).json({ message: 'Internal server error during permission check.' });
    });
  };
};



export const isAuthenticated = (require2FA: boolean = true) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Missing token' });
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;

      // Se il token è temporaneo (solo per OTP) e la rotta richiede 2FA completo, blocca
      if (require2FA && payload.twoFA === true) {
        return res.status(403).json({ message: '2FA not verified' });
      }

      // Salva user info in req.user
      req.user = payload;
      next();
    } catch (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
  };
};