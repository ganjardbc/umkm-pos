import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { CreateUserDto } from '../../../users/dto/create-user.dto';
import { UsersQueryDto } from '../../../users/dto/users-query.dto';

export class AdminUsersQueryDto extends UsersQueryDto {
  @ApiPropertyOptional({
    description: 'Filter users by merchant ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID()
  merchant_id?: string;
}

export class AdminCreateUserDto extends CreateUserDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Merchant the user belongs to',
  })
  @IsNotEmpty()
  @IsUUID()
  merchant_id: string;
}

export class AdminUserRoleDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440081',
    description: 'Role ID',
  })
  @IsNotEmpty()
  @IsUUID()
  role_id: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440021',
    description: "Outlet ID (must belong to the user's merchant)",
  })
  @IsNotEmpty()
  @IsUUID()
  outlet_id: string;
}
