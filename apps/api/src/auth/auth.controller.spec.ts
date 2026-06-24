import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
    getProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login and return the result', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'password123' };
      const expectedResult = { access_token: 'token', token_type: 'Bearer', user: {} as any, rbac: [] };
      jest.spyOn(service, 'login').mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(service.login).toHaveBeenCalledWith(loginDto);
      expect(result).toBe(expectedResult);
    });
  });

  describe('register', () => {
    it('should call authService.register and return the result', async () => {
      const registerDto: RegisterDto = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
        merchant: {
          slug: 'new-merchant',
          name: 'New Merchant',
          phone: '123456',
          address: 'Street 1',
          logo: 'logo.png',
        },
        outlets: [
          {
            slug: 'outlet-1',
            name: 'Outlet 1',
            location: 'Location 1',
            logo: 'logo.png',
          },
        ],
      };
      const expectedResult = {
        access_token: 'token',
        token_type: 'Bearer',
        user: {} as any,
        merchant: {} as any,
        outlets: [],
        rbac: [],
      };
      jest.spyOn(service, 'register').mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(service.register).toHaveBeenCalledWith(registerDto);
      expect(result).toBe(expectedResult);
    });
  });

  describe('getProfile', () => {
    it('should call authService.getProfile and return the result', async () => {
      const userId = 'user-id';
      const expectedResult = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        username: 'test',
        avatar: null,
        avatar_upload_id: null,
        merchant_id: 'merchant-id',
        merchants: {} as any,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };
      jest.spyOn(service, 'getProfile').mockResolvedValue(expectedResult);

      const result = await controller.getProfile(userId);

      expect(service.getProfile).toHaveBeenCalledWith(userId);
      expect(result).toBe(expectedResult);
    });
  });
});