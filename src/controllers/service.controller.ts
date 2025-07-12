import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// Recupera tutti i servizi
export const getAllServices = async (_req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      include: {
        client: { select: { id: true, firstName: true, lastName: true, email: true } },
        property: { select: { id: true, address: true, city: true } },
        serviceType: { select: { id: true, name: true } },
        subject: { select: { id: true, taxId: true, firstName: true, lastName: true } }
      }
    });
    res.status(200).json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Crea un nuovo servizio
export const createService = async (req: Request, res: Response) => {
  const { description, date, amount, clientId, propertyId, serviceTypeId, subjectId } = req.body;

  if (!description || !date || !amount || !clientId || !serviceTypeId) {
    return res.status(400).json({ message: 'Description, date, amount, clientId, and serviceTypeId are required.' });
  }

  try {
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) return res.status(404).json({ message: 'Client not found.' });

    const serviceType = await prisma.serviceType.findUnique({ where: { id: serviceTypeId } });
    if (!serviceType) return res.status(404).json({ message: 'Service type not found.' });

    if (propertyId) {
      const property = await prisma.property.findUnique({ where: { id: propertyId } });
      if (!property) return res.status(404).json({ message: 'Property not found.' });
    }

    if (subjectId) {
      const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
      if (!subject) return res.status(404).json({ message: 'Subject not found.' });
    }

    const newService = await prisma.service.create({
      data: {
        description,
        date: new Date(date),
        amount: Number(amount),
        client: { connect: { id: clientId } },
        property: propertyId ? { connect: { id: propertyId } } : undefined,
        serviceType: { connect: { id: serviceTypeId } },
        subject: { connect: { id: subjectId } } ,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        client: true,
        property: true,
        serviceType: true,
        subject: true,
      }
    });

    res.status(201).json({ message: 'Service created successfully', service: newService });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Recupera un servizio per ID
export const getServiceById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        client: true,
        property: true,
        serviceType: true,
        subject: true,
      }
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

// Aggiorna un servizio
export const updateService = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { description, date, amount, clientId, propertyId, serviceTypeId, subjectId } = req.body;

  try {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = new Date(date);
    if (amount !== undefined) updateData.amount = Number(amount);

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

    if (serviceTypeId !== undefined) {
      const serviceTypeExists = await prisma.serviceType.findUnique({ where: { id: serviceTypeId } });
      if (!serviceTypeExists) return res.status(404).json({ message: 'Service type not found.' });
      updateData.serviceType = { connect: { id: serviceTypeId } };
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

    const updatedService = await prisma.service.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        property: true,
        serviceType: true,
        subject: true,
      }
    });

    res.status(200).json({ message: 'Service updated successfully', service: updatedService });
  } catch (error) {
    console.error('Error updating service:', error);
    if ((error as any).code === 'P2002') {
      return res.status(409).json({ message: 'A service with these data already exists.' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Elimina un servizio
export const deleteService = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.service.delete({ where: { id } });
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
