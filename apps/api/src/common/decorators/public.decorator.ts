import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator to mark endpoint as public (skip JWT authentication)
 * Usage: @Public()
 *
 * Use this for endpoints like login, register that don't require authentication
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
