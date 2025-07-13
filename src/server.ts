/// src/server.ts
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import prisma from './utils/prisma';
import cookieParser from 'cookie-parser';
// Importa tutte le tue rotte
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import roleRoutes from './routes/role.routes';
import permissionRoutes from './routes/permission.routes'; // <-- Nuova
import clientRoutes from './routes/client.routes';
import propertyRoutes from './routes/property.routes';
import subjectRoutes from './routes/subject.routes';
import serviceTypeRoutes from './routes/serviceType.routes';
import serviceRoutes from './routes/service.routes';
import paymentRoutes from './routes/payment.routes';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cookieParser());
// Middlewares globali
app.use(express.json()); // Per parsare il body delle richieste JSON
app.use(cors()); // Per gestire le richieste cross-origin
app.use(helmet()); // Per aggiungere header di sicurezza
app.use(express.urlencoded({ extended: true })); // Per parsare i dati URL-encoded
// Rotte API
app.get('/', (req, res) => {
  res.send('Welcome to the EnergoLedger API!');
});

// Rotte per autenticazione, ruoli e permessi (spesso non richiedono autenticazione per login/register)
app.use('/api/auth', authRoutes);
app.use('/api/roles', roleRoutes); // Queste rotte useranno i middleware al loro interno
app.use('/api/permissions', permissionRoutes); // Queste rotte useranno i middleware al loro interno

// Tutte le altre rotte che richiedono autenticazione e autorizzazione
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/service-types', serviceTypeRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/payments', paymentRoutes);

// Gestione degli errori (catch-all)
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Avvia il server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  prisma.$connect()
    .then(() => console.log('Database connected successfully!'))
    .catch((e:any) => console.error('Database connection failed:', e));
});