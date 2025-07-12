// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';
import dotenv from 'dotenv';

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

