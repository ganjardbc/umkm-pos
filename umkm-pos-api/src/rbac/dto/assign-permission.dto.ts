import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AssignPermissionDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440091',
    description: 'Permission ID to assign to the role',
  })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  permission_id: string;
}
