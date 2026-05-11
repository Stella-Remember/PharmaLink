import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Run migrations for test database
  execSync('npx prisma migrate deploy', { env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL } });
});

afterAll(async () => {
  await prisma.$disconnect();
});