// prisma/seed.ts
import { PrismaClient, PermissionAction, PermissionResource, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';


const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Crea alcuni Client
  const client1 = await prisma.client.upsert({
    where: { taxId: 'RSSMRA80A01H501Z' },
    update: {},
    create: {
      taxId: 'RSSMRA80A01H501Z',
      vatNumber: 'IT12345678901',
      firstName: 'Mario',
      lastName: 'Rossi',
      email: 'mario.rossi@example.com',
      phone: '3401234567',
    },
  });

  const client2 = await prisma.client.upsert({
    where: { taxId: 'VRDLGI85B22H501T' },
    update: {},
    create: {
      taxId: 'VRDLGI85B22H501T',
      vatNumber: 'IT98765432100',
      firstName: 'Luigi',
      lastName: 'Verdi',
      email: 'luigi.verdi@example.com',
      phone: '3497654321',
    },
  });

  // 2. Crea alcuni Subject
  const subject1 = await prisma.subject.upsert({
    where: { taxId: 'BNCLCU90E10H501P' },
    update: {},
    create: {
      taxId: 'BNCLCU90E10H501P',
      firstName: 'Luca',
      lastName: 'Bianchi',
      clientId: client1.id,
    },
  });

  const subject2 = await prisma.subject.upsert({
    where: { taxId: 'VRDSRA85C45H501R' },
    update: {},
    create: {
      taxId: 'VRDSRA85C45H501R',
      firstName: 'Sara',
      lastName: 'Verdi',
      clientId: client2.id,
    },
  });

  // 3. Crea alcune proprietà
  const property1 = await prisma.property.upsert({
    where: { cadastralCode: 'AB123' },
    update: {},
    create: {
      cadastralCode: 'AB123',
      address: 'Via Roma 1',
      city: 'Roma',
      clientId: client1.id,
    },
  });

  const property2 = await prisma.property.upsert({
    where: { cadastralCode: 'CD456' },
    update: {},
    create: {
      cadastralCode: 'CD456',
      address: 'Via Milano 10',
      city: 'Milano',
      clientId: client2.id,
    },
  });

  // 4. Crea alcuni servizi
  const service1 = await prisma.service.upsert({
    where: { name: 'Consulenza Energetica' },
    update: {},
    create: {
      name: 'Consulenza Energetica',
      description: 'Servizio di consulenza per l’efficientamento',
    },
  });

  const service2 = await prisma.service.upsert({
    where: { name: 'Analisi Fattibilità' },
    update: {},
    create: {
      name: 'Analisi Fattibilità',
      description: 'Analisi tecnica di fattibilità',
    },
  });

  // 5. Crea alcuni lavori
  const work1 = await prisma.work.create({
    data: {
      description: 'Installazione pannelli solari',
      date: new Date('2025-06-01'),
      amount: 5000,
      subjectId: subject1.taxId,
      clientId: client1.id,
      propertyId: property1.id,
      serviceId: service1.id,
    },
  });

  const work2 = await prisma.work.create({
    data: {
      description: 'Audit energetico edificio',
      date: new Date('2025-06-15'),
      amount: 2000,
      subjectId: subject2.taxId,
      clientId: client2.id,
      propertyId: property2.id,
      serviceId: service2.id,
    },
  });

  // 6. Crea alcuni pagamenti
  await prisma.payment.create({
    data: {
      date: new Date('2025-06-05'),
      amount: 5000,
      isRefund: false,
      status: 'COMPLETED',
      method: 'Bank Transfer',
      workPayments: {
        create: [{ workId: work1.id }],
      },
    },
  });

  await prisma.payment.create({
    data: {
      date: new Date('2025-06-20'),
      amount: 1000,
      isRefund: false,
      status: 'PARTIALLY_PAID',
      method: 'Cash',
      workPayments: {
        create: [{ workId: work2.id }],
      },
    },
  });

  // 3. Crea ruoli di default
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      description: 'Amministratore con pieni privilegi',
    },
  });

  // 3. Crea ruoli di default
  const userRole = await prisma.role.upsert({
    where: { name: 'User' },
    update: {},
    create: {
      name: 'User',
      description: 'User con privilegi standard',
    },
  });


  // 5. Crea permessi (CREATE, UPDATE, DELETE per ogni risorsa)
  const permissionActions: PermissionAction[] = ['CREATE', 'READ', 'UPDATE', 'DELETE'];
  const resources: PermissionResource[] = [
    'USER', 'ROLE', 'PERMISSION', 'CLIENT', 'PROPERTY',
    'SUBJECT', 'WORK', 'SERVICE', 'PAYMENT'
  ];

  for (const action of permissionActions) {
    for (const resource of resources) {
      await prisma.permission.upsert({
        where: {
          action_resource: {
            action,
            resource,
          },
        },
        update: {},
        create: {
          action,
          resource,
          description: `${action} permission for ${resource}`,
        },
      });
    }
  }
  // 4. Crea un utente Admin
const hashedPassword = await bcrypt.hash('qazsazsa', 10);

  await prisma.user.upsert({
    where: { email: 'mgem2@hotmail.it' },
    update: {},
    create: {
      name: 'Giuseppe',
      email: 'mgem2@hotmail.it',
      password: hashedPassword, // ⚠️ In produzione usa un hash sicuro (es. bcrypt)
      roleId: adminRole.id,
    },
  });
// Recupera tutti i permessi
const allPermissions = await prisma.permission.findMany();

// Associa tutti i permessi al ruolo Admin
for (const permission of allPermissions) {
  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    },
    update: {},
    create: {
      roleId: adminRole.id,
      permissionId: permission.id,
    },
  });
}

  console.log('✅ Seeding completed.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());