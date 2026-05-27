import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BadgesService } from '../badges/badges.service';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService, private badges: BadgesService) {}

  async getDashboard(userId: string) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const [user, studyLogs, quizResults, earnedBadges, sessions, notes, weeklyReplies] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId }, select: { name: true, points: true, streak: true, level: true } }),
      this.prisma.studyLog.findMany({ where: { userId }, orderBy: { date: 'asc' } }),
      this.prisma.quizResult.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      this.prisma.badge.findMany({ where: { userId }, orderBy: { earnedAt: 'desc' } }),
      this.prisma.session.findMany({ where: { userId, completed: true } }),
      this.prisma.note.findMany({ where: { OR: [{ userId }, { isBuiltIn: true }] }, select: { id: true, subject: true } }),
      this.prisma.reply.count({ where: { authorId: userId, createdAt: { gte: weekStart } } }),
    ]);

    const totalHours = studyLogs.reduce((sum, l) => sum + l.hours, 0);
    const avgScore = quizResults.length ? Math.round(quizResults.reduce((s, r) => s + r.percentage, 0) / quizResults.length) : 0;

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyHours = days.map((name, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];
      const hours = studyLogs.filter(l => l.date === dateStr).reduce((s, l) => s + l.hours, 0);
      return { name, hours: Math.round(hours * 10) / 10 };
    });

    const weeklyScores = days.map((name, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];
      const dayResults = quizResults.filter(r => r.createdAt.toISOString().slice(0, 10) === dateStr);
      const avg = dayResults.length ? Math.round(dayResults.reduce((s, r) => s + r.percentage, 0) / dayResults.length) : 0;
      return { name, score: avg };
    });

    const subjects = [...new Set(notes.map(n => n.subject))];
    const subjectStats = subjects.map(subject => {
      const subjectResults = quizResults.filter(r => notes.find(n => n.id === r.noteId && n.subject === subject));
      const avgScore = subjectResults.length ? Math.round(subjectResults.reduce((s, r) => s + r.percentage, 0) / subjectResults.length) : 0;
      const subjectHours = studyLogs.filter(l => l.subject === subject).reduce((s, l) => s + l.hours, 0);
      return { subject, avgScore, hours: Math.round(subjectHours * 10) / 10, quizCount: subjectResults.length };
    });

    // Check and auto-award streak badges
    await this.badges.checkAndAward(userId);

    return {
      user,
      stats: {
        totalHours: Math.round(totalHours * 10) / 10,
        avgScore,
        quizCount: quizResults.length,
        badgeCount: earnedBadges.length,
        streak: user.streak,
        completedSessions: sessions.length,
        weeklyReplies,
      },
      weeklyHours,
      weeklyScores,
      subjectStats,
      badges: earnedBadges,
      recentQuizzes: quizResults.slice(0, 5),
    };
  }

  async getRecentActivity(userId: string) {
    const [sessions, quizResults] = await Promise.all([
      this.prisma.session.findMany({ where: { userId, completed: true }, orderBy: { updatedAt: 'desc' }, take: 10 }),
      this.prisma.quizResult.findMany({ where: { userId }, include: { note: { select: { title: true, subject: true } } }, orderBy: { createdAt: 'desc' }, take: 5 }),
    ]);
    return { sessions, quizResults };
  }

  async getAllBadges(userId: string) {
    return this.badges.getAll(userId);
  }
}
