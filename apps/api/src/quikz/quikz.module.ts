import { Module } from '@nestjs/common';
import { QuikzService } from './quikz.service';
import { QuikzController } from './quikz.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [QuikzService],
  controllers: [QuikzController],
})
export class QuikzModule {}
