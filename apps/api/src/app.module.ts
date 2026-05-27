import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { NotesModule } from './notes/notes.module';
import { SessionsModule } from './sessions/sessions.module';
import { ThreadsModule } from './threads/threads.module';
import { ProgressModule } from './progress/progress.module';
import { VideosModule } from './videos/videos.module';
import { TeachersModule } from './teachers/teachers.module';
import { BadgesModule } from './badges/badges.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    NotesModule,
    SessionsModule,
    ThreadsModule,
    ProgressModule,
    VideosModule,
    TeachersModule,
    BadgesModule,
  ],
})
export class AppModule {}
