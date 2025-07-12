"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProperty = exports.updateProperty = exports.getPropertyById = exports.createProperty = exports.getAllProperties = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
// Recupera tutte le proprietà
const getAllProperties = async (_req, res) => {
    try {
        const properties = await prisma_1.default.property.findMany({
            include: {
                client: { select: { id: true, firstName: true, lastName: true, email: true } }
            }
        });
        res.status(200).json(properties);
    }
    catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllProperties = getAllProperties;
// Crea una nuova proprietà
const createProperty = async (req, res) => {
    const { cadastralCode, address, city, clientId } = req.body;
    if (!cadastralCode || !address || !city || !clientId) {
        return res.status(400).json({ message: 'Cadastral code, address, city, and clientId are required.' });
    }
    try {
        const client = await prisma_1.default.client.findUnique({ where: { id: clientId } });
        if (!client) {
            return res.status(404).json({ message: 'Client not found.' });
        }
        const newProperty = await prisma_1.default.property.create({
            data: {
                cadastralCode,
                address,
                city,
                client: { connect: { id: clientId } },
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            include: {
                client: { select: { id: true, firstName: true, lastName: true, email: true } }
            }
        });
        res.status(201).json({ message: 'Property created successfully', property: newProperty });
    }
    catch (error) {
        console.error('Error creating property:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createProperty = createProperty;
// Recupera una proprietà per ID
const getPropertyById = async (req, res) => {
    const { id } = req.params;
    try {
        const property = await prisma_1.default.property.findUnique({
            where: { id },
            include: {
                client: { select: { id: true, firstName: true, lastName: true, email: true } }
            }
        });
        if (!property) {
            return res.status(404).json({ message: 'Property not found.' });
        }
        res.status(200).json(property);
    }
    catch (error) {
        console.error('Error fetching property:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getPropertyById = getPropertyById;
// Aggiorna una proprietà
const updateProperty = async (req, res) => {
    const { id } = req.params;
    const { cadastralCode, address, city, clientId } = req.body;
    try {
        const updateData = {
            updatedAt: new Date(),
        };
        if (cadastralCode !== undefined)
            updateData.cadastralCode = cadastralCode;
        if (address !== undefined)
            updateData.address = address;
        if (city !== undefined)
            updateData.city = city;
        if (clientId !== undefined) {
            const clientExists = await prisma_1.default.client.findUnique({ where: { id: clientId } });
            if (!clientExists) {
                return res.status(404).json({ message: 'Client not found.' });
            }
            updateData.client = { connect: { id: clientId } };
        }
        const updatedProperty = await prisma_1.default.property.update({
            where: { id },
            data: updateData,
            include: {
                client: { select: { id: true, firstName: true, lastName: true, email: true } }
            }
        });
        res.status(200).json({ message: 'Property updated successfully', property: updatedProperty });
    }
    catch (error) {
        console.error('Error updating property:', error);
        if (error.code === 'P2002') {
            return res.status(409).json({ message: 'Property with this cadastral code already exists.' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateProperty = updateProperty;
// Elimina una proprietà
const deleteProperty = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma_1.default.property.delete({ where: { id } });
        res.status(200).json({ message: 'Property deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting property:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteProperty = deleteProperty;
