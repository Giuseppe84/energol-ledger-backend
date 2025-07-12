"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectPaymentsFromServices = exports.recalculatePaymentStatusForServices = exports.calculateAndSetServicePaymentStatus = void 0;
// src/utils/paymentServiceStatusCalculator.ts
const prisma_1 = __importDefault(require("./prisma")); // Importa l'istanza di Prisma
const calculateAndSetServicePaymentStatus = async (serviceId) => {
    try {
        const service = await prisma_1.default.service.findUnique({
            where: { id: serviceId },
            include: {
                servicePayments: {
                    include: {
                        payment: {
                            select: {
                                id: true,
                                amount: true,
                                isRefund: true,
                                status: true,
                            },
                        },
                    },
                },
            },
        });
        if (!service) {
            console.warn(`Service with ID ${serviceId} not found. Cannot calculate payment status.`);
            return;
        }
        if (service.amount === null) {
            console.warn(`Service ${serviceId} has no defined amount. Cannot calculate payment status.`);
            await prisma_1.default.service.update({
                where: { id: serviceId },
                data: { paymentStatus: 'NO_AMOUNT' },
            });
            return;
        }
        // Filtra i pagamenti completati dalla relazione ServicePayment e somma gli importi
        const totalPaid = service.servicePayments.reduce((sum, sp) => {
            if (sp.payment && sp.payment.status === 'COMPLETED') {
                return sum + (sp.payment.isRefund ? -sp.payment.amount : sp.payment.amount);
            }
            return sum;
        }, 0);
        // Controlla se ci sono pagamenti completati che sono rimborsi
        const hasCompletedRefunds = service.servicePayments.some((sp) => sp.payment && sp.payment.status === 'COMPLETED' && sp.payment.isRefund);
        let newStatus;
        if (totalPaid <= 0 && service.amount > 0) {
            newStatus = 'PENDING';
        }
        else if (totalPaid >= service.amount) {
            newStatus = 'PAID';
        }
        else if (totalPaid > 0 && totalPaid < service.amount) {
            newStatus = 'PARTIALLY_PAID';
        }
        else {
            newStatus = 'PENDING'; // Default
        }
        // Aggiungi logica per lo stato 'REFUNDED' solo se l'importo totale pagato è <= 0 e ci sono rimborsi effettivi completati
        if (totalPaid <= 0 && hasCompletedRefunds) {
            newStatus = 'REFUNDED';
        }
        if (service.paymentStatus !== newStatus) {
            await prisma_1.default.service.update({
                where: { id: serviceId },
                data: { paymentStatus: newStatus },
            });
            console.log(`Service ${serviceId} payment status updated to: ${newStatus}`);
        }
    }
    catch (error) {
        console.error(`Error calculating payment status for service ${serviceId}:`, error);
    }
};
exports.calculateAndSetServicePaymentStatus = calculateAndSetServicePaymentStatus;
// Funzione per ricalcolare lo stato di pagamento di più servizi
const recalculatePaymentStatusForServices = async (serviceIds) => {
    const servicesToRecalculate = [];
    for (const serviceId of serviceIds) {
        const service = await prisma_1.default.service.findUnique({
            where: { id: serviceId },
            include: {
                servicePayments: {
                    include: {
                        payment: true,
                    },
                },
            },
        });
        if (service) {
            servicesToRecalculate.push(...service.servicePayments.map((sp) => sp.serviceId));
        }
    }
    // Rimuovi i duplicati
    const uniqueServicesToRecalculate = Array.from(new Set(servicesToRecalculate));
    // Ricalcola lo stato di pagamento per i servizi unici
    for (const serviceId of uniqueServicesToRecalculate) {
        await (0, exports.calculateAndSetServicePaymentStatus)(serviceId);
    }
};
exports.recalculatePaymentStatusForServices = recalculatePaymentStatusForServices;
// Funzione per disconnettere i pagamenti dai servizi
const disconnectPaymentsFromServices = async (paymentId, serviceIdsToDisconnect) => {
    try {
        await prisma_1.default.servicePayment.deleteMany({
            where: {
                paymentId: paymentId,
                serviceId: {
                    in: serviceIdsToDisconnect,
                },
            },
        });
        console.log(`Disconnected payment ${paymentId} from services: ${serviceIdsToDisconnect.join(', ')}`);
    }
    catch (error) {
        console.error(`Error disconnecting payment ${paymentId} from services:`, error);
    }
};
exports.disconnectPaymentsFromServices = disconnectPaymentsFromServices;
