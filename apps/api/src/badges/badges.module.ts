import { Module } from '@nestjs/common';
import { BadgesService } from './badges.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [BadgesService],
  exports: [BadgesService],
})
export class BadgesModule {}
