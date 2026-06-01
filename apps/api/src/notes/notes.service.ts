import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class NotesService {
  private readonly gemini: GoogleGenerativeAI | null;

  constructor(private prisma: PrismaService) {
    const key = process.env.GEMINI_API_KEY;
    this.gemini = key && !key.startsWith('PASTE_') ? new GoogleGenerativeAI(key) : null;
  }

  async summarize(rawText: string, subject: string, level: string, tags: string[]) {
    if (!this.gemini) {
      return this.fallbackSummarize(rawText, subject, level, tags);
    }

    const wordCount = rawText.trim().split(/\s+/).length;
    const readTime = `${Math.max(3, Math.round(wordCount / 150))} min`;

    const prompt = `You are an expert academic tutor creating beautifully structured study notes for ${level} students.

A student has uploaded their raw study notes on "${subject}". Your job is to read their content carefully and transform it into a well-organised, engaging, easy-to-navigate study guide.

RAW STUDENT NOTES:
---
${rawText.slice(0, 10000)}
---

Return ONLY valid JSON with this exact structure (no markdown fences, no extra text):
{
  "title": "<A clear, specific title based on what the notes are actually about>",
  "summary": "<2-3 sentences capturing what these notes cover and why it matters for ${level} students>",
  "aiTip": "<One specific exam tip based on the actual content of these notes>",
  "sections": [
    {
      "heading": "<Descriptive heading — e.g. 'What is Osmosis?', 'Key Definitions', 'The Process Step-by-Step'>",
      "content": "<Rich explanation paragraph — minimum 100 words. Explain the concepts clearly, use the student's own examples if present, and add context that helps understanding. Written in plain text, no markdown.>",
      "keyPoints": [
        "<One key fact from this section — one sentence, starts with a noun or verb>",
        "<Another key fact>",
        "<Another key fact>",
        "<Another key fact>",
        "<Another key fact>"
      ]
    }
  ],
  "quiz": [
    {
      "question": "<A specific question based on the actual content — not a generic one>",
      "options": ["<option A>", "<option B>", "<option C>", "<option D>"],
      "correct": <0-3>,
      "explanation": "<Why this answer is correct, referencing the content>"
    }
  ]
}

Rules:
- sections: 5 to 7 sections that cover ALL major topics in the notes. Use the student's actual content — do not invent topics.
- Each section must have EXACTLY 5 keyPoints.
- quiz: EXACTLY 20 questions. Questions must be based on the actual notes content — specific facts, definitions, processes, dates, formulas, names, etc. Mix easy, medium, and hard.
- NEVER use generic placeholders like "Key concept 1" or "Option A".
- The title must reflect the actual subject matter of the notes, not just the subject name.
- DO NOT wrap the JSON in markdown code blocks.`;

    try {
      const model = this.gemini!.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(prompt);
      const raw = result.response.text();
      const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(cleaned);

      return {
        title: parsed.title || `${subject} Notes`,
        subject,
        level,
        tags,
        summary: parsed.summary || '',
        aiTip: parsed.aiTip || '',
        readTime,
        sections: parsed.sections || [],
        quiz: parsed.quiz || [],
      };
    } catch {
      return this.fallbackSummarize(rawText, subject, level, tags);
    }
  }

  async summarizeFromPastQuestions(rawText: string, subject: string, level: string, tags: string[]) {
    if (!this.gemini) return this.fallbackSummarize(rawText, subject, level, tags);

    const prompt = `You are an expert academic tutor helping a ${level} student prepare for exams in ${subject}.

The student has uploaded a set of PAST EXAM QUESTIONS. Your job is to:
1. Identify every topic, concept, definition, formula, and skill being tested across all questions.
2. Write comprehensive study notes that TEACH those topics in depth — as if the student has never studied them before.
3. Generate 15 brand-new original exam questions on the same topics. These must be completely different from the uploaded questions: different wording, different angles, different distractors.

PAST EXAM QUESTIONS:
---
${rawText.slice(0, 10000)}
---

Return ONLY valid JSON with this exact structure (no markdown fences, no extra text):
{
  "title": "<Specific title reflecting the topics covered — e.g. 'Cell Biology: Osmosis, Diffusion & Active Transport'>",
  "summary": "<2-3 sentences describing which exam topics these questions cover and what a student must know to answer them>",
  "aiTip": "<One specific exam technique tip for answering this type of question — based on what the uploaded questions are actually testing>",
  "topicsIdentified": ["<topic 1>", "<topic 2>", "<topic 3>", "..."],
  "sections": [
    {
      "heading": "<Clear descriptive heading for this topic — e.g. 'What is Osmosis?', 'The Carbon Cycle Explained'>",
      "content": "<Rich teaching paragraph — minimum 120 words. Explain the concept from scratch, include definitions, how it works, and why it matters. Written in plain text, no markdown.>",
      "keyPoints": [
        "<One key fact or exam-ready definition — one sentence>",
        "<Another key fact>",
        "<Another key fact>",
        "<Another key fact>",
        "<Another key fact>"
      ]
    }
  ],
  "quiz": [
    {
      "question": "<A completely new question on the same topic — different wording and angle from the uploaded questions>",
      "options": ["<option A>", "<option B>", "<option C>", "<option D>"],
      "correct": <0-3>,
      "explanation": "<Why this answer is correct>"
    }
  ]
}

Rules:
- topicsIdentified: list every distinct topic extracted from the questions (minimum 4, maximum 12).
- sections: one section per major topic identified. 5 to 7 sections total, each with EXACTLY 5 keyPoints.
- quiz: EXACTLY 15 questions. They must NOT repeat or closely paraphrase the uploaded questions. Test the same knowledge from new angles.
- NEVER use generic placeholders like "Key concept 1" or "Option A".
- DO NOT wrap the JSON in markdown code blocks.`;

    try {
      const model = this.gemini!.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(prompt);
      const raw = result.response.text();
      const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(cleaned);

      const wordCount = (parsed.sections || []).reduce((n: number, s: any) => n + (s.content?.split(/\s+/).length || 0), 0);

      return {
        title: parsed.title || `${subject} — Past Question Notes`,
        subject,
        level,
        tags: [...tags, 'past-questions'],
        summary: parsed.summary || '',
        aiTip: parsed.aiTip || '',
        readTime: `${Math.max(4, Math.round(wordCount / 150))} min`,
        topicsIdentified: parsed.topicsIdentified || [],
        sections: parsed.sections || [],
        quiz: parsed.quiz || [],
      };
    } catch {
      return this.fallbackSummarize(rawText, subject, level, tags);
    }
  }

  private fallbackSummarize(rawText: string, subject: string, level: string, tags: string[]) {
    const wordCount = rawText.trim().split(/\s+/).length;
    const lines = rawText.split('\n').filter(l => l.trim().length > 20);
    const chunkSize = Math.max(3, Math.floor(lines.length / 5));
    const sections = Array.from({ length: Math.min(5, Math.ceil(lines.length / chunkSize)) }, (_, i) => {
      const chunk = lines.slice(i * chunkSize, (i + 1) * chunkSize).join(' ');
      const sentences = chunk.split(/[.!?]+/).filter(s => s.trim().length > 15).slice(0, 5);
      return {
        heading: `Part ${i + 1}`,
        content: chunk.slice(0, 500) || `Section ${i + 1} of your uploaded content.`,
        keyPoints: sentences.length >= 5 ? sentences.map(s => s.trim()) : [
          ...sentences.map(s => s.trim()),
          ...Array.from({ length: 5 - sentences.length }, (_, j) => `Key point ${j + 1} from this section`),
        ],
      };
    });
    return {
      title: `${subject} Notes — ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`,
      subject, level, tags,
      summary: rawText.slice(0, 250) + (rawText.length > 250 ? '…' : ''),
      aiTip: 'Add your GEMINI_API_KEY in apps/api/.env to get AI-structured notes with 20 quiz questions.',
      readTime: `${Math.max(3, Math.round(wordCount / 150))} min`,
      sections,
      quiz: [],
    };
  }

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
