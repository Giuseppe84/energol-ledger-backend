"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRole = exports.updateRole = exports.getRoleById = exports.createRole = exports.getAllRoles = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getAllRoles = async (_req, res) => {
    try {
        const roles = await prisma_1.default.role.findMany();
        res.status(200).json(roles);
    }
    catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllRoles = getAllRoles;
const createRole = async (req, res) => {
    const { name } = req.body;
    if (!name)
        return res.status(400).json({ message: 'Role name is required.' });
    try {
        const newRole = await prisma_1.default.role.create({ data: { name } });
        res.status(201).json({ message: 'Role created successfully', role: newRole });
    }
    catch (error) {
        console.error('Error creating role:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createRole = createRole;
const getRoleById = async (req, res) => {
    const { id } = req.params;
    try {
        const role = await prisma_1.default.role.findUnique({ where: { id } });
        if (!role) {
            return res.status(404).json({ message: 'Role not found.' });
        }
        res.status(200).json(role);
    }
    catch (error) {
        console.error('Error fetching role:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getRoleById = getRoleById;
const updateRole = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Role name is required.' });
    }
    try {
        const role = await prisma_1.default.role.findUnique({ where: { id } });
        if (!role) {
            return res.status(404).json({ message: 'Role not found.' });
        }
        const updatedRole = await prisma_1.default.role.update({
            where: { id },
            data: { name }
        });
        res.status(200).json({ message: 'Role updated successfully', role: updatedRole });
    }
    catch (error) {
        console.error('Error updating role:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateRole = updateRole;
const deleteRole = async (req, res) => {
    const { id } = req.params;
    try {
        const role = await prisma_1.default.role.findUnique({ where: { id } });
        if (!role) {
            return res.status(404).json({ message: 'Role not found.' });
        }
        await prisma_1.default.role.delete({ where: { id } });
        res.status(200).json({ message: 'Role deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting role:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteRole = deleteRole;
