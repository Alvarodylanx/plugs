import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

export interface NoteSection {
  heading: string;
  content: string;
  keyPoints: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

@Injectable()
export class ResearchService {
  private readonly client: Anthropic | null;

  constructor() {
    const key = process.env.ANTHROPIC_API_KEY;
    this.client = key && !key.startsWith('sk-ant-REPLACE') ? new Anthropic({ apiKey: key }) : null;
  }

  async searchWikipedia(query: string) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=10&origin=*`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.query?.search || []).map((item: any) => ({
      title: item.title,
      snippet: stripHtml(item.snippet || ''),
      wordcount: item.wordcount,
      pageid: item.pageid,
    }));
  }

  async getWikipediaArticle(title: string) {
    const [summaryRes, sectionsRes] = await Promise.all([
      fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`),
      fetch(`https://en.wikipedia.org/api/rest_v1/page/mobile-sections/${encodeURIComponent(title)}`),
    ]);

    const summary = summaryRes.ok ? await summaryRes.json() : {};
    const sectionsData = sectionsRes.ok ? await sectionsRes.json() : {};

    const leadText = stripHtml(sectionsData.lead?.sections?.[0]?.text || summary.extract || '');
    const remaining: any[] = sectionsData.remaining?.sections || [];

    const rawSections = remaining
      .filter((s: any) => (s.text || '').length > 100)
      .slice(0, 6)
      .map((s: any) => ({ heading: s.line, text: stripHtml(s.text) }));

    const rawContent = [
      `OVERVIEW:\n${leadText}`,
      ...rawSections.map((s) => `${s.heading.toUpperCase()}:\n${s.text}`),
    ].join('\n\n');

    const thumbnail = summary.thumbnail?.source || null;
    const articleUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(summary.title || title)}`;

    if (this.client) {
      return this.summariseWithClaude(summary.title || title, rawContent, thumbnail, articleUrl);
    }

    return this.buildFallbackNote(summary.title || title, leadText, rawSections, thumbnail, articleUrl);
  }

  private async summariseWithClaude(
    title: string,
    rawContent: string,
    thumbnail: string | null,
    url: string,
  ) {
    const prompt = `You are an expert academic tutor creating beautifully structured study notes for secondary school students (O-Level / A-Level standard).

Given the following raw Wikipedia content about "${title}", produce a JSON response that follows EXACTLY the structure below. The notes must be clear, engaging, easy to navigate, and suitable for revision.

RAW CONTENT:
---
${rawContent.slice(0, 8000)}
---

Return ONLY valid JSON with this exact structure (no markdown fences, no extra text):
{
  "subject": "<best matching subject: Mathematics | Physics | Chemistry | Biology | English | History | Geography | Computer Science | Economics | General>",
  "summary": "<2-3 exciting sentences summarising the topic — hook the student>",
  "aiTip": "<one practical exam tip about this topic>",
  "readTime": "<e.g. 8 min>",
  "level": "<O-Level | A-Level | Both>",
  "tags": ["<tag1>", "<tag2>", "<tag3>"],
  "sections": [
    {
      "heading": "<Clear section heading>",
      "content": "<Rich, detailed paragraph — minimum 120 words. Use plain text (no markdown). Explain concepts clearly with examples. Cover key facts, definitions, and processes.>",
      "keyPoints": [
        "<Concise bullet point — one key fact or concept>",
        "<Concise bullet point>",
        "<Concise bullet point>",
        "<Concise bullet point>",
        "<Concise bullet point>"
      ]
    }
  ],
  "quiz": [
    {
      "question": "<Clear MCQ question>",
      "options": ["<option A>", "<option B>", "<option C>", "<option D>"],
      "correct": <0-3 index of correct option>,
      "explanation": "<Why this answer is correct — 1-2 sentences>"
    }
  ]
}

Rules:
- sections array: 5 to 7 sections. Each must have at least 5 keyPoints.
- quiz array: EXACTLY 20 questions. Mix easy, medium, and hard difficulty.
- All content must be factually accurate and based on the provided text.
- Headings should be descriptive: "What is Photosynthesis?", "The Light Reactions", "Factors Affecting Rate", etc.
- keyPoints must be concise (one sentence each), starting with a verb or noun — not repeating the heading.
- The summary should excite the student about the topic.
- DO NOT wrap the JSON in markdown code blocks.`;

    try {
      const message = await this.client!.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }],
      });

      const raw = (message.content[0] as any).text as string;
      const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(cleaned);

      return {
        title,
        summary: parsed.summary || '',
        thumbnail,
        url,
        subject: parsed.subject || '',
        sections: (parsed.sections || []) as NoteSection[],
        readTime: parsed.readTime || `${Math.ceil((parsed.sections?.length || 5) * 2)} min`,
        level: parsed.level || 'O-Level',
        tags: parsed.tags || [title.toLowerCase()],
        aiTip: parsed.aiTip || 'Cross-reference with your textbook for exam-specific details.',
        quiz: (parsed.quiz || []) as QuizQuestion[],
      };
    } catch {
      const fallbackSections = rawContent.split('\n\n').slice(0, 5).map((block) => {
        const lines = block.split('\n');
        return {
          heading: lines[0].replace(':', ''),
          content: lines.slice(1).join(' ').slice(0, 500),
          keyPoints: [],
        };
      });
      return {
        title,
        summary: rawContent.slice(0, 250),
        thumbnail,
        url,
        subject: '',
        sections: fallbackSections,
        readTime: '5 min',
        level: 'O-Level',
        tags: [title.toLowerCase()],
        aiTip: 'Cross-reference with your textbook for exam-specific details.',
        quiz: [] as QuizQuestion[],
      };
    }
  }

  private buildFallbackNote(
    title: string,
    leadText: string,
    rawSections: { heading: string; text: string }[],
    thumbnail: string | null,
    url: string,
  ) {
    const sections: NoteSection[] = [
      {
        heading: 'Overview',
        content: leadText.slice(0, 700),
        keyPoints: leadText
          .split('. ')
          .slice(0, 5)
          .map((s) => s.trim())
          .filter((s) => s.length > 20),
      },
      ...rawSections.map((s) => ({
        heading: s.heading,
        content: s.text.slice(0, 600),
        keyPoints: s.text
          .split('. ')
          .slice(0, 4)
          .map((p) => p.trim())
          .filter((p) => p.length > 20),
      })),
    ];

    return {
      title,
      summary: leadText.slice(0, 300),
      thumbnail,
      url,
      subject: '',
      sections: sections.slice(0, 5),
      readTime: `${Math.ceil(sections.length * 2)} min`,
      level: 'O-Level',
      tags: [title.toLowerCase()],
      aiTip: 'Add your ANTHROPIC_API_KEY in apps/api/.env to get AI-structured notes with 20 quiz questions.',
      quiz: [] as QuizQuestion[],
    };
  }
}
