// src/controllers/property.controller.ts
import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// Recupera tutte le proprietà
export const getAllProperties = async (_req: Request, res: Response) => {
  try {
    const properties = await prisma.property.findMany({
      include: {
        subject: { select: { id: true, firstName: true, lastName: true, taxId: true } }
      }
    });
    res.status(200).json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Crea una nuova proprietà
export const createProperty = async (req: Request, res: Response) => {
  const { cadastralCode, address, city, subjectId } = req.body;
  if (!cadastralCode || !address || !city || !subjectId) {
    return res.status(400).json({ message: 'Cadastral code, address, city, and subjectId are required.' });
  }
  try {
    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found.' });
    }
    const newProperty = await prisma.property.create({
      data: {
        cadastralCode,
        address,
        city,
        subject: { connect: { id: subjectId } },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        subject: { select: { id: true, firstName: true, lastName: true, taxId: true } }
      }
    });
    res.status(201).json({ message: 'Property created successfully', property: newProperty });
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Recupera una proprietà per ID
export const getPropertyById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        subject: { select: { id: true, firstName: true, lastName: true, taxId: true } }
      }
    });
    if (!property) {
      return res.status(404).json({ message: 'Property not found.' });
    }
    res.status(200).json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Aggiorna una proprietà
export const updateProperty = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { cadastralCode, address, city, subjectId } = req.body;

  try {
    const updateData: {
      cadastralCode?: string;
      address?: string;
      city?: string;
      updatedAt?: Date;
      subject?: { connect: { id: string } };
    } = {
      updatedAt: new Date(),
    };

    if (cadastralCode !== undefined) updateData.cadastralCode = cadastralCode;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;

    if (subjectId !== undefined) {
      const subjectExists = await prisma.subject.findUnique({ where: { id: subjectId } });
      if (!subjectExists) {
        return res.status(404).json({ message: 'Subject not found.' });
      }
      updateData.subject = { connect: { id: subjectId } };
    }

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: updateData,
      include: {
        subject: { select: { id: true, firstName: true, lastName: true, taxId: true } }
      }
    });

    res.status(200).json({ message: 'Property updated successfully', property: updatedProperty });
  } catch (error) {
    console.error('Error updating property:', error);
    if ((error as any).code === 'P2002') {
      return res.status(409).json({ message: 'Property with this cadastral code already exists.' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Elimina una proprietà
export const deleteProperty = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.property.delete({ where: { id } });
    res.status(200).json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Recupera le proprietà associate a un soggetto (tramite subject)
export const getPropertiesBySubject = async (req: Request, res: Response) => {
  const { subjectId } = req.params;

  try {
    const properties = await prisma.property.findMany({
      where: {
        subjectId
      },
      include: {
        subject: { select: { id: true, firstName: true, lastName: true, taxId: true } }
      }
    });

    res.status(200).json(properties);
  } catch (error) {
    console.error('Error fetching properties by subject:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};