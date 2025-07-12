"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePayment = exports.updatePayment = exports.getPaymentById = exports.getAllPayments = exports.createPayment = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const paymentServiceStatusCalculator_1 = require("../utils/paymentServiceStatusCalculator");
const createPayment = async (req, res) => {
    const { date, amount, isRefund, status, method, serviceIds } = req.body;
    // I campi date, amount, isRefund, status, method sono ora obbligatori.
    // serviceIds è un array opzionale di ID di servizi a cui questo pagamento si riferisce.
    if (!date || !amount || typeof isRefund === 'undefined' || !status || !method) {
        return res.status(400).json({ message: 'Date, amount, isRefund, status, and method are required for a payment.' });
    }
    try {
        // Controlla se i serviceIds forniti esistono e sono validi
        if (serviceIds && serviceIds.length > 0) {
            const existingServices = await prisma_1.default.service.findMany({
                where: { id: { in: serviceIds } },
                select: { id: true }
            });
            if (existingServices.length !== serviceIds.length) {
                // Trova gli ID dei servizi non trovati per un messaggio di errore più specifico
                const foundIds = existingServices.map((s) => s.id);
                const notFoundIds = serviceIds.filter((id) => !foundIds.includes(id));
                return res.status(404).json({ message: `One or more services not found: ${notFoundIds.join(', ')}` });
            }
        }
        const newPayment = await prisma_1.default.payment.create({
            data: {
                date: new Date(date),
                amount: parseFloat(amount),
                isRefund: Boolean(isRefund),
                status, // Assicurati che lo status sia valido (es. "PENDING", "COMPLETED", "FAILED")
                method,
                servicePayments: {
                    create: serviceIds ? serviceIds.map((serviceId) => ({
                        service: { connect: { id: serviceId } }
                    })) : []
                }
            },
            include: {
                servicePayments: {
                    include: {
                        service: { select: { id: true, description: true, amount: true } }
                    }
                }
            }
        });
        // Dopo aver creato il pagamento, ricalcola lo stato di pagamento per i servizi interessati
        if (serviceIds && serviceIds.length > 0) {
            for (const serviceId of serviceIds) {
                await (0, paymentServiceStatusCalculator_1.calculateAndSetServicePaymentStatus)(serviceId);
            }
        }
        res.status(201).json({ message: 'Payment created successfully', payment: newPayment });
    }
    catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createPayment = createPayment;
const getAllPayments = async (req, res) => {
    const { status, method, isRefund } = req.query;
    // Oggetto di filtro senza tipizzazione Prisma esplicita
    const where = {};
    if (status)
        where.status = String(status);
    if (method)
        where.method = String(method);
    if (typeof isRefund !== 'undefined')
        where.isRefund = String(isRefund).toLowerCase() === 'true';
    try {
        const payments = await prisma_1.default.payment.findMany({
            where,
            include: {
                servicePayments: {
                    include: {
                        service: { select: { id: true, description: true, amount: true, clientId: true, paymentStatus: true } }
                    }
                }
            }
        });
        res.status(200).json(payments);
    }
    catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllPayments = getAllPayments;
const getPaymentById = async (req, res) => {
    const { id } = req.params;
    try {
        const payment = await prisma_1.default.payment.findUnique({
            where: { id },
            include: {
                servicePayments: {
                    include: {
                        service: { select: { id: true, description: true, amount: true, clientId: true, paymentStatus: true } }
                    }
                }
            }
        });
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found.' });
        }
        res.status(200).json(payment);
    }
    catch (error) {
        console.error('Error fetching payment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getPaymentById = getPaymentById;
const updatePayment = async (req, res) => {
    const { id } = req.params;
    const { date, amount, isRefund, status, method, serviceIds } = req.body;
    // Ottieni lo stato attuale del pagamento e i servizi collegati
    const currentPayment = await prisma_1.default.payment.findUnique({
        where: { id },
        include: {
            servicePayments: { select: { serviceId: true } }
        }
    });
    if (!currentPayment) {
        return res.status(404).json({ message: 'Payment not found.' });
    }
    const servicesToRecalculate = [];
    try {
        // Oggetto di update senza tipizzazione Prisma esplicita
        const updateData = {
            updatedAt: new Date(),
        };
        if (date !== undefined)
            updateData.date = new Date(date);
        if (amount !== undefined)
            updateData.amount = parseFloat(amount);
        if (isRefund !== undefined)
            updateData.isRefund = Boolean(isRefund);
        if (status !== undefined)
            updateData.status = status;
        if (method !== undefined)
            updateData.method = method;
        if (serviceIds !== undefined) {
            const currentServiceIds = currentPayment.servicePayments.map((sp) => sp.serviceId);
            const serviceIdsToDisconnect = currentServiceIds.filter((serviceId) => !serviceIds.includes(serviceId));
            const serviceIdsToConnect = serviceIds.filter((serviceId) => !currentServiceIds.includes(serviceId));
            if (serviceIdsToConnect.length > 0) {
                const existingNewServices = await prisma_1.default.service.findMany({
                    where: { id: { in: serviceIdsToConnect } },
                    select: { id: true }
                });
                if (existingNewServices.length !== serviceIdsToConnect.length) {
                    const foundIds = existingNewServices.map((s) => s.id);
                    const notFoundIds = serviceIdsToConnect.filter((id) => !foundIds.includes(id));
                    return res.status(404).json({ message: `One or more new services to connect not found: ${notFoundIds.join(', ')}` });
                }
            }
            updateData.servicePayments = {
                deleteMany: serviceIdsToDisconnect.map((serviceId) => ({
                    paymentId: id,
                    serviceId: serviceId
                })),
                create: serviceIdsToConnect.map((serviceId) => ({
                    service: { connect: { id: serviceId } }
                }))
            };
            servicesToRecalculate.push(...new Set([...currentServiceIds, ...serviceIds]));
        }
        else {
            servicesToRecalculate.push(...currentPayment.servicePayments.map((sp) => sp.serviceId));
        }
        const updatedPayment = await prisma_1.default.payment.update({
            where: { id },
            data: updateData,
            include: {
                servicePayments: {
                    include: {
                        service: { select: { id: true, description: true, amount: true } }
                    }
                }
            }
        });
        for (const serviceId of servicesToRecalculate) {
            await (0, paymentServiceStatusCalculator_1.calculateAndSetServicePaymentStatus)(serviceId);
        }
        res.status(200).json({ message: 'Payment updated successfully', payment: updatedPayment });
    }
    catch (error) {
        console.error('Error updating payment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updatePayment = updatePayment;
const deletePayment = async (req, res) => {
    const { id } = req.params;
    // Recupera gli ID dei servizi collegati prima di eliminare il pagamento
    const servicesLinkedToPayment = await prisma_1.default.servicePayment.findMany({
        where: { paymentId: id },
        select: { serviceId: true }
    });
    const serviceIdsToRecalculate = servicesLinkedToPayment.map((sp) => sp.serviceId);
    try {
        // Elimina prima tutte le entità ServicePayment collegate a questo pagamento
        await prisma_1.default.servicePayment.deleteMany({
            where: { paymentId: id },
        });
        // Quindi elimina il pagamento stesso
        await prisma_1.default.payment.delete({ where: { id } });
        // Ricalcola lo stato di pagamento per i servizi che erano collegati
        for (const serviceId of serviceIdsToRecalculate) {
            await (0, paymentServiceStatusCalculator_1.calculateAndSetServicePaymentStatus)(serviceId);
        }
        res.status(200).json({ message: 'Payment deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting payment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deletePayment = deletePayment;
