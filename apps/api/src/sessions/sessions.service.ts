import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.session.findMany({ where: { userId }, orderBy: [{ date: 'asc' }, { time: 'asc' }] });
  }

  create(userId: string, data: any) {
    return this.prisma.session.create({ data: { ...data, userId } });
  }

  async update(id: string, userId: string, data: any) {
    await this.findOwned(id, userId);
    return this.prisma.session.update({ where: { id }, data });
  }

  async delete(id: string, userId: string) {
    await this.findOwned(id, userId);
    return this.prisma.session.delete({ where: { id } });
  }

  async toggleComplete(id: string, userId: string) {
    const s = await this.findOwned(id, userId);
    const updated = await this.prisma.session.update({ where: { id }, data: { completed: !s.completed } });
    if (updated.completed) {
      const hrs = this.calcHours(s.time, s.endTime);
      await this.prisma.studyLog.create({ data: { userId, subject: s.subject, hours: hrs, date: s.date } });
      await this.prisma.user.update({ where: { id: userId }, data: { points: { increment: Math.round(hrs * 20) } } });
    }
    return updated;
  }

  private async findOwned(id: string, userId: string) {
    const s = await this.prisma.session.findFirst({ where: { id, userId } });
    if (!s) throw new NotFoundException('Session not found');
    return s;
  }

  private calcHours(start: string, end: string) {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return Math.max(0, (eh * 60 + em - sh * 60 - sm) / 60);
  }
}
