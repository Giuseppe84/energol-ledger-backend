import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// Recupera tutti i work
export const getAllWorks = async (_req: Request, res: Response) => {
  try {
    const works = await prisma.work.findMany({
      include: {
        client: { select: { id: true, firstName: true, lastName: true, email: true } },
        property: { select: { id: true, address: true, city: true } },
        service: { select: { id: true, name: true } },
        subject: { select: { id: true, taxId: true, firstName: true, lastName: true } }
      }
    });
    res.status(200).json(works);
  } catch (error) {
    console.error('Error fetching works:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Crea un nuovo work
export const createWork = async (req: Request, res: Response) => {
  const { description, date, amount, clientId, propertyId, serviceId, subjectId, acquisitionDate, completionDate } = req.body;

  if (!description || !date || !amount || !clientId || !serviceId) {
    return res.status(400).json({ message: 'Description, date, amount, clientId, and serviceId are required.' });
  }

  try {
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) return res.status(404).json({ message: 'Client not found.' });

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) return res.status(404).json({ message: 'Service not found.' });

    if (propertyId) {
      const property = await prisma.property.findUnique({ where: { id: propertyId } });
      if (!property) return res.status(404).json({ message: 'Property not found.' });
    }

    if (subjectId) {
      const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
      if (!subject) return res.status(404).json({ message: 'Subject not found.' });
    }

    const newWork = await prisma.work.create({
      data: {
        description,
        date: new Date(date),
        amount: Number(amount),
        client: { connect: { id: clientId } },
        property: propertyId ? { connect: { id: propertyId } } : undefined,
        service: { connect: { id: serviceId } },
        subject: { connect: { id: subjectId } } ,
        acquisitionDate: acquisitionDate ? new Date(acquisitionDate) : undefined,
        completionDate: completionDate ? new Date(completionDate) : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        client: true,
        property: true,
        service: true,
        subject: true,
      }
    });

    res.status(201).json({ message: 'Work created successfully', work: newWork });
  } catch (error) {
    console.error('Error creating work:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Recupera un work per ID
export const getWorkById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const work = await prisma.work.findUnique({
      where: { id },
      include: {
        client: true,
        property: true,
        service: true,
        subject: true,
      }
    });
    if (!work) {
      return res.status(404).json({ message: 'Work not found.' });
    }
    res.status(200).json(work);
  } catch (error) {
    console.error('Error fetching work:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Aggiorna un work
export const updateWork = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { description, date, amount, clientId, propertyId, serviceId, subjectId, acquisitionDate, completionDate } = req.body;

  try {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = new Date(date);
    if (amount !== undefined) updateData.amount = Number(amount);
    if (acquisitionDate !== undefined) updateData.acquisitionDate = new Date(acquisitionDate);
    if (completionDate !== undefined) updateData.completionDate = new Date(completionDate);

    if (clientId !== undefined) {
      const clientExists = await prisma.client.findUnique({ where: { id: clientId } });
      if (!clientExists) return res.status(404).json({ message: 'Client not found.' });
      updateData.client = { connect: { id: clientId } };
    }

    if (propertyId !== undefined) {
      if (propertyId === null) {
        updateData.property = { disconnect: true };
      } else {
        const propertyExists = await prisma.property.findUnique({ where: { id: propertyId } });
        if (!propertyExists) return res.status(404).json({ message: 'Property not found.' });
        updateData.property = { connect: { id: propertyId } };
      }
    }

    if (serviceId !== undefined) {
      const serviceExists = await prisma.service.findUnique({ where: { id: serviceId } });
      if (!serviceExists) return res.status(404).json({ message: 'Service not found.' });
      updateData.service = { connect: { id: serviceId } };
    }

    if (subjectId !== undefined) {
      if (subjectId === null) {
        updateData.subject = { disconnect: true };
      } else {
        const subjectExists = await prisma.subject.findUnique({ where: { id: subjectId } });
        if (!subjectExists) return res.status(404).json({ message: 'Subject not found.' });
        updateData.subject = { connect: { id: subjectId } };
      }
    }

    const updatedWork = await prisma.work.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        property: true,
        service: true,
        subject: true,
      }
    });

    res.status(200).json({ message: 'Work updated successfully', work: updatedWork });
  } catch (error) {
    console.error('Error updating work:', error);
    if ((error as any).code === 'P2002') {
      return res.status(409).json({ message: 'A work with these data already exists.' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Elimina un work
export const deleteWork = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.work.delete({ where: { id } });
    res.status(200).json({ message: 'Work deleted successfully' });
  } catch (error) {
    console.error('Error deleting work:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
