"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignClientToSubject = exports.deleteSubject = exports.updateSubject = exports.getSubjectById = exports.getAllSubjects = exports.createSubject = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const library_1 = require("@prisma/client/runtime/library");
// Create Subject
const createSubject = async (req, res) => {
    const { taxId, firstName, lastName, clientId } = req.body;
    if (!taxId || !firstName || !lastName || !clientId) {
        return res.status(400).json({ message: 'All fields (taxId, firstName, lastName, clientId) are required.' });
    }
    try {
        const newSubject = await prisma_1.default.subject.create({
            data: {
                taxId,
                firstName,
                lastName
            }
        });
        await prisma_1.default.clientSubject.create({
            data: {
                clientId,
                subjectId: newSubject.id,
                isSamePerson: false
            }
        });
        res.status(201).json({ message: 'Subject created successfully', subject: newSubject });
    }
    catch (error) {
        console.error('Error creating subject:', error);
        if (error instanceof library_1.PrismaClientKnownRequestError && error.code === 'P2002') {
            return res.status(409).json({ message: 'A subject with this taxId already exists.' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createSubject = createSubject;
// Get all Subjects
const getAllSubjects = async (req, res) => {
    try {
        const subjects = await prisma_1.default.subject.findMany({
            include: {
                clientSubjects: {
                    include: {
                        client: true
                    }
                }
            }
        });
        res.status(200).json(subjects);
    }
    catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllSubjects = getAllSubjects;
// Get Subject by ID
const getSubjectById = async (req, res) => {
    const { id } = req.params;
    try {
        const subject = await prisma_1.default.subject.findUnique({
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
    }
    catch (error) {
        console.error('Error fetching subject:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getSubjectById = getSubjectById;
// Update Subject
const updateSubject = async (req, res) => {
    const { id } = req.params;
    const { taxId, firstName, lastName } = req.body;
    try {
        const updatedSubject = await prisma_1.default.subject.update({
            where: { id },
            data: {
                taxId,
                firstName,
                lastName
            }
        });
        res.status(200).json({ message: 'Subject updated successfully', subject: updatedSubject });
    }
    catch (error) {
        console.error('Error updating subject:', error);
        if (error instanceof library_1.PrismaClientKnownRequestError && error.code === 'P2002') {
            return res.status(409).json({ message: 'A subject with this taxId already exists.' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateSubject = updateSubject;
// Delete Subject
const deleteSubject = async (req, res) => {
    const { id } = req.params;
    try {
        const subject = await prisma_1.default.subject.findUnique({ where: { id } });
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found.' });
        }
        await prisma_1.default.subject.delete({ where: { id } });
        res.status(200).json({ message: 'Subject deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting subject:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteSubject = deleteSubject;
// Assign client to subject
const assignClientToSubject = async (req, res) => {
    const { id, clientId } = req.params;
    try {
        const subject = await prisma_1.default.subject.findUnique({ where: { id } });
        const client = await prisma_1.default.client.findUnique({ where: { id: clientId } });
        if (!subject || !client) {
            return res.status(404).json({ message: 'Client or subject not found.' });
        }
        const existing = await prisma_1.default.clientSubject.findUnique({
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
        const link = await prisma_1.default.clientSubject.create({
            data: {
                clientId,
                subjectId: id,
                isSamePerson: false
            }
        });
        res.status(201).json({ message: 'Client linked to subject successfully', link });
    }
    catch (error) {
        console.error('Error assigning client to subject:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.assignClientToSubject = assignClientToSubject;
