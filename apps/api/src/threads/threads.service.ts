import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BadgesService } from '../badges/badges.service';

@Injectable()
export class ThreadsService {
  constructor(private prisma: PrismaService, private badges: BadgesService) {}

  async findAll(userId: string, subject?: string, sort: 'hot' | 'new' | 'top' = 'hot') {
    const threads = await this.prisma.thread.findMany({
      where: subject ? { subject } : {},
      include: {
        author: { select: { id: true, name: true } },
        replies: { include: { author: { select: { id: true, name: true } }, likes: true } },
        likes: true,
      },
      orderBy: sort === 'new' ? { createdAt: 'desc' } : sort === 'top' ? { views: 'desc' } : { createdAt: 'desc' },
    });

    return threads.map(t => ({
      ...t,
      likeCount: t.likes.length,
      liked: t.likes.some(l => l.userId === userId),
      replyCount: t.replies.length,
      replies: t.replies.map(r => ({
        ...r,
        likeCount: r.likes.length,
        liked: r.likes.some(l => l.userId === userId),
      })),
    }));
  }

  async findOne(id: string, userId: string) {
    const t = await this.prisma.thread.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true } },
        replies: { include: { author: { select: { id: true, name: true } }, likes: true }, orderBy: { createdAt: 'asc' } },
        likes: true,
      },
    });
    if (!t) throw new NotFoundException('Thread not found');
    await this.prisma.thread.update({ where: { id }, data: { views: { increment: 1 } } });
    return {
      ...t,
      likeCount: t.likes.length,
      liked: t.likes.some(l => l.userId === userId),
      replies: t.replies.map(r => ({ ...r, likeCount: r.likes.length, liked: r.likes.some(l => l.userId === userId) })),
    };
  }

  async create(userId: string, data: any) {
    const thread = await this.prisma.thread.create({ data: { ...data, authorId: userId } });
    await this.prisma.user.update({ where: { id: userId }, data: { points: { increment: 15 } } });
    await this.badges.checkAndAward(userId);
    return thread;
  }

  async toggleLike(userId: string, threadId: string) {
    const existing = await this.prisma.threadLike.findUnique({ where: { userId_threadId: { userId, threadId } } });
    if (existing) {
      await this.prisma.threadLike.delete({ where: { userId_threadId: { userId, threadId } } });
      return { liked: false };
    }
    await this.prisma.threadLike.create({ data: { userId, threadId } });
    const thread = await this.prisma.thread.findUnique({ where: { id: threadId }, select: { authorId: true } });
    if (thread) {
      await this.prisma.user.update({ where: { id: thread.authorId }, data: { points: { increment: 2 } } });
    }
    return { liked: true };
  }

  async addReply(userId: string, threadId: string, content: string) {
    const reply = await this.prisma.reply.create({
      data: { content, authorId: userId, threadId },
      include: { author: { select: { id: true, name: true } } },
    });
    await this.prisma.user.update({ where: { id: userId }, data: { points: { increment: 10 } } });
    await this.badges.checkAndAward(userId);
    return { ...reply, likeCount: 0, liked: false };
  }

  async toggleReplyLike(userId: string, replyId: string) {
    const existing = await this.prisma.replyLike.findUnique({ where: { userId_replyId: { userId, replyId } } });
    if (existing) {
      await this.prisma.replyLike.delete({ where: { userId_replyId: { userId, replyId } } });
      return { liked: false };
    }
    await this.prisma.replyLike.create({ data: { userId, replyId } });
    const reply = await this.prisma.reply.findUnique({ where: { id: replyId }, select: { authorId: true } });
    if (reply) {
      await this.badges.checkAndAward(reply.authorId);
    }
    return { liked: true };
  }

  async markBestAnswer(userId: string, replyId: string) {
    const reply = await this.prisma.reply.findUnique({
      where: { id: replyId },
      include: { thread: { select: { authorId: true, id: true } } },
    });
    if (!reply) throw new NotFoundException('Reply not found');
    if (reply.thread.authorId !== userId) throw new ForbiddenException('Only the thread author can mark the best answer');

    // Clear any existing best answer in this thread
    await this.prisma.reply.updateMany({
      where: { threadId: reply.threadId, isBestAnswer: true },
      data: { isBestAnswer: false },
    });

    // Mark this reply and solve the thread
    await Promise.all([
      this.prisma.reply.update({ where: { id: replyId }, data: { isBestAnswer: true } }),
      this.prisma.thread.update({ where: { id: reply.threadId }, data: { solved: true } }),
      this.prisma.user.update({ where: { id: reply.authorId }, data: { points: { increment: 25 } } }),
    ]);

    await this.badges.award(reply.authorId, 'Best Answer');
    return { success: true };
  }

  async editReply(userId: string, replyId: string, content: string) {
    const reply = await this.prisma.reply.findUnique({ where: { id: replyId } });
    if (!reply) throw new NotFoundException('Reply not found');
    if (reply.authorId !== userId) throw new ForbiddenException('You can only edit your own replies');
    return this.prisma.reply.update({ where: { id: replyId }, data: { content } });
  }

  async deleteReply(userId: string, replyId: string) {
    const reply = await this.prisma.reply.findUnique({ where: { id: replyId } });
    if (!reply) throw new NotFoundException('Reply not found');
    if (reply.authorId !== userId) throw new ForbiddenException('You can only delete your own replies');
    await this.prisma.reply.delete({ where: { id: replyId } });
    return { deleted: true };
  }

  async getNotifications(userId: string) {
    const replies = await this.prisma.reply.findMany({
      where: {
        thread: { authorId: userId },
        authorId: { not: userId },
      },
      include: {
        author: { select: { id: true, name: true } },
        thread: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return replies.map(r => ({
      id: r.id,
      type: 'reply' as const,
      threadId: r.threadId,
      threadTitle: r.thread.title,
      authorName: r.author.name,
      preview: r.content.slice(0, 120),
      createdAt: r.createdAt,
    }));
  }

  async getLeaderboard() {
    return this.prisma.user.findMany({
      orderBy: { points: 'desc' },
      take: 10,
      select: { id: true, name: true, points: true, streak: true, _count: { select: { replies: true } } },
    });
  }
}
