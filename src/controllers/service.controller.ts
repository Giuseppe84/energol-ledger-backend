import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';

export const createService = async (req: Request, res: Response) => {
  const { name, description, amount } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Service name is required.' });
  }

  try {
    const newService = await prisma.service.create({
      data: {
        name,
        description,
        amount,
      },
    });
    res.status(201).json({ message: 'Service created successfully', service: newService });
  } catch (error) {
    console.error('Error creating service:', error);
    if ((error as any).code === 'P2002') {
      return res.status(409).json({ message: 'Service with this name already exists.' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllServices = async (req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      include: {
        works: {
          select: {
            id: true,
            description: true,
            amount: true,
            paymentStatus: true,
            clientId: true,
            propertyId: true,
            userId: true,
          },
        },
      },
    });
    res.status(200).json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getServiceById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        works: {
          select: {
            id: true,
            description: true,
            amount: true,
            paymentStatus: true,
            clientId: true,
            propertyId: true,
            userId: true,
          },
        },
      },
    });
    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }
    res.status(200).json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateService = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, amount } = req.body;

  try {
    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        name,
        description,
        amount,
        updatedAt: new Date(),
      },
    });
    res.status(200).json({ message: 'Service updated successfully', service: updatedService });
  } catch (error) {
    console.error('Error updating service:', error);
    if ((error as any).code === 'P2002') {
      return res.status(409).json({ message: 'Service with this name already exists.' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteService = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        works: { select: { id: true } },
      },
    });

    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    if (service.works.length > 0) {
      return res.status(400).json({ message: 'Cannot delete service: works are associated with it. Please reassign works first.' });
    }

    await prisma.service.delete({ where: { id } });
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};