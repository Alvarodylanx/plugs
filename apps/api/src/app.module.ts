import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { NotesModule } from './notes/notes.module';
import { SessionsModule } from './sessions/sessions.module';
import { ThreadsModule } from './threads/threads.module';
import { ProgressModule } from './progress/progress.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    NotesModule,
    SessionsModule,
    ThreadsModule,
    ProgressModule,
  ],
})
export class AppModule {}
