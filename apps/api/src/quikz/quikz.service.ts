import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import * as webpush from 'web-push';

webpush.setVapidDetails(
  process.env.VAPID_EMAIL || 'mailto:admin@plugapp.com',
  process.env.VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || '',
);

export interface QuestionPayload {
  noteId: string;
  noteTitle: string;
  questionIdx: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  subject: string;
}

@Injectable()
export class QuikzService {
  constructor(private prisma: PrismaService) {}

  async getSettings(userId: string) {
    const s = await this.prisma.quikzSettings.findUnique({ where: { userId } });
    if (!s) {
      return {
        enabled: false,
        frequencyMin: 30,
        subjects: [],
        noteIds: [],
        quietStart: '22:00',
        quietEnd: '07:00',
      };
    }
    return s;
  }

  async saveSettings(userId: string, data: {
    enabled?: boolean;
    frequencyMin?: number;
    subjects?: string[] | null;
    noteIds?: string[] | null;
    quietStart?: string;
    quietEnd?: string;
  }) {
    const safe = {
      ...data,
      subjects: Array.isArray(data.subjects) ? data.subjects : [],
      noteIds: Array.isArray(data.noteIds) ? data.noteIds : [],
    };
    return this.prisma.quikzSettings.upsert({
      where: { userId },
      update: { ...safe },
      create: { userId, ...safe },
    });
  }

  async savePushSubscription(userId: string, sub: any) {
    return this.prisma.quikzSettings.upsert({
      where: { userId },
      update: { pushSub: sub },
      create: { userId, pushSub: sub },
    });
  }

  async removePushSubscription(userId: string) {
    return this.prisma.quikzSettings.updateMany({
      where: { userId },
      data: { pushSub: undefined },
    });
  }

  async getRandomQuestion(userId: string): Promise<QuestionPayload | null> {
    const settings = await this.prisma.quikzSettings.findUnique({ where: { userId } });
    const noteIdFilter = (settings as any)?.noteIds?.length ? (settings as any).noteIds as string[] : null;
    const subjectFilter = !noteIdFilter && settings?.subjects?.length ? settings.subjects : null;

    const notes = await this.prisma.note.findMany({
      where: {
        OR: [{ userId }, { isBuiltIn: true }],
        ...(noteIdFilter ? { id: { in: noteIdFilter } } : {}),
        ...(subjectFilter ? { subject: { in: subjectFilter } } : {}),
      },
      select: { id: true, title: true, subject: true, quiz: true },
    });

    // Flatten all questions
    type WeightedQ = QuestionPayload & { weight: number };
    const pool: WeightedQ[] = [];

    const answers = await this.prisma.quikzAnswer.findMany({ where: { userId } });
    const answerMap = new Map<string, typeof answers[0]>(answers.map(a => [`${a.noteId}-${a.questionIdx}`, a]));

    for (const note of notes) {
      const quiz = Array.isArray(note.quiz) ? note.quiz as any[] : [];
      for (let i = 0; i < quiz.length; i++) {
        const q = quiz[i];
        if (!q?.question || !Array.isArray(q.options)) continue;
        const key = `${note.id}-${i}`;
        const ans = answerMap.get(key);
        let weight = 10; // unseen
        if (ans) {
          const total = (ans.correct as number) + (ans.wrong as number);
          const ratio = total > 0 ? (ans.correct as number) / total : 0;
          if (ratio >= 0.8) weight = 1;
          else if (ratio >= 0.5) weight = 4;
          else weight = 12; // mostly wrong — revisit more
        }
        pool.push({
          noteId: note.id,
          noteTitle: note.title,
          questionIdx: i,
          question: q.question,
          options: q.options,
          correct: q.correct,
          explanation: q.explanation || '',
          subject: note.subject,
          weight,
        });
      }
    }

    if (pool.length === 0) return null;

    // Weighted random selection
    const totalWeight = pool.reduce((s, q) => s + q.weight, 0);
    let r = Math.random() * totalWeight;
    for (const q of pool) {
      r -= q.weight;
      if (r <= 0) {
        const { weight, ...payload } = q;
        return payload;
      }
    }
    const { weight, ...payload } = pool[pool.length - 1];
    return payload;
  }

  async recordAnswer(userId: string, noteId: string, questionIdx: number, correct: boolean) {
    return this.prisma.quikzAnswer.upsert({
      where: { userId_noteId_questionIdx: { userId, noteId, questionIdx } },
      update: {
        correct: correct ? { increment: 1 } : undefined,
        wrong: !correct ? { increment: 1 } : undefined,
        lastSeenAt: new Date(),
      },
      create: {
        userId,
        noteId,
        questionIdx,
        correct: correct ? 1 : 0,
        wrong: correct ? 0 : 1,
      },
    });
  }

  // Cron job — runs every minute, sends push to users whose interval has elapsed
  @Cron('* * * * *')
  async sendScheduledPushes() {
    const now = new Date();
    const settings = await this.prisma.quikzSettings.findMany({
      where: { enabled: true, pushSub: { not: undefined } },
    });

    for (const s of settings) {
      if (!s.pushSub) continue;

      // Check quiet hours
      const hhmm = now.toTimeString().slice(0, 5);
      if (this.isQuietHour(hhmm, s.quietStart, s.quietEnd)) continue;

      // Check if frequency interval has elapsed
      const lastSent = s.lastSentAt ? s.lastSentAt.getTime() : 0;
      const elapsed = (now.getTime() - lastSent) / 60000; // minutes
      if (elapsed < s.frequencyMin) continue;

      try {
        const question = await this.getRandomQuestion(s.userId);
        if (!question) continue;

        await webpush.sendNotification(
          s.pushSub as any,
          JSON.stringify({
            title: `Quikz — ${question.subject}`,
            body: question.question,
            data: question,
          }),
        );

        await this.prisma.quikzSettings.update({
          where: { userId: s.userId },
          data: { lastSentAt: now },
        });
      } catch {
        // subscription expired — remove it
        await this.prisma.quikzSettings.update({
          where: { userId: s.userId },
          data: { pushSub: undefined },
        });
      }
    }
  }

  private isQuietHour(current: string, start: string, end: string): boolean {
    if (start <= end) return current >= start && current < end;
    // crosses midnight: e.g. 22:00 – 07:00
    return current >= start || current < end;
  }
}
