// src/controllers/client.controller.ts
import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import {Prisma} from '@prisma/client'; // <-- MODIFICA QUI
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export const createClient = async (req: Request, res: Response) => {
  const { firstName, lastName, email, phone, taxId, vatNumber } = req.body;

  // taxId e email sono ora obbligatori, e abbiamo firstName e lastName al posto di name
  if (!firstName || !lastName || !email || !taxId) {
    return res.status(400).json({ message: 'First name, last name, email, and tax ID are required for a client.' });
  }

  try {
    const newClient = await prisma.client.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        taxId,
        vatNumber // vatNumber è opzionale, quindi può essere null/undefined
      }
    });
    res.status(201).json({ message: 'Client created successfully', client: newClient });
  } catch (error) {
    console.error('Error creating client:', error);
    if (error as any) {
      // P2002: Unique constraint failed on the fields: `taxId`, `email`, `vatNumber`
      let message = 'Client with this email already exists.';
      if ((error as any).meta?.target?.includes('taxId')) {
        message = 'Client with this Tax ID (Codice Fiscale) already exists.';
      } else if ((error as any).meta?.target?.includes('vatNumber')) {
        message = 'Client with this VAT Number (Partita IVA) already exists.';
      }
      return res.status(409).json({ message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllClients = async (req: Request, res: Response) => {
  try {
    const clients = await prisma.client.findMany({
      include: {
        properties: { select: { id: true, address: true, city: true } }, // Includi solo alcuni dettagli
        works: { select: { id: true, description: true, amount: true } }
      }
    });
    res.status(200).json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getClientById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        properties: true, // Includi tutte le proprietà
        works: true,   // Includi tutti i servizi
        clientSubjects: {
          include: {
            subject: true
          }
        }
      }
    });
    if (!client) {
      return res.status(404).json({ message: 'Client not found.' });
    }
    res.status(200).json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateClient = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { firstName, lastName, email, phone, taxId, vatNumber } = req.body;
  try {
    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        phone,
        taxId,
        vatNumber,
        updatedAt: new Date()
      }
    });
    res.status(200).json({ message: 'Client updated successfully', client: updatedClient });
  } catch (error) {
    console.error('Error updating client:', error);
    if (error instanceof PrismaClientKnownRequestError && (error as PrismaClientKnownRequestError).code === 'P2002') {
      let message = 'Another client with this email already exists.';
      if ((error as any).meta?.target?.includes('taxId')) {
        message = 'Another client with this Tax ID (Codice Fiscale) already exists.';
      } else if ((error as any).meta?.target?.includes('vatNumber')) {
        message = 'Another client with this VAT Number (Partita IVA) already exists.';
      }
      return res.status(409).json({ message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteClient = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        works: { select: { id: true } },
        properties: { select: { id: true } },
        // Se un client ha Subject[], dovresti gestire anche questo
        clientSubjects: { select: { subjectId: true } }
      }
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found.' });
    }

    // Controlla e impedisci l'eliminazione se ci sono dipendenze
    if (client.works.length > 0 || client.properties.length > 0 || client.clientSubjects.length > 0) {
      return res.status(400).json({ message: 'Cannot delete client: associated services, properties, or subjects exist. Please reassign or delete them first.' });
    }

    await prisma.client.delete({ where: { id } });
    res.status(200).json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};