"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client"); // Adjust the import path based on your project structure
const prisma = new client_1.PrismaClient();
exports.default = prisma;
