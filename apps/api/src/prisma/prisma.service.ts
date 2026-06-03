import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      await this.$connect();
    } catch (err) {
      console.error('[Prisma] Connection failed:', err?.message ?? err);
      throw err;
    }
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
