// Mock @prisma/client before any imports
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(),
}));

// Mock @prisma/adapter-mariadb
jest.mock('@prisma/adapter-mariadb', () => ({
  PrismaMariaDb: jest.fn(),
}));

// Set a dummy DATABASE_URL for tests
process.env.DATABASE_URL = 'mysql://test:test@localhost:3306/test';
