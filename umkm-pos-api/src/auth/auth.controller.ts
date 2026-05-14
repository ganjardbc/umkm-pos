import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

/**
 * Auth Controller
 * Handles authentication endpoints
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * User login
   * Public endpoint - no authentication required
   */
  @Post('login')
  @Public()
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        success: true,
        data: {
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          token_type: 'Bearer',
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'admin@example.com',
            name: 'Admin User',
            merchant_id: '123e4567-e89b-12d3-a456-426614174001',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * User registration
   * Public endpoint - no authentication required
   * Creates merchant, outlets, and user account
   */
  @Post('register')
  @Public()
  @ApiOperation({
    summary: 'User registration with merchant and outlet creation',
  })
  @ApiResponse({
    status: 201,
    description: 'Registration successful',
    schema: {
      example: {
        success: true,
        data: {
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          token_type: 'Bearer',
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'newuser@example.com',
            name: 'New User',
            merchant_id: '123e4567-e89b-12d3-a456-426614174001',
            merchant: {
              id: '123e4567-e89b-12d3-a456-426614174001',
              name: 'My Store',
              slug: 'my-store',
            },
          },
          merchant: {
            id: '123e4567-e89b-12d3-a456-426614174001',
            name: 'My Store',
            slug: 'my-store',
          },
          outlets: [
            {
              id: '123e4567-e89b-12d3-a456-426614174002',
              name: 'Main Branch',
              slug: 'main-branch',
              location: 'Jl. Sudirman No. 1',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Email or merchant slug already exists',
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * Get current user profile
   * Requires authentication
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'admin@example.com',
          name: 'Admin User',
          username: 'admin',
          merchant_id: '123e4567-e89b-12d3-a456-426614174001',
          merchant: {
            id: '123e4567-e89b-12d3-a456-426614174001',
            name: 'My Store',
            slug: 'my-store',
          },
          is_active: true,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.authService.getProfile(userId);
  }
}
