import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../../auth/auth.service';
import { LoginDto } from '../../auth/dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Admin - Authentication')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Admin login (platform admins only)' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 403, description: 'User is not a platform admin' })
  login(@Body() dto: LoginDto) {
    return this.authService.loginAdmin(dto);
  }
}
