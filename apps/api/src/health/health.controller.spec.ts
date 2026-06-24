import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { PrismaService } from '../database';
import { ServiceUnavailableException } from '@nestjs/common';

describe('HealthController', () => {
  let controller: HealthController;
  let prismaService: PrismaService;

  const mockPrismaService = {
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkDb', () => {
    it('should return status up when database connection is healthy', async () => {
      mockPrismaService.$queryRaw.mockResolvedValueOnce([1]);

      const result = await controller.checkDb();

      expect(result).toEqual({
        status: 'up',
        database: {
          status: 'up',
        },
      });
      expect(mockPrismaService.$queryRaw).toHaveBeenCalled();
    });

    it('should throw ServiceUnavailableException when database connection fails', async () => {
      const dbError = new Error('Connection failed');
      mockPrismaService.$queryRaw.mockRejectedValueOnce(dbError);

      await expect(controller.checkDb()).rejects.toThrow(ServiceUnavailableException);
    });

    it('should throw ServiceUnavailableException with correct response structure when database connection fails', async () => {
      const dbError = new Error('Connection failed');
      mockPrismaService.$queryRaw.mockRejectedValueOnce(dbError);

      let thrownError: any;
      try {
        await controller.checkDb();
      } catch (error) {
        thrownError = error;
      }

      expect(thrownError).toBeInstanceOf(ServiceUnavailableException);
      expect(thrownError.getResponse()).toEqual({
        status: 'down',
        database: {
          status: 'down',
          message: 'Connection failed',
        },
      });
    });

    it('should handle non-Error exceptions gracefully', async () => {
      mockPrismaService.$queryRaw.mockRejectedValueOnce('string error');

      let thrownError: any;
      try {
        await controller.checkDb();
      } catch (error) {
        thrownError = error;
      }

      expect(thrownError).toBeInstanceOf(ServiceUnavailableException);
      expect(thrownError.getResponse()).toEqual({
        status: 'down',
        database: {
          status: 'down',
          message: 'Unknown error',
        },
      });
    });
  });
});
