import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export const BADGE_DEFS: Record<string, { emoji: string; description: string }> = {
  'First Post':      { emoji: '🌟', description: 'Posted your first community question' },
  'First Reply':     { emoji: '💬', description: 'Made your first community reply' },
  'Helpful':         { emoji: '👍', description: 'Received 5 upvotes on your replies' },
  'Best Answer':     { emoji: '🏆', description: 'Had a reply marked as Best Answer' },
  'Week Streak':     { emoji: '🔥', description: 'Maintained a 7-day study streak' },
  'Month Streak':    { emoji: '🚀', description: 'Maintained a 30-day study streak' },
  'Perfect Score':   { emoji: '🎯', description: 'Scored 100% on a quiz' },
  'Note Creator':    { emoji: '📚', description: 'Created your first note' },
  'Community Star':  { emoji: '⭐', description: 'Made 10 community replies' },
  'Top Student':     { emoji: '👑', description: 'Reached 500 points' },
  'Streak Freeze':   { emoji: '🧊', description: 'Used a streak freeze to protect your streak' },
  'Early Adopter':   { emoji: '🦋', description: 'One of the first students on Plug' },
};

@Injectable()
export class BadgesService {
  constructor(private prisma: PrismaService) {}

  async award(userId: string, name: string): Promise<boolean> {
    const def = BADGE_DEFS[name];
    if (!def) return false;
    try {
      await this.prisma.badge.create({
        data: { userId, name, emoji: def.emoji, description: def.description },
      });
      return true;
    } catch {
      return false; // unique constraint — badge already earned
    }
  }

  async checkAndAward(userId: string): Promise<void> {
    const [user, replyCount, totalLikes] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { points: true, streak: true, _count: { select: { threads: true, replies: true, notes: true } } },
      }),
      this.prisma.reply.count({ where: { authorId: userId } }),
      this.prisma.replyLike.count({ where: { reply: { authorId: userId } } }),
    ]);
    if (!user) return;

    if (user._count.threads >= 1)  await this.award(userId, 'First Post');
    if (replyCount >= 1)            await this.award(userId, 'First Reply');
    if (replyCount >= 10)           await this.award(userId, 'Community Star');
    if (totalLikes >= 5)            await this.award(userId, 'Helpful');
    if (user._count.notes >= 1)     await this.award(userId, 'Note Creator');
    if (user.points >= 500)         await this.award(userId, 'Top Student');
    if (user.streak >= 7)           await this.award(userId, 'Week Streak');
    if (user.streak >= 30)          await this.award(userId, 'Month Streak');
  }

  async getAll(userId: string) {
    const earned = await this.prisma.badge.findMany({ where: { userId }, orderBy: { earnedAt: 'desc' } });
    const all = Object.entries(BADGE_DEFS).map(([name, def]) => ({
      name,
      ...def,
      earned: earned.find(b => b.name === name) || null,
    }));
    return all;
  }
}
