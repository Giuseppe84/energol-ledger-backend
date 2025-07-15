// src/utils/paymentServiceStatusCalculator.ts
import prisma from './prisma'; // Importa l'istanza di Prisma

export const calculateAndSetWorkPaymentStatus = async (workId: string) => {
  try {
    const work = await prisma.work.findUnique({
      where: { id: workId },
      include: {
        workPayments: {
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

    if (!work) {
      console.warn(`Work with ID ${workId} not found. Cannot calculate payment status.`);
      return;
    }

    if (work.amount === null) {
      console.warn(`Work ${workId} has no defined amount. Cannot calculate payment status.`);
      await prisma.work.update({
        where: { id: workId },
        data: { paymentStatus: 'NO_AMOUNT' },
      });
      return;
    }

    // Filtra i pagamenti completati dalla relazione WorkPayment e somma gli importi
    const totalPaid = work.workPayments.reduce(
      (sum: number, sp: { payment: { amount: number; isRefund: boolean; status: string } }) => {
        if (sp.payment && sp.payment.status === 'COMPLETED') {
          return sum + (sp.payment.isRefund ? -sp.payment.amount : sp.payment.amount);
        }
        return sum;
      },
      0
    );

    // Controlla se ci sono pagamenti completati che sono rimborsi
    const hasCompletedRefunds = work.workPayments.some(
      (sp: { payment: { isRefund: boolean; status: string } }) =>
        sp.payment && sp.payment.status === 'COMPLETED' && sp.payment.isRefund
    );

    let newStatus: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED' | 'NO_AMOUNT';

    if (totalPaid <= 0 && work.amount > 0) {
      newStatus = 'PENDING';
    } else if (totalPaid >= work.amount) {
      newStatus = 'PAID';
    } else if (totalPaid > 0 && totalPaid < work.amount) {
      newStatus = 'PARTIALLY_PAID';
    } else {
      newStatus = 'PENDING'; // Default
    }

    // Aggiungi logica per lo stato 'REFUNDED' solo se l'importo totale pagato è <= 0 e ci sono rimborsi effettivi completati
    if (totalPaid <= 0 && hasCompletedRefunds) {
        newStatus = 'REFUNDED';
    }

    if (work.paymentStatus !== newStatus) {
      await prisma.work.update({
        where: { id: workId },
        data: { paymentStatus: newStatus },
      });
      console.log(`Work ${workId} payment status updated to: ${newStatus}`);
    }

  } catch (error) {
    console.error(`Error calculating payment status for work ${workId}:`, error);
  }
};

// Funzione per ricalcolare lo stato di pagamento di più lavori
export const recalculatePaymentStatusForWorks = async (workIds: string[]) => {
  const worksToRecalculate = [];

  for (const workId of workIds) {
    const work = await prisma.work.findUnique({
      where: { id: workId },
      include: {
        workPayments: {
          include: {
            payment: true,
          },
        },
      },
    });

    if (work) {
      worksToRecalculate.push(
        ...work.workPayments.map(
          (sp: { workId: string }) => sp.workId
        )
      );
    }
  }

  // Rimuovi i duplicati
  const uniqueWorksToRecalculate = Array.from(new Set(worksToRecalculate));

  // Ricalcola lo stato di pagamento per i lavori unici
  for (const workId of uniqueWorksToRecalculate) {
    await calculateAndSetWorkPaymentStatus(workId);
  }
};

// Funzione per disconnettere i pagamenti dai lavori
export const disconnectPaymentsFromWorks = async (paymentId: string, workIdsToDisconnect: string[]) => {
  try {
    await prisma.workPayment.deleteMany({
      where: {
        paymentId: paymentId,
        workId: {
          in: workIdsToDisconnect,
        },
      },
    });
    console.log(`Disconnected payment ${paymentId} from works: ${workIdsToDisconnect.join(', ')}`);
  } catch (error) {
    console.error(`Error disconnecting payment ${paymentId} from works:`, error);
  }
};