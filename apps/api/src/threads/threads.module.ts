import { Module } from '@nestjs/common';
import { ThreadsService } from './threads.service';
import { ThreadsController } from './threads.controller';

@Module({ providers: [ThreadsService], controllers: [ThreadsController] })
export class ThreadsModule {}
