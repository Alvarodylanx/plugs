import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) {}

  private userSelect = {
    id: true, name: true, points: true, streak: true,
    _count: { select: { replies: true, threads: true } },
  };

  async createOrUpdateProfile(userId: string, data: {
    subjects: string[];
    town?: string;
    school?: string;
    jobStatus?: string;
    bio?: string;
    available?: boolean;
  }) {
    return this.prisma.teacherProfile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
      include: { user: { select: this.userSelect } },
    });
  }

  async findAll(subject?: string, town?: string) {
    const profiles = await this.prisma.teacherProfile.findMany({
      where: {
        ...(subject ? { subjects: { has: subject } } : {}),
        ...(town ? { town: { contains: town, mode: 'insensitive' as const } } : {}),
      },
      include: {
        user: {
          select: {
            ...this.userSelect,
            teacherFollowers: { select: { studentId: true } },
          },
        },
      },
      orderBy: { rating: 'desc' },
    });

    return profiles.map(p => ({
      ...p,
      followerCount: p.user.teacherFollowers.length,
      user: { ...p.user, teacherFollowers: undefined },
    }));
  }

  async findOne(teacherUserId: string, requesterId: string) {
    const profile = await this.prisma.teacherProfile.findUnique({
      where: { userId: teacherUserId },
      include: {
        user: {
          select: {
            ...this.userSelect,
            teacherFollowers: { select: { studentId: true } },
            replies: {
              take: 5,
              orderBy: { createdAt: 'desc' },
              select: {
                id: true, content: true, isBestAnswer: true, createdAt: true,
                thread: { select: { id: true, title: true, subject: true } },
                likes: true,
              },
            },
          },
        },
      },
    });

    if (!profile) throw new NotFoundException('Teacher profile not found');

    const isFollowing = profile.user.teacherFollowers.some(f => f.studentId === requesterId);

    return {
      ...profile,
      followerCount: profile.user.teacherFollowers.length,
      isFollowing,
      recentReplies: profile.user.replies.map(r => ({
        ...r,
        likeCount: r.likes.length,
      })),
      user: { ...profile.user, teacherFollowers: undefined, replies: undefined },
    };
  }

  async getMyProfile(userId: string) {
    return this.prisma.teacherProfile.findUnique({
      where: { userId },
      include: { user: { select: this.userSelect } },
    });
  }

  async follow(studentId: string, teacherProfileId: string) {
    // Accept either profile id or userId — resolve to userId via profile lookup
    const profile = await this.prisma.teacherProfile.findFirst({
      where: { OR: [{ id: teacherProfileId }, { userId: teacherProfileId }] },
    });
    if (!profile) throw new NotFoundException('Teacher not found');
    const teacherUserId = profile.userId;

    if (studentId === teacherUserId) throw new ConflictException('Cannot follow yourself');

    const existing = await this.prisma.teacherFollow.findUnique({
      where: { studentId_teacherId: { studentId, teacherId: teacherUserId } },
    });

    if (existing) {
      await this.prisma.teacherFollow.delete({
        where: { studentId_teacherId: { studentId, teacherId: teacherUserId } },
      });
      return { following: false };
    }

    await this.prisma.teacherFollow.create({ data: { studentId, teacherId: teacherUserId } });
    return { following: true };
  }

  async rateTeacher(studentId: string, teacherProfileId: string, rating: number) {
    const profile = await this.prisma.teacherProfile.findFirst({
      where: { OR: [{ id: teacherProfileId }, { userId: teacherProfileId }] },
    });
    if (!profile) throw new NotFoundException('Teacher not found');

    const newCount = profile.ratingCount + 1;
    const newRating = (profile.rating * profile.ratingCount + rating) / newCount;

    return this.prisma.teacherProfile.update({
      where: { id: profile.id },
      data: { rating: Math.round(newRating * 10) / 10, ratingCount: newCount },
    });
  }
}
