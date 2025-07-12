// src/utils/paymentServiceStatusCalculator.ts
import prisma from './prisma'; // Importa l'istanza di Prisma

export const calculateAndSetServicePaymentStatus = async (serviceId: string) => {
  try {
    const service = await prisma.service.findUnique({
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
      await prisma.service.update({
        where: { id: serviceId },
        data: { paymentStatus: 'NO_AMOUNT' },
      });
      return;
    }

    // Filtra i pagamenti completati dalla relazione ServicePayment e somma gli importi
    const totalPaid = service.servicePayments.reduce(
      (sum: number, sp: { payment: { amount: number; isRefund: boolean; status: string } }) => {
        if (sp.payment && sp.payment.status === 'COMPLETED') {
          return sum + (sp.payment.isRefund ? -sp.payment.amount : sp.payment.amount);
        }
        return sum;
      },
      0
    );

    // Controlla se ci sono pagamenti completati che sono rimborsi
    const hasCompletedRefunds = service.servicePayments.some(
      (sp: { payment: { isRefund: boolean; status: string } }) =>
        sp.payment && sp.payment.status === 'COMPLETED' && sp.payment.isRefund
    );

    let newStatus: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED' | 'NO_AMOUNT';

    if (totalPaid <= 0 && service.amount > 0) {
      newStatus = 'PENDING';
    } else if (totalPaid >= service.amount) {
      newStatus = 'PAID';
    } else if (totalPaid > 0 && totalPaid < service.amount) {
      newStatus = 'PARTIALLY_PAID';
    } else {
      newStatus = 'PENDING'; // Default
    }

    // Aggiungi logica per lo stato 'REFUNDED' solo se l'importo totale pagato è <= 0 e ci sono rimborsi effettivi completati
    if (totalPaid <= 0 && hasCompletedRefunds) {
        newStatus = 'REFUNDED';
    }

    if (service.paymentStatus !== newStatus) {
      await prisma.service.update({
        where: { id: serviceId },
        data: { paymentStatus: newStatus },
      });
      console.log(`Service ${serviceId} payment status updated to: ${newStatus}`);
    }

  } catch (error) {
    console.error(`Error calculating payment status for service ${serviceId}:`, error);
  }
};

// Funzione per ricalcolare lo stato di pagamento di più servizi
export const recalculatePaymentStatusForServices = async (serviceIds: string[]) => {
  const servicesToRecalculate = [];

  for (const serviceId of serviceIds) {
    const service = await prisma.service.findUnique({
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
      servicesToRecalculate.push(
        ...service.servicePayments.map(
          (sp: { serviceId: string }) => sp.serviceId
        )
      );
    }
  }

  // Rimuovi i duplicati
  const uniqueServicesToRecalculate = Array.from(new Set(servicesToRecalculate));

  // Ricalcola lo stato di pagamento per i servizi unici
  for (const serviceId of uniqueServicesToRecalculate) {
    await calculateAndSetServicePaymentStatus(serviceId);
  }
};

// Funzione per disconnettere i pagamenti dai servizi
export const disconnectPaymentsFromServices = async (paymentId: string, serviceIdsToDisconnect: string[]) => {
  try {
    await prisma.servicePayment.deleteMany({
      where: {
        paymentId: paymentId,
        serviceId: {
          in: serviceIdsToDisconnect,
        },
      },
    });
    console.log(`Disconnected payment ${paymentId} from services: ${serviceIdsToDisconnect.join(', ')}`);
  } catch (error) {
    console.error(`Error disconnecting payment ${paymentId} from services:`, error);
  }
};