import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../database/prisma.service';

describe('NotificationsService', () => {
  let service: NotificationsService;

  const mockPrisma = {
    user_roles: { findMany: jest.fn() },
    notifications: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    jest.clearAllMocks();
  });

  it('returns paginated notifications', async () => {
    mockPrisma.user_roles.findMany.mockResolvedValue([]);
    mockPrisma.notifications.findMany.mockResolvedValue([{ id: 'n1' }]);
    mockPrisma.notifications.count.mockResolvedValue(1);

    const result = await service.findAll('u1', 'm1', { page: 1, limit: 10, skip: 0 });

    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  it('marks all as read in scope', async () => {
    mockPrisma.user_roles.findMany.mockResolvedValue([]);
    mockPrisma.notifications.updateMany.mockResolvedValue({ count: 3 });

    const result = await service.markAllAsRead('u1', 'm1');

    expect(result.updated).toBe(3);
  });
});
