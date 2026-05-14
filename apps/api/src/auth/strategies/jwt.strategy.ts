import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';

/**
 * JWT Strategy
 * Validates JWT token and attaches user to request
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prisma: PrismaService,
    config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        config.get<string>('JWT_SECRET') ||
        'dev_secret_change_me_in_production_2026',
    });
  }

  /**
   * Validate JWT payload and return user
   * This user object will be attached to request.user
   */
  async validate(payload: any) {
    // Payload contains: { sub: userId, email: userEmail }
    const user = await this.prisma.users.findUnique({
      where: { id: payload.sub },
      include: {
        merchants: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Return user object (will be available as request.user)
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      merchant_id: user.merchant_id,
      merchant: user.merchants,
      is_active: user.is_active,
    };
  }
}
