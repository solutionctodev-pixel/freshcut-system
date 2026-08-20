import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client';
import * as bcrypt from 'bcrypt';

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
  }

  const adapter = new PrismaPg({
    connectionString,
  });

  const prisma = new PrismaClient({
    adapter,
  });

  const email = 'test@freshcut.de';
  const password = 'Testkunde123!';

  try {
    const passwordHash = await bcrypt.hash(
      password,
      12,
    );

    const user = await prisma.user.update({
      where: {
        email,
      },
      data: {
        passwordHash,
        role: 'CUSTOMER',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    console.log('');
    console.log(
      '========================================',
    );
    console.log(
      'KUNDENPASSWORT ERFOLGREICH GESETZT',
    );
    console.log(
      '========================================',
    );
    console.log('');
    console.log('E-Mail:', user.email);
    console.log('Passwort:', password);
    console.log('Rolle:', user.role);
    console.log('');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('');
  console.error(
    'FEHLER BEIM SETZEN DES PASSWORTS:',
  );
  console.error(error);
  process.exit(1);
});