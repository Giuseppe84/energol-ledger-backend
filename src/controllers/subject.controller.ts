// src/controllers/subject.controller.ts
import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

// Create Subject
export const createSubject = async (req: Request, res: Response) => {
  const { taxId, firstName, lastName, clientId, isSamePerson = false } = req.body;

  if (!taxId || !firstName || !lastName) {
    return res.status(400).json({ message: 'Fields taxId, firstName, lastName are required.' });
  }
// Validate taxId format (example: simple regex for demonstration)
  try {
    // Create subject with only taxId, firstName, lastName
    const newSubject = await prisma.subject.create({
      data: {
        taxId,
        firstName,
        lastName,
      }
    });
    // If clientId is provided, create clientSubject with isSamePerson, no duplicate checks
    if (clientId) {
      await prisma.clientSubject.create({
        data: {
          clientId,
          subjectId: newSubject.id,
          isSamePerson
        }
      });
    }
    res.status(201).json({ message: 'Subject created successfully', subject: newSubject });
  } catch (error) {
    console.error('Error creating subject:', error);
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ message: 'A subject with this taxId already exists.' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all Subjects
export const getAllSubjects = async (req: Request, res: Response) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        clientSubjects: {
          include: {
            client: true
          }
        }
      }
    });
    res.status(200).json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Subject by ID
export const getSubjectById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        clientSubjects: {
          include: {
            client: true
          }
        }
      }
    });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found.' });
    }
    res.status(200).json(subject);
  } catch (error) {
    console.error('Error fetching subject:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update Subject
export const updateSubject = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { taxId, firstName, lastName } = req.body;

  try {
    const updatedSubject = await prisma.subject.update({
      where: { id },
      data: {
        taxId,
        firstName,
        lastName
      }
    });
    res.status(200).json({ message: 'Subject updated successfully', subject: updatedSubject });
  } catch (error) {
    console.error('Error updating subject:', error);
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ message: 'A subject with this taxId already exists.' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete Subject
export const deleteSubject = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const subject = await prisma.subject.findUnique({ where: { id } });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found.' });
    }

    await prisma.subject.delete({ where: { id } });
    res.status(200).json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Assign client to subject
export const assignClientToSubject = async (req: Request, res: Response) => {
  const { id, clientId } = req.params;
  const { isSamePerson = false } = req.body;

  try {
    const subject = await prisma.subject.findUnique({ where: { id } });
    const client = await prisma.client.findUnique({ where: { id: clientId } });

    if (!subject || !client) {
      return res.status(404).json({ message: 'Client or subject not found.' });
    }

    const existing = await prisma.clientSubject.findUnique({
      where: {
        clientId_subjectId: {
          clientId,
          subjectId: id
        }
      }
    });

    if (existing) {
      return res.status(409).json({ message: 'This client is already linked to the subject.' });
    }

    const link = await prisma.clientSubject.create({
      data: {
        clientId,
        subjectId: id,
        isSamePerson
      }
    });

    res.status(201).json({ message: 'Client linked to subject successfully', link });
  } catch (error) {
    console.error('Error assigning client to subject:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
