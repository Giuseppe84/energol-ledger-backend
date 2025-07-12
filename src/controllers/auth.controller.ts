// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';
import dotenv from 'dotenv';
import { generate2FASecret, verify2FAToken } from './2fa.service';
import speakeasy from 'speakeasy';


dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'; // Assicurati che sia nel .env
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

export const register = async (req: Request, res: Response) => {
  const { name, email, password, roleName } = req.body;

  console.log('Registering user:', { name, email, roleName });
  if (!name || !email || !password || !roleName) {
    return res.status(400).json({ message: 'Name, email, password, and role are required.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Trova il ruolo basandosi sul nome fornito
    const role = await prisma.role.findUnique({
      where: { name: roleName.toUpperCase() } // Assicurati che i nomi dei ruoli nel DB siano in UPPERCASE
    });

    if (!role) {
      return res.status(400).json({ message: `Role '${roleName}' not found.` });
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId: role.id, // Collega l'utente al ruolo trovato
      },
      include: {
        role: { select: { name: true } } // Includi il nome del ruolo nella risposta
      }
    });

    // Non restituire la password hashata
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({ message: 'User registered successfully', user: userWithoutPassword });
  } catch (error) {
    console.error('Error during registration:', error);
    if ((error as any).code === 'P2002') { // Controlla il codice dell'errore (PrismaClientKnownRequestError)
      return res.status(409).json({ message: 'Un utente con questa email esiste già.' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
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
      return res.status(401).json({ message: 'Invalid credentials or user is inactive.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    if ((user as any).is2FAEnabled) {
      // Genera un token temporaneo per completare 2FA
      const tempToken = jwt.sign(
        { userId: user.id, twoFA: true },
        process.env.JWT_SECRET!,
        { expiresIn: '5m' }
      );

      return res.status(206).json({ message: '2FA required', tempToken });
    }
    // Mappa i permessi in un formato più semplice per il token (es. ['READ_USER', 'CREATE_CLIENT'])
    const userPermissions = user.role.permissions.map(
      (rp: { permission: { action: string; resource: string } }) => ({
        action: rp.permission.action,
        resource: rp.permission.resource
      })
    );

    const token = jwt.sign(
      { userId: user.id, email: user.email, roleId: user.roleId, permissions: userPermissions },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Non restituire la password hashata
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({ message: 'Login successful', token, user: userWithoutPassword });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



export const setup2FA = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Utente non autenticato' });
  }

  const userId = req.user.id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const { base32, qrCode } = await generate2FASecret(user.email);

  // Salva il secret temporaneamente (opzionale: attendi verifica per salvarlo definitivamente)
  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorSecret: base32 }
  });

  res.json({ qrCode });
};



export const verify2FA = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Utente non autenticato' });
  }

  const userId = req.user.id;
  const { token } = req.body;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.twoFactorSecret) return res.status(400).json({ message: 'No secret found' });

  const isValid = verify2FAToken(user.twoFactorSecret, token);

  if (!isValid) return res.status(401).json({ message: 'Invalid 2FA code' });

  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorEnabled: true },
  });

  res.json({ message: '2FA enabled successfully' });
};

export const enable2FA = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ message: 'Non autorizzato' });

  const secret = speakeasy.generateSecret();

  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorSecret: secret.base32 },
  });

  res.json({ otpauth_url: secret.otpauth_url });
};