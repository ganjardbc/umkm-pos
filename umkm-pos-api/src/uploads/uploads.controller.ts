import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { PermissionGuard } from '../common/guards/permission.guard';
import { multerOptions } from './multer.config';
import {
  UploadResponseDto,
  SignedUrlResponseDto,
  UploadMetadataResponseDto,
} from './dto/upload-response.dto';

@ApiTags('Uploads')
@ApiBearerAuth()
@Controller('uploads')
@UseGuards(PermissionGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @RequirePermission('upload.create')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  @ApiOperation({ summary: 'Upload a file to S3-compatible storage' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    type: UploadResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  @ApiResponse({ status: 413, description: 'File too large' })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') userId: string,
  ): Promise<UploadResponseDto> {
    return this.uploadsService.upload(file, userId);
  }

  @Get(':id')
  @RequirePermission('upload.read')
  @ApiOperation({ summary: 'Get file metadata by ID' })
  @ApiResponse({
    status: 200,
    description: 'File metadata',
    type: UploadMetadataResponseDto,
  })
  @ApiResponse({ status: 404, description: 'File not found' })
  async findOne(@Param('id') id: string): Promise<UploadMetadataResponseDto> {
    return this.uploadsService.findById(id);
  }

  @Get(':id/signed-url')
  @RequirePermission('upload.read')
  @ApiOperation({ summary: 'Generate a pre-signed URL for file access' })
  @ApiResponse({
    status: 200,
    description: 'Signed URL generated',
    type: SignedUrlResponseDto,
  })
  @ApiResponse({ status: 404, description: 'File not found' })
  async getSignedUrl(@Param('id') id: string): Promise<SignedUrlResponseDto> {
    return this.uploadsService.generateSignedUrl(id);
  }

  @Delete(':id')
  @RequirePermission('upload.delete')
  @ApiOperation({ summary: 'Delete a file from S3 and database' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.uploadsService.delete(id);
  }
}
