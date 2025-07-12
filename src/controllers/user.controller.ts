// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';

import {  Prisma } from '@prisma/client'


export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            name: true,
            permissions: {
              include: {
                permission: true // Per visualizzare i permessi associati al ruolo
              }
            }
          }
        },
      },
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            name: true,
            permissions: {
              include: {
                permission: true
              }
            }
          }
        },
      },
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, password, isActive, roleId } = req.body;
  try {
    const updateData: {
      name?: string;
      email?: string;
      password?: string;
      isActive?: boolean;
      role?: { connect: { id: string } };
    } = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    if (isActive !== undefined) updateData.isActive = isActive;

    if (roleId) {
      const roleExists = await prisma.role.findUnique({ where: { id: roleId } });
      if (!roleExists) {
        return res.status(404).json({ message: 'Role not found.' });
      }
      updateData.role = { connect: { id: roleId } };
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        role: { select: { id: true, name: true } },
      },
    });
    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    if ((error as any).code === 'P2002') {
      return res.status(409).json({ message: 'Un utente con questa email esiste già.' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // Prima di eliminare un utente, potresti voler implementare un controllo se è responsabile di servizi attivi
    // O trasferire la responsabilità ad un altro utente
   // const servicesAssigned = await prisma.service.count({ where: { responsibleUserId: id } });
   // if (servicesAssigned > 0) {
   //   return res.status(400).json({ message: 'Cannot delete user: user is responsible for active services. Please reassign services first.' });
   // }

    await prisma.user.delete({ where: { id } });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Nota: la funzione createUser è stata spostata nel auth.controller (register) per gestire la creazione con hash password e assegnazione ruolo.
// Qui non dovrebbe esserci una funzione createUser, l'utente viene creato tramite la rotta di registrazione.