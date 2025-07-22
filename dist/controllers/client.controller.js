"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignSubjectToClient = exports.deleteClient = exports.updateClient = exports.getClientById = exports.getAllClients = exports.createClient = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const library_1 = require("@prisma/client/runtime/library");
const createClient = async (req, res) => {
    const { firstName, lastName, email, phone, taxId, vatNumber } = req.body;
    // taxId e email sono ora obbligatori, e abbiamo firstName e lastName al posto di name
    if (!firstName || !lastName || !email || !taxId) {
        return res.status(400).json({ message: 'First name, last name, email, and tax ID are required for a client.' });
    }
    try {
        const newClient = await prisma_1.default.client.create({
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
    }
    catch (error) {
        console.error('Error creating client:', error);
        if (error) {
            // P2002: Unique constraint failed on the fields: `taxId`, `email`, `vatNumber`
            let message = 'Client with this email already exists.';
            if (error.meta?.target?.includes('taxId')) {
                message = 'Client with this Tax ID (Codice Fiscale) already exists.';
            }
            else if (error.meta?.target?.includes('vatNumber')) {
                message = 'Client with this VAT Number (Partita IVA) already exists.';
            }
            return res.status(409).json({ message });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createClient = createClient;
const getAllClients = async (req, res) => {
    try {
        const clients = await prisma_1.default.client.findMany({
            include: {
                properties: { select: { id: true, address: true, city: true } }, // Includi solo alcuni dettagli
                works: { select: { id: true, description: true, amount: true } }
            }
        });
        res.status(200).json(clients);
    }
    catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllClients = getAllClients;
const getClientById = async (req, res) => {
    const { id } = req.params;
    try {
        const client = await prisma_1.default.client.findUnique({
            where: { id },
            include: {
                properties: true, // Includi tutte le proprietà
                works: true, // Includi tutti i servizi
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
    }
    catch (error) {
        console.error('Error fetching client:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getClientById = getClientById;
const updateClient = async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, phone, taxId, vatNumber } = req.body;
    try {
        const updatedClient = await prisma_1.default.client.update({
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
    }
    catch (error) {
        console.error('Error updating client:', error);
        if (error instanceof library_1.PrismaClientKnownRequestError && error.code === 'P2002') {
            let message = 'Another client with this email already exists.';
            if (error.meta?.target?.includes('taxId')) {
                message = 'Another client with this Tax ID (Codice Fiscale) already exists.';
            }
            else if (error.meta?.target?.includes('vatNumber')) {
                message = 'Another client with this VAT Number (Partita IVA) already exists.';
            }
            return res.status(409).json({ message });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateClient = updateClient;
const deleteClient = async (req, res) => {
    const { id } = req.params;
    try {
        const client = await prisma_1.default.client.findUnique({
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
        await prisma_1.default.client.delete({ where: { id } });
        res.status(200).json({ message: 'Client deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteClient = deleteClient;
// Assign subject to client
const assignSubjectToClient = async (req, res) => {
    const { id, subjectId } = req.params;
    try {
        const client = await prisma_1.default.client.findUnique({ where: { id } });
        const subject = await prisma_1.default.subject.findUnique({ where: { id: subjectId } });
        if (!client || !subject) {
            return res.status(404).json({ message: 'Client or subject not found.' });
        }
        const existing = await prisma_1.default.clientSubject.findUnique({
            where: {
                clientId_subjectId: {
                    clientId: id,
                    subjectId
                }
            }
        });
        if (existing) {
            return res.status(409).json({ message: 'This subject is already linked to the client.' });
        }
        const link = await prisma_1.default.clientSubject.create({
            data: {
                clientId: id,
                subjectId,
                isSamePerson: false
            }
        });
        res.status(201).json({ message: 'Subject linked to client successfully', link });
    }
    catch (error) {
        console.error('Error assigning subject to client:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.assignSubjectToClient = assignSubjectToClient;
