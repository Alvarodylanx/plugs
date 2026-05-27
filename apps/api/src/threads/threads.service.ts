import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ThreadsService {
  constructor(private prisma: PrismaService) {}

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
    return { ...reply, likeCount: 0, liked: false };
  }

  async toggleReplyLike(userId: string, replyId: string) {
    const existing = await this.prisma.replyLike.findUnique({ where: { userId_replyId: { userId, replyId } } });
    if (existing) {
      await this.prisma.replyLike.delete({ where: { userId_replyId: { userId, replyId } } });
      return { liked: false };
    }
    await this.prisma.replyLike.create({ data: { userId, replyId } });
    return { liked: true };
  }

  async getLeaderboard() {
    return this.prisma.user.findMany({
      orderBy: { points: 'desc' },
      take: 10,
      select: { id: true, name: true, points: true, streak: true, _count: { select: { replies: true } } },
    });
  }
}
