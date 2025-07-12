// src/controllers/payment.controller.ts
import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { calculateAndSetServicePaymentStatus } from '../utils/paymentServiceStatusCalculator';


export const createPayment = async (req: Request, res: Response) => {
  const { date, amount, isRefund, status, method, serviceIds } = req.body;

  // I campi date, amount, isRefund, status, method sono ora obbligatori.
  // serviceIds è un array opzionale di ID di servizi a cui questo pagamento si riferisce.
  if (!date || !amount || typeof isRefund === 'undefined' || !status || !method) {
    return res.status(400).json({ message: 'Date, amount, isRefund, status, and method are required for a payment.' });
  }

  try {
    // Controlla se i serviceIds forniti esistono e sono validi
    if (serviceIds && serviceIds.length > 0) {
      const existingServices = await prisma.service.findMany({
        where: { id: { in: serviceIds } },
        select: { id: true }
      });
      if (existingServices.length !== serviceIds.length) {
        // Trova gli ID dei servizi non trovati per un messaggio di errore più specifico
        const foundIds = existingServices.map((s:any) => s.id);
        const notFoundIds = serviceIds.filter((id: string) => !foundIds.includes(id));
        return res.status(404).json({ message: `One or more services not found: ${notFoundIds.join(', ')}` });
      }
    }

    const newPayment = await prisma.payment.create({
      data: {
        date: new Date(date),
        amount: parseFloat(amount),
        isRefund: Boolean(isRefund),
        status, // Assicurati che lo status sia valido (es. "PENDING", "COMPLETED", "FAILED")
        method,
        servicePayments: {
          create: serviceIds ? serviceIds.map((serviceId: string) => ({
            service: { connect: { id: serviceId } }
          })) : []
        }
      },
      include: {
        servicePayments: { // Includi anche la relazione ServicePayment
          include: {
            service: { select: { id: true, description: true, amount: true } }
          }
        }
      }
    });

    // Dopo aver creato il pagamento, ricalcola lo stato di pagamento per i servizi interessati
    if (serviceIds && serviceIds.length > 0) {
      for (const serviceId of serviceIds) {
        await calculateAndSetServicePaymentStatus(serviceId);
      }
    }

    res.status(201).json({ message: 'Payment created successfully', payment: newPayment });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllPayments = async (req: Request, res: Response) => {
  const { status, method, isRefund } = req.query;
  // Oggetto di filtro senza tipizzazione Prisma esplicita
  const where: {
    status?: string;
    method?: string;
    isRefund?: boolean;
  } = {};

  if (status) where.status = String(status);
  if (method) where.method = String(method);
  if (typeof isRefund !== 'undefined') where.isRefund = String(isRefund).toLowerCase() === 'true';

  try {
    const payments = await prisma.payment.findMany({
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
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPaymentById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const payment = await prisma.payment.findUnique({
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
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updatePayment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { date, amount, isRefund, status, method, serviceIds } = req.body;

  // Ottieni lo stato attuale del pagamento e i servizi collegati
  const currentPayment = await prisma.payment.findUnique({
    where: { id },
    include: {
      servicePayments: { select: { serviceId: true } }
    }
  });

  if (!currentPayment) {
    return res.status(404).json({ message: 'Payment not found.' });
  }

  const servicesToRecalculate: string[] = [];

  try {
    // Oggetto di update senza tipizzazione Prisma esplicita
    const updateData: {
      date?: Date;
      amount?: number;
      isRefund?: boolean;
      status?: string;
      method?: string;
      updatedAt?: Date;
      servicePayments?: any;
    } = {
      updatedAt: new Date(),
    };

    if (date !== undefined) updateData.date = new Date(date);
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (isRefund !== undefined) updateData.isRefund = Boolean(isRefund);
    if (status !== undefined) updateData.status = status;
    if (method !== undefined) updateData.method = method;

    if (serviceIds !== undefined) {
      const currentServiceIds = currentPayment.servicePayments.map((sp:any) => sp.serviceId);
      const serviceIdsToDisconnect = currentServiceIds.filter((serviceId:any) => !serviceIds.includes(serviceId));
      const serviceIdsToConnect = serviceIds.filter((serviceId: string) => !currentServiceIds.includes(serviceId));

      if (serviceIdsToConnect.length > 0) {
        const existingNewServices = await prisma.service.findMany({
          where: { id: { in: serviceIdsToConnect } },
          select: { id: true }
        });
        if (existingNewServices.length !== serviceIdsToConnect.length) {
          const foundIds = existingNewServices.map((s:any) => s.id);
          const notFoundIds = serviceIdsToConnect.filter((id: string) => !foundIds.includes(id));
          return res.status(404).json({ message: `One or more new services to connect not found: ${notFoundIds.join(', ')}` });
        }
      }

      updateData.servicePayments = {
        deleteMany: serviceIdsToDisconnect.map((serviceId:any) => ({
          paymentId: id,
          serviceId: serviceId
        })),
        create: serviceIdsToConnect.map((serviceId: string) => ({
          service: { connect: { id: serviceId } }
        }))
      };

      servicesToRecalculate.push(...new Set([...currentServiceIds, ...serviceIds]));
    } else {
      servicesToRecalculate.push(...currentPayment.servicePayments.map((sp:any) => sp.serviceId));
    }

    const updatedPayment = await prisma.payment.update({
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
      await calculateAndSetServicePaymentStatus(serviceId);
    }

    res.status(200).json({ message: 'Payment updated successfully', payment: updatedPayment });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deletePayment = async (req: Request, res: Response) => {
  const { id } = req.params;

  // Recupera gli ID dei servizi collegati prima di eliminare il pagamento
  const servicesLinkedToPayment = await prisma.servicePayment.findMany({
    where: { paymentId: id },
    select: { serviceId: true }
  });
  const serviceIdsToRecalculate = servicesLinkedToPayment.map((sp:any) => sp.serviceId);

  try {
    // Elimina prima tutte le entità ServicePayment collegate a questo pagamento
    await prisma.servicePayment.deleteMany({
      where: { paymentId: id },
    });

    // Quindi elimina il pagamento stesso
    await prisma.payment.delete({ where: { id } });

    // Ricalcola lo stato di pagamento per i servizi che erano collegati
    for (const serviceId of serviceIdsToRecalculate) {
      await calculateAndSetServicePaymentStatus(serviceId);
    }

    res.status(200).json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};