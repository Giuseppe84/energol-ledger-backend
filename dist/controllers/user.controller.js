"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUserById = exports.getAllUsers = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const getAllUsers = async (req, res) => {
    try {
        const users = await prisma_1.default.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                role: {
                    select: {
                        id: true,
                        name: true,
                        permissions: {
                            include: {
                                permission: true // Per visualizzare i permessi associati al ruolo
                            }
                        }
                    }
                },
            },
        });
        res.status(200).json(users);
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllUsers = getAllUsers;
const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                role: {
                    select: {
                        id: true,
                        name: true,
                        permissions: {
                            include: {
                                permission: true
                            }
                        }
                    }
                },
            },
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getUserById = getUserById;
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, password, isActive, roleId } = req.body;
    try {
        const updateData = {};
        if (name)
            updateData.name = name;
        if (email)
            updateData.email = email;
        if (password)
            updateData.password = await bcryptjs_1.default.hash(password, 10);
        if (isActive !== undefined)
            updateData.isActive = isActive;
        if (roleId) {
            const roleExists = await prisma_1.default.role.findUnique({ where: { id: roleId } });
            if (!roleExists) {
                return res.status(404).json({ message: 'Role not found.' });
            }
            updateData.role = { connect: { id: roleId } };
        }
        const updatedUser = await prisma_1.default.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                role: { select: { id: true, name: true } },
            },
        });
        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    }
    catch (error) {
        console.error('Error updating user:', error);
        if (error.code === 'P2002') {
            return res.status(409).json({ message: 'Un utente con questa email esiste già.' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        // Prima di eliminare un utente, potresti voler implementare un controllo se è responsabile di servizi attivi
        // O trasferire la responsabilità ad un altro utente
        // const servicesAssigned = await prisma.service.count({ where: { responsibleUserId: id } });
        // if (servicesAssigned > 0) {
        //   return res.status(400).json({ message: 'Cannot delete user: user is responsible for active services. Please reassign services first.' });
        // }
        await prisma_1.default.user.delete({ where: { id } });
        res.status(200).json({ message: 'User deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteUser = deleteUser;
// Nota: la funzione createUser è stata spostata nel auth.controller (register) per gestire la creazione con hash password e assegnazione ruolo.
// Qui non dovrebbe esserci una funzione createUser, l'utente viene creato tramite la rotta di registrazione.
