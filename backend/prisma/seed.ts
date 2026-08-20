import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

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

async function main() {
  const user = await prisma.user.update({
    where: {
      email: 'test@freshcut.de',
    },
    data: {
      role: 'SUPER_ADMIN',
    },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  console.log('User aktualisiert:');
  console.log(user);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });