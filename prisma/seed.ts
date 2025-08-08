// prisma/seed.ts
import { PrismaClient, PermissionAction, PermissionResource, UserRole, PaymentStatus } from '@prisma/client';
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

  // Subject seed
  const subjectA = await prisma.subject.upsert({
    where: { taxId: 'LNCGPP90A01H501W' },
    update: {},
    create: {
      taxId: 'LNCGPP90A01H501W',
      firstName: 'Giuseppe',
      lastName: 'Lancia',
      clientSubjects: {
        create: [{ clientId: client1.id, isSamePerson: false }],
      },
    },
  });

  const subjectB = await prisma.subject.upsert({
    where: { taxId: 'FRNPLA85D22H501Y' },
    update: {},
    create: {
      taxId: 'FRNPLA85D22H501Y',
      firstName: 'Paola',
      lastName: 'Ferrini',
      clientSubjects: {
        create: [{ clientId: client2.id, isSamePerson: true }],
      },
    },
  });

  const subject1 = await prisma.subject.upsert({
    where: { taxId: 'BNCLCU90E10H501P' },
    update: {},
    create: {
      taxId: 'BNCLCU90E10H501P',
      firstName: 'Luca',
      lastName: 'Bianchi',
      clientSubjects: {
        create: [{ clientId: client1.id }],
      },
    },
  });

  const subject2 = await prisma.subject.upsert({
    where: { taxId: 'VRDSRA85C45H501R' },
    update: {},
    create: {
      taxId: 'VRDSRA85C45H501R',
      firstName: 'Sara',
      lastName: 'Verdi',
      clientSubjects: {
        create: [{ clientId: client2.id }],
      },
    },
  });

  const subject3 = await prisma.subject.upsert({
    where: { taxId: 'LCRGNN95E01H501F' },
    update: {},
    create: {
      taxId: 'LCRGNN95E01H501F',
      firstName: 'Gianna',
      lastName: 'Locorotondo',
      clientSubjects: {
        create: [{ clientId: client1.id }],
      },
    },
  });

  const subject4 = await prisma.subject.upsert({
    where: { taxId: 'MRSFRN80A01H501C' },
    update: {},
    create: {
      taxId: 'MRSFRN80A01H501C',
      firstName: 'Franco',
      lastName: 'Maraschio',
      clientSubjects: {
        create: [{ clientId: client2.id }],
      },
    },
  });

  // Property seed - Sud Salento (Lecce)
  const propertyA = await prisma.property.upsert({
    where: { cadastralCode: 'EF789' },
    update: {},
    create: {
      cadastralCode: 'EF789',
      address: 'Via Firenze 7',
      city: 'Tricase',
      subjectId: subjectA.id,
      sheet: 35,
      parcel: 128,
      subordinates: '1,2',
      latitude: 39.9302,
      longitude: 18.3619,
      location: Buffer.from(`POINT(18.3619 39.9302)`),
    },
  });

  const propertyB = await prisma.property.upsert({
    where: { cadastralCode: 'GH012' },
    update: {},
    create: {
      cadastralCode: 'GH012',
      address: 'Via Napoli 20',
      city: 'Gagliano del Capo',
      subjectId: subjectA.id,
      sheet: 41,
      parcel: 222,
      subordinates: '3',
      latitude: 39.8446,
      longitude: 18.3733,
      location: Buffer.from(`POINT(18.3733 39.8446)`),
    },
  });

  const propertyC = await prisma.property.upsert({
    where: { cadastralCode: 'IJ345' },
    update: {},
    create: {
      cadastralCode: 'IJ345',
      address: 'Via Palermo 33',
      city: 'Morciano di Leuca',
      subjectId: subjectB.id,
      sheet: 19,
      parcel: 87,
      subordinates: '5,6,7',
      latitude: 39.8364,
      longitude: 18.3344,
      location: Buffer.from(`POINT(18.3344 39.8364)`),
    },
  });

  // 3. Crea alcune proprietà - Sud Salento (Lecce)
  const property1 = await prisma.property.upsert({
    where: { cadastralCode: 'AB123' },
    update: {},
    create: {
      cadastralCode: 'AB123',
      address: 'Via Roma 1',
      city: 'Corsano',
      subjectId: subject1.id,
      sheet: 22,
      parcel: 59,
      subordinates: '4',
      latitude: 39.9198,
      longitude: 18.3601,
      location: Buffer.from(`POINT(18.3601 39.9198)`),
    },
  });

  const property2 = await prisma.property.upsert({
    where: { cadastralCode: 'CD456' },
    update: {},
    create: {
      cadastralCode: 'CD456',
      address: 'Via Milano 10',
      city: 'Tiggiano',
      subjectId: subject2.id,
      sheet: 28,
      parcel: 144,
      subordinates: '2,3',
      latitude: 39.9422,
      longitude: 18.3587,
      location: Buffer.from(`POINT(18.3587 39.9422)`),
    },
  });

  const property3 = await prisma.property.upsert({
    where: { cadastralCode: 'KL678' },
    update: {},
    create: {
      cadastralCode: 'KL678',
      address: 'Via Lecce 15',
      city: 'Alessano',
      subjectId: subject3.id,
      sheet: 26,
      parcel: 112,
      subordinates: '1,2,3',
      latitude: 39.9123,
      longitude: 18.3304,
      location: Buffer.from(`POINT(18.3304 39.9123)`),
    },
  });

  const property4 = await prisma.property.upsert({
    where: { cadastralCode: 'MN901' },
    update: {},
    create: {
      cadastralCode: 'MN901',
      address: 'Via Gallipoli 7',
      city: 'Specchia',
      subjectId: subject4.id,
      sheet: 31,
      parcel: 76,
      subordinates: '5',
      latitude: 39.9572,
      longitude: 18.3067,
      location: Buffer.from(`POINT(18.3067 39.9572)`),
    },
  });

  // 4. Crea alcuni servizi
  const service1 = await prisma.service.upsert({
    where: { name: 'Consulenza Energetica' },
    update: {},
    create: {
      name: 'Consulenza Energetica',
      description: 'Servizio di consulenza per l’efficientamento',
      amount: 1000,
    },
  });

  const service2 = await prisma.service.upsert({
    where: { name: 'Analisi Fattibilità' },
    update: {},
    create: {
      name: 'Analisi Fattibilità',
      description: 'Analisi tecnica di fattibilità',
      amount: 1500,
    },
  });

  // 5. Crea alcuni lavori
  const work1 = await prisma.work.create({
    data: {
      description: 'Installazione pannelli solari',
      acquisitionDate: new Date('2025-06-01'),
      amount: 5000,
      subjectId: subject1.id,
      clientId: client1.id,
      propertyId: property1.id,
      serviceId: service1.id,
    },
  });

  const work2 = await prisma.work.create({
    data: {
      description: 'Audit energetico edificio',
      acquisitionDate: new Date('2025-06-15'),
      amount: 2000,
      subjectId: subject2.id,
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
      status: PaymentStatus.PAID,
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
      status: PaymentStatus.PARTIALLY_PAID,
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