import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { AdminMerchantsService } from './admin-merchants.service';
import { PrismaService } from '../../database/prisma.service';
import { UploadsService } from '../../uploads/uploads.service';

describe('AdminMerchantsService', () => {
  let service: AdminMerchantsService;

  const mockPrisma = {
    merchants: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    uploads: { findUnique: jest.fn() },
    $transaction: jest.fn(),
  };

  const mockUploadsService = { generateSignedUrl: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminMerchantsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: UploadsService, useValue: mockUploadsService },
      ],
    }).compile();

    service = module.get<AdminMerchantsService>(AdminMerchantsService);
  });

  it('findAll lists merchants without scoping to the caller', async () => {
    mockPrisma.$transaction.mockResolvedValue([
      [{ id: 'm-1' }, { id: 'm-2' }],
      2,
    ]);

    const result = await service.findAll({
      page: 1,
      limit: 10,
      skip: 0,
    } as any);

    expect(mockPrisma.merchants.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: undefined }),
    );
    expect(result.data).toHaveLength(2);
  });

  it('getOptions returns lightweight options ordered by name asc', async () => {
    const mockOptions = [
      { id: 'm-1', name: 'Alpha', slug: 'alpha' },
      { id: 'm-2', name: 'Beta', slug: 'beta' },
    ];
    mockPrisma.merchants.findMany.mockResolvedValue(mockOptions);

    const result = await service.getOptions();

    expect(mockPrisma.merchants.findMany).toHaveBeenCalledWith({
      where: undefined,
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    });
    expect(result).toEqual(mockOptions);
  });

  it('getOptions filters by search term across name and slug', async () => {
    const mockOptions = [{ id: 'm-1', name: 'Alpha', slug: 'alpha' }];
    mockPrisma.merchants.findMany.mockResolvedValue(mockOptions);

    const result = await service.getOptions('alp');

    expect(mockPrisma.merchants.findMany).toHaveBeenCalledWith({
      where: {
        OR: [{ name: { contains: 'alp' } }, { slug: { contains: 'alp' } }],
      },
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    });
    expect(result).toEqual(mockOptions);
  });

  it('findOne throws NotFound for unknown merchant', async () => {
    mockPrisma.merchants.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('create rejects a duplicate slug', async () => {
    mockPrisma.merchants.findUnique.mockResolvedValue({ id: 'm-1' });

    await expect(
      service.create({ slug: 'demo', name: 'Demo' }, 'admin-1'),
    ).rejects.toThrow(ConflictException);
  });

  it('remove refuses to delete the admin merchant', async () => {
    mockPrisma.merchants.findUnique.mockResolvedValue({
      id: 'm-admin',
      slug: 'merchant-admin',
    });

    await expect(service.remove('m-admin')).rejects.toThrow(ForbiddenException);
    expect(mockPrisma.merchants.delete).not.toHaveBeenCalled();
  });

  it('remove deletes a tenant merchant', async () => {
    mockPrisma.merchants.findUnique.mockResolvedValue({
      id: 'm-1',
      slug: 'demo',
    });

    await service.remove('m-1');

    expect(mockPrisma.merchants.delete).toHaveBeenCalledWith({
      where: { id: 'm-1' },
    });
  });

  it('update refuses to change the admin merchant slug', async () => {
    mockPrisma.merchants.findUnique.mockResolvedValue({
      id: 'm-admin',
      slug: 'merchant-admin',
    });

    await expect(
      service.update('m-admin', { slug: 'renamed' }, 'admin-1'),
    ).rejects.toThrow(ForbiddenException);
  });
});
