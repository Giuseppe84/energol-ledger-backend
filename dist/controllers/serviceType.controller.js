"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteServiceType = exports.updateServiceType = exports.getServiceTypeById = exports.getAllServiceTypes = exports.createServiceType = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const createServiceType = async (req, res) => {
    const { name, description } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Service type name is required.' });
    }
    try {
        const newServiceType = await prisma_1.default.serviceType.create({
            data: {
                name,
                description,
            },
        });
        res.status(201).json({ message: 'Service type created successfully', serviceType: newServiceType });
    }
    catch (error) {
        console.error('Error creating service type:', error);
        if (error.code === 'P2002') { // Controlla il codice dell'errore (PrismaClientKnownRequestError)
            return res.status(409).json({ message: 'Un utente con questa email esiste già.' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createServiceType = createServiceType;
const getAllServiceTypes = async (req, res) => {
    try {
        const serviceTypes = await prisma_1.default.serviceType.findMany({
            // Includi i servizi correlati per vedere quali servizi appartengono a questo tipo
            // Se vuoi includere meno dettagli dei servizi, puoi usare 'select'
            include: {
                services: {
                    select: {
                        id: true,
                        description: true,
                        amount: true,
                        date: true,
                        paymentStatus: true,
                        clientId: true,
                        propertyId: true,
                        userId: true,
                    },
                },
            },
        });
        res.status(200).json(serviceTypes);
    }
    catch (error) {
        console.error('Error fetching service types:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllServiceTypes = getAllServiceTypes;
const getServiceTypeById = async (req, res) => {
    const { id } = req.params;
    try {
        const serviceType = await prisma_1.default.serviceType.findUnique({
            where: { id },
            include: {
                services: {
                    select: {
                        id: true,
                        description: true,
                        amount: true,
                        date: true,
                        paymentStatus: true,
                        clientId: true,
                        propertyId: true,
                        userId: true,
                    },
                },
            },
        });
        if (!serviceType) {
            return res.status(404).json({ message: 'Service type not found.' });
        }
        res.status(200).json(serviceType);
    }
    catch (error) {
        console.error('Error fetching service type:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getServiceTypeById = getServiceTypeById;
const updateServiceType = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
        const updatedServiceType = await prisma_1.default.serviceType.update({
            where: { id },
            data: {
                name,
                description,
                updatedAt: new Date(),
            },
        });
        res.status(200).json({ message: 'Service type updated successfully', serviceType: updatedServiceType });
    }
    catch (error) {
        console.error('Error updating service type:', error);
        if (error.code === 'P2002') { // Controlla il codice dell'errore (PrismaClientKnownRequestError)
            return res.status(409).json({ message: 'Un utente con questa email esiste già.' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateServiceType = updateServiceType;
const deleteServiceType = async (req, res) => {
    const { id } = req.params;
    try {
        const serviceType = await prisma_1.default.serviceType.findUnique({
            where: { id },
            include: {
                services: { select: { id: true } } // Controlla solo l'ID per vedere se ci sono servizi collegati
            }
        });
        if (!serviceType) {
            return res.status(404).json({ message: 'Service type not found.' });
        }
        // Impedisci l'eliminazione se ci sono servizi associati a questo tipo
        if (serviceType.services.length > 0) {
            return res.status(400).json({ message: 'Cannot delete service type: services are associated with it. Please reassign services first.' });
        }
        await prisma_1.default.serviceType.delete({ where: { id } });
        res.status(200).json({ message: 'Service type deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting service type:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteServiceType = deleteServiceType;
