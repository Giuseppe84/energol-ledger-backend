"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteService = exports.updateService = exports.getServiceById = exports.getAllServices = exports.createService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const createService = async (req, res) => {
    const { name, description } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Service name is required.' });
    }
    try {
        const newService = await prisma_1.default.service.create({
            data: {
                name,
                description,
            },
        });
        res.status(201).json({ message: 'Service created successfully', service: newService });
    }
    catch (error) {
        console.error('Error creating service:', error);
        if (error.code === 'P2002') {
            return res.status(409).json({ message: 'Service with this name already exists.' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createService = createService;
const getAllServices = async (req, res) => {
    try {
        const services = await prisma_1.default.service.findMany({
            include: {
                works: {
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
        res.status(200).json(services);
    }
    catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllServices = getAllServices;
const getServiceById = async (req, res) => {
    const { id } = req.params;
    try {
        const service = await prisma_1.default.service.findUnique({
            where: { id },
            include: {
                works: {
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
        if (!service) {
            return res.status(404).json({ message: 'Service not found.' });
        }
        res.status(200).json(service);
    }
    catch (error) {
        console.error('Error fetching service:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getServiceById = getServiceById;
const updateService = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
        const updatedService = await prisma_1.default.service.update({
            where: { id },
            data: {
                name,
                description,
                updatedAt: new Date(),
            },
        });
        res.status(200).json({ message: 'Service updated successfully', service: updatedService });
    }
    catch (error) {
        console.error('Error updating service:', error);
        if (error.code === 'P2002') {
            return res.status(409).json({ message: 'Service with this name already exists.' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateService = updateService;
const deleteService = async (req, res) => {
    const { id } = req.params;
    try {
        const service = await prisma_1.default.service.findUnique({
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
        await prisma_1.default.service.delete({ where: { id } });
        res.status(200).json({ message: 'Service deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteService = deleteService;
