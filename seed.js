/**
 * Seed: создаёт тестового пользователя.
 * Запуск: npx prisma db seed
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'test@example.com';
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Test user already exists:', email);
    return;
  }
  const hashedPassword = await bcrypt.hash('test123', 10);
  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: 'Тест',
    },
  });
  console.log('Test user created: test@example.com / test123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
