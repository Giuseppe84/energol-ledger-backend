// src/controllers/permission.controller.ts
import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export const createPermission = async (req: Request, res: Response) => {
  const { action, resource, description } = req.body;
  if (!action || !resource) {
    return res.status(400).json({ message: 'Permission action and resource are required.' });
  }
  try {
    const newPermission = await prisma.permission.create({
      data: {
        action: action.toUpperCase(), // Salva in UPPERCASE
        resource: resource.toUpperCase(), // Salva in UPPERCASE
        description
      }
    });
    res.status(201).json({ message: 'Permission created successfully', permission: newPermission });
  } catch (error) {
    console.error('Error creating permission:', error);
      if ((error as any).code === 'P2002') { // Controlla il codice dell'errore (PrismaClientKnownRequestError)
      return res.status(409).json({ message: 'Un utente con questa email esiste già.' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllPermissions = async (req: Request, res: Response) => {
  try {
    const permissions = await prisma.permission.findMany();
    res.status(200).json(permissions);
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPermissionById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const permission = await prisma.permission.findUnique({ where: { id } });
    if (!permission) {
      return res.status(404).json({ message: 'Permission not found.' });
    }
    res.status(200).json(permission);
  } catch (error) {
    console.error('Error fetching permission:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updatePermission = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { action, resource, description } = req.body;
  try {
    const updatedPermission = await prisma.permission.update({
      where: { id },
      data: {
        action: action ? action.toUpperCase() : undefined,
        resource: resource ? resource.toUpperCase() : undefined,
        description,
        updatedAt: new Date()
      }
    });
    res.status(200).json({ message: 'Permission updated successfully', permission: updatedPermission });
  } catch (error) {
    console.error('Error updating permission:', error);
    if (error instanceof PrismaClientKnownRequestError && (error as PrismaClientKnownRequestError).code === 'P2002') {
      return res.status(409).json({ message: 'Another permission with this action and resource already exists.' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deletePermission = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // Prima di eliminare un permesso, assicurati che non sia collegato a nessun ruolo
    const rolesWithPermission = await prisma.rolePermission.count({ where: { permissionId: id } });
    if (rolesWithPermission > 0) {
      return res.status(400).json({ message: 'Cannot delete permission: it is associated with one or more roles. Please disassociate it first.' });
    }

    await prisma.permission.delete({ where: { id } });
    res.status(200).json({ message: 'Permission deleted successfully' });
  } catch (error) {
    console.error('Error deleting permission:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};