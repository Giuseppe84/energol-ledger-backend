"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePermission = exports.updatePermission = exports.getPermissionById = exports.getAllPermissions = exports.createPermission = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const library_1 = require("@prisma/client/runtime/library");
const createPermission = async (req, res) => {
    const { action, resource, description } = req.body;
    if (!action || !resource) {
        return res.status(400).json({ message: 'Permission action and resource are required.' });
    }
    try {
        const newPermission = await prisma_1.default.permission.create({
            data: {
                action: action.toUpperCase(), // Salva in UPPERCASE
                resource: resource.toUpperCase(), // Salva in UPPERCASE
                description
            }
        });
        res.status(201).json({ message: 'Permission created successfully', permission: newPermission });
    }
    catch (error) {
        console.error('Error creating permission:', error);
        if (error.code === 'P2002') { // Controlla il codice dell'errore (PrismaClientKnownRequestError)
            return res.status(409).json({ message: 'Un utente con questa email esiste già.' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createPermission = createPermission;
const getAllPermissions = async (req, res) => {
    try {
        const permissions = await prisma_1.default.permission.findMany();
        res.status(200).json(permissions);
    }
    catch (error) {
        console.error('Error fetching permissions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllPermissions = getAllPermissions;
const getPermissionById = async (req, res) => {
    const { id } = req.params;
    try {
        const permission = await prisma_1.default.permission.findUnique({ where: { id } });
        if (!permission) {
            return res.status(404).json({ message: 'Permission not found.' });
        }
        res.status(200).json(permission);
    }
    catch (error) {
        console.error('Error fetching permission:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getPermissionById = getPermissionById;
const updatePermission = async (req, res) => {
    const { id } = req.params;
    const { action, resource, description } = req.body;
    try {
        const updatedPermission = await prisma_1.default.permission.update({
            where: { id },
            data: {
                action: action ? action.toUpperCase() : undefined,
                resource: resource ? resource.toUpperCase() : undefined,
                description,
                updatedAt: new Date()
            }
        });
        res.status(200).json({ message: 'Permission updated successfully', permission: updatedPermission });
    }
    catch (error) {
        console.error('Error updating permission:', error);
        if (error instanceof library_1.PrismaClientKnownRequestError && error.code === 'P2002') {
            return res.status(409).json({ message: 'Another permission with this action and resource already exists.' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updatePermission = updatePermission;
const deletePermission = async (req, res) => {
    const { id } = req.params;
    try {
        // Prima di eliminare un permesso, assicurati che non sia collegato a nessun ruolo
        const rolesWithPermission = await prisma_1.default.rolePermission.count({ where: { permissionId: id } });
        if (rolesWithPermission > 0) {
            return res.status(400).json({ message: 'Cannot delete permission: it is associated with one or more roles. Please disassociate it first.' });
        }
        await prisma_1.default.permission.delete({ where: { id } });
        res.status(200).json({ message: 'Permission deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting permission:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deletePermission = deletePermission;
