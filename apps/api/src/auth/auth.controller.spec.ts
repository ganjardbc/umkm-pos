import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: any;

  beforeEach(async () => {
    const mockAuthService = {
      login: jest.fn(),
      register: jest.fn(),
      getProfile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login and return the result', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'password' };
      const expectedResult = { access_token: 'token', token_type: 'Bearer', user: {} as any, rbac: [] };
      service.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(service.login).toHaveBeenCalledWith(loginDto);
      expect(result).toBe(expectedResult);
    });
  });

  describe('register', () => {
    it('should call authService.register and return the result', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test',
        merchant: { name: 'Merchant', slug: 'merchant' },
        outlets: [],
      };
      const expectedResult = {
        access_token: 'token',
        token_type: 'Bearer',
        user: {} as any,
        merchant: {} as any,
        outlets: [],
        rbac: [],
      };
      service.register.mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(service.register).toHaveBeenCalledWith(registerDto);
      expect(result).toBe(expectedResult);
    });
  });

  describe('getProfile', () => {
    it('should call authService.getProfile and return the result', async () => {
      const userId = 'user-id';
      const expectedResult = { id: userId, email: 'test@example.com' } as any;
      service.getProfile.mockResolvedValue(expectedResult);

      const result = await controller.getProfile(userId);

      expect(service.getProfile).toHaveBeenCalledWith(userId);
      expect(result).toBe(expectedResult);
    });
  });
});