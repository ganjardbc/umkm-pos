import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'product.jpg' })
  original_name: string;

  @ApiProperty({ example: 'image/jpeg' })
  mime_type: string;

  @ApiProperty({ example: 102400 })
  size: number;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000/product.jpg' })
  s3_key: string;

  @ApiProperty({
    example:
      'https://umkm-pos-uploads.s3.amazonaws.com/uuid/product.jpg?X-Amz-Algorithm=...',
  })
  url: string;
}

export class SignedUrlResponseDto {
  @ApiProperty({
    example:
      'https://umkm-pos-uploads.s3.amazonaws.com/uuid/product.jpg?X-Amz-Algorithm=...',
  })
  url: string;
}

export class UploadMetadataResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'product.jpg' })
  original_name: string;

  @ApiProperty({ example: 'image/jpeg' })
  mime_type: string;

  @ApiProperty({ example: 102400 })
  size: number;

  @ApiProperty({ example: 'uuid/uuid/product.jpg' })
  s3_key: string;

  @ApiProperty({ example: 'umkm-pos-uploads' })
  bucket: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
