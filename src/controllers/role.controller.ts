// src/controllers/role.controller.ts
import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getAllRoles = async (_req: Request, res: Response) => {
  try {
    const roles = await prisma.role.findMany();
    res.status(200).json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createRole = async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Role name is required.' });
  try {
    const newRole = await prisma.role.create({ data: { name } });
    res.status(201).json({ message: 'Role created successfully', role: newRole });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getRoleById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) {
      return res.status(404).json({ message: 'Role not found.' });
    }
    res.status(200).json(role);
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Role name is required.' });
  }

  try {
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) {
      return res.status(404).json({ message: 'Role not found.' });
    }

    const updatedRole = await prisma.role.update({
      where: { id },
      data: { name }
    });

    res.status(200).json({ message: 'Role updated successfully', role: updatedRole });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) {
      return res.status(404).json({ message: 'Role not found.' });
    }

    await prisma.role.delete({ where: { id } });

    res.status(200).json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};