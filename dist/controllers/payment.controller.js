"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePayment = exports.updatePayment = exports.getPaymentById = exports.getAllPayments = exports.createPayment = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const paymentWorkStatusCalculator_1 = require("../utils/paymentWorkStatusCalculator");
const createPayment = async (req, res) => {
    const { date, amount, isRefund, status, method, workIds } = req.body;
    // I campi date, amount, isRefund, status, method sono ora obbligatori.
    // workIds è un array opzionale di ID di lavori a cui questo pagamento si riferisce.
    if (!date || !amount || typeof isRefund === 'undefined' || !status || !method) {
        return res.status(400).json({ message: 'Date, amount, isRefund, status, and method are required for a payment.' });
    }
    try {
        // Controlla se i workIds forniti esistono e sono validi
        if (workIds && workIds.length > 0) {
            const existingWorks = await prisma_1.default.work.findMany({
                where: { id: { in: workIds } },
                select: { id: true }
            });
            if (existingWorks.length !== workIds.length) {
                // Trova gli ID dei lavori non trovati per un messaggio di errore più specifico
                const foundIds = existingWorks.map((w) => w.id);
                const notFoundIds = workIds.filter((id) => !foundIds.includes(id));
                return res.status(404).json({ message: `One or more works not found: ${notFoundIds.join(', ')}` });
            }
        }
        const newPayment = await prisma_1.default.payment.create({
            data: {
                date: new Date(date),
                amount: parseFloat(amount),
                isRefund: Boolean(isRefund),
                status, // Assicurati che lo status sia valido (es. "PENDING", "COMPLETED", "FAILED")
                method,
                workPayments: {
                    create: workIds ? workIds.map((workId) => ({
                        work: { connect: { id: workId } }
                    })) : []
                }
            },
            include: {
                workPayments: {
                    include: {
                        work: { select: { id: true, description: true, amount: true } }
                    }
                }
            }
        });
        // Dopo aver creato il pagamento, ricalcola lo stato di pagamento per i lavori interessati
        if (workIds && workIds.length > 0) {
            for (const workId of workIds) {
                await (0, paymentWorkStatusCalculator_1.calculateAndSetWorkPaymentStatus)(workId);
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
                workPayments: {
                    include: {
                        work: { select: { id: true, description: true, amount: true, clientId: true, paymentStatus: true } }
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
                workPayments: {
                    include: {
                        work: { select: { id: true, description: true, amount: true, clientId: true, paymentStatus: true } }
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
    const { date, amount, isRefund, status, method, workIds } = req.body;
    // Ottieni lo stato attuale del pagamento e i lavori collegati
    const currentPayment = await prisma_1.default.payment.findUnique({
        where: { id },
        include: {
            workPayments: { select: { workId: true } }
        }
    });
    if (!currentPayment) {
        return res.status(404).json({ message: 'Payment not found.' });
    }
    const worksToRecalculate = [];
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
        if (workIds !== undefined) {
            const currentWorkIds = currentPayment.workPayments.map((wp) => wp.workId);
            const workIdsToDisconnect = currentWorkIds.filter((workId) => !workIds.includes(workId));
            const workIdsToConnect = workIds.filter((workId) => !currentWorkIds.includes(workId));
            if (workIdsToConnect.length > 0) {
                const existingNewWorks = await prisma_1.default.work.findMany({
                    where: { id: { in: workIdsToConnect } },
                    select: { id: true }
                });
                if (existingNewWorks.length !== workIdsToConnect.length) {
                    const foundIds = existingNewWorks.map((w) => w.id);
                    const notFoundIds = workIdsToConnect.filter((id) => !foundIds.includes(id));
                    return res.status(404).json({ message: `One or more new works to connect not found: ${notFoundIds.join(', ')}` });
                }
            }
            updateData.workPayments = {
                deleteMany: workIdsToDisconnect.map((workId) => ({
                    paymentId: id,
                    workId: workId
                })),
                create: workIdsToConnect.map((workId) => ({
                    work: { connect: { id: workId } }
                }))
            };
            worksToRecalculate.push(...new Set([...currentWorkIds, ...workIds]));
        }
        else {
            worksToRecalculate.push(...currentPayment.workPayments.map((wp) => wp.workId));
        }
        const updatedPayment = await prisma_1.default.payment.update({
            where: { id },
            data: updateData,
            include: {
                workPayments: {
                    include: {
                        work: { select: { id: true, description: true, amount: true } }
                    }
                }
            }
        });
        for (const workId of worksToRecalculate) {
            await (0, paymentWorkStatusCalculator_1.calculateAndSetWorkPaymentStatus)(workId);
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
    // Recupera gli ID dei lavori collegati prima di eliminare il pagamento
    const worksLinkedToPayment = await prisma_1.default.workPayment.findMany({
        where: { paymentId: id },
        select: { workId: true }
    });
    const workIdsToRecalculate = worksLinkedToPayment.map((wp) => wp.workId);
    try {
        // Elimina prima tutte le entità WorkPayment collegate a questo pagamento
        await prisma_1.default.workPayment.deleteMany({
            where: { paymentId: id },
        });
        // Quindi elimina il pagamento stesso
        await prisma_1.default.payment.delete({ where: { id } });
        // Ricalcola lo stato di pagamento per i lavori che erano collegati
        for (const workId of workIdsToRecalculate) {
            await (0, paymentWorkStatusCalculator_1.calculateAndSetWorkPaymentStatus)(workId);
        }
        res.status(200).json({ message: 'Payment deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting payment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deletePayment = deletePayment;
