import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, subject?: string) {
    const notes = await this.prisma.note.findMany({
      where: {
        OR: [{ userId }, { isBuiltIn: true }],
        ...(subject ? { subject } : {}),
      },
      orderBy: [{ isBuiltIn: 'desc' }, { createdAt: 'desc' }],
      select: { id: true, title: true, subject: true, tags: true, summary: true, readTime: true, level: true, isBuiltIn: true, createdAt: true, quiz: true },
    });
    return notes.map(({ quiz, ...rest }) => ({
      ...rest,
      questionCount: Array.isArray(quiz) ? (quiz as any[]).length : 0,
    }));
  }

  async findOne(id: string) {
    const note = await this.prisma.note.findUnique({ where: { id } });
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }

  async create(userId: string, data: any) {
    return this.prisma.note.create({
      data: { ...data, userId, isBuiltIn: false },
    });
  }

  async delete(id: string, userId: string) {
    const note = await this.prisma.note.findFirst({ where: { id, userId } });
    if (!note) throw new NotFoundException('Note not found');
    return this.prisma.note.delete({ where: { id } });
  }

  async markSectionRead(userId: string, noteId: string, sectionIdx: number) {
    return this.prisma.readProgress.upsert({
      where: { userId_noteId_sectionIdx: { userId, noteId, sectionIdx } },
      update: {},
      create: { userId, noteId, sectionIdx },
    });
  }

  async getReadProgress(userId: string, noteId: string) {
    return this.prisma.readProgress.findMany({ where: { userId, noteId } });
  }

  async saveQuizResult(userId: string, noteId: string, score: number, total: number) {
    const percentage = Math.round((score / total) * 100);
    const result = await this.prisma.quizResult.create({
      data: { userId, noteId, score, total, percentage },
    });
    // award points
    await this.prisma.user.update({
      where: { id: userId },
      data: { points: { increment: score * 10 } },
    });
    return result;
  }

  async getQuizResults(userId: string, noteId: string) {
    return this.prisma.quizResult.findMany({
      where: { userId, noteId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
