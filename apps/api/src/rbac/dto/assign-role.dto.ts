import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440011',
    description: 'User ID to assign the role to',
  })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  user_id: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440081',
    description: 'Role ID to assign',
  })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  role_id: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440021',
    description: 'Outlet ID this role assignment applies to',
  })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  outlet_id: string;
}
