import { Module } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { RbacController } from './rbac.controller';
import { DatabaseModule } from '../database';
import { ScopeByOutletGuard } from '../common/guards/scope-by-outlet.guard';

@Module({
  imports: [DatabaseModule],
  controllers: [RbacController],
  providers: [RbacService, ScopeByOutletGuard],
  exports: [RbacService],
})
export class RbacModule {}
