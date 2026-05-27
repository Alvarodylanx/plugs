import { Module } from '@nestjs/common';
import { ThreadsService } from './threads.service';
import { ThreadsController } from './threads.controller';
import { BadgesModule } from '../badges/badges.module';

@Module({
  imports: [BadgesModule],
  providers: [ThreadsService],
  controllers: [ThreadsController],
})
export class ThreadsModule {}
