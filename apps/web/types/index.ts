export interface StudyProfile {
  learningStyles?: string[];
  dailyHours?: number;
  mainGoal?: string;
  studyTimes?: string[];
  challenges?: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  level: string;
  points: number;
  streak: number;
  studyProfile?: StudyProfile | null;
  createdAt?: string;
}

export interface NoteSection {
  heading: string;
  content: string;
  keyPoints?: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface Note {
  id: string;
  title: string;
  subject: string;
  tags: string[];
  summary: string;
  aiTip: string;
  readTime: string;
  level: string;
  sections: NoteSection[];
  quiz: QuizQuestion[];
  isBuiltIn: boolean;
  userId: string;
  createdAt: string;
}

export interface NoteCard {
  id: string;
  title: string;
  subject: string;
  tags: string[];
  summary: string;
  readTime: string;
  level: string;
  isBuiltIn: boolean;
  createdAt: string;
  questionCount: number;
}

export interface Session {
  id: string;
  subject: string;
  date: string;
  time: string;
  endTime: string;
  notes: string;
  completed: boolean;
  userId: string;
  createdAt: string;
}

export interface Reply {
  id: string;
  content: string;
  isBestAnswer: boolean;
  author: { id: string; name: string };
  likes?: ReplyLike[];
  likeCount: number;
  liked: boolean;
  createdAt: string;
}

export interface Thread {
  id: string;
  title: string;
  content: string;
  subject: string;
  tags: string[];
  views: number;
  pinned: boolean;
  solved: boolean;
  likeCount: number;
  liked: boolean;
  replyCount: number;
  author: { id: string; name: string };
  replies: Reply[];
  createdAt: string;
}

export interface QuizResult {
  id: string;
  noteId: string;
  score: number;
  total: number;
  percentage: number;
  createdAt: string;
  note?: { title: string; subject: string };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  earnedAt: string;
}

export interface ProgressData {
  user: { name: string; points: number; streak: number; level: string };
  stats: {
    totalHours: number;
    avgScore: number;
    quizCount: number;
    badgeCount: number;
    streak: number;
    completedSessions: number;
    weeklyReplies: number;
  };
  weeklyHours: { name: string; hours: number }[];
  weeklyScores: { name: string; score: number }[];
  subjectStats: { subject: string; avgScore: number; hours: number; quizCount: number }[];
  badges: Badge[];
  recentQuizzes: QuizResult[];
}

export interface LeaderboardUser {
  id: string;
  name: string;
  points: number;
  streak: number;
  _count: { replies: number };
}

export type ThreadLike = { userId: string; threadId: string };
export type ReplyLike = { userId: string; replyId: string };

export const SUBJECTS = [
  'Computer Science / ICT',
  'Biology',
  'History',
  'Mathematics',
  'Physics',
  'Chemistry',
  'English',
  'Geography',
  'Economics',
] as const;

export type Subject = (typeof SUBJECTS)[number];

export const LEVELS = ['O-Level', 'A-Level', 'AS-Level', 'IGCSE'] as const;

export interface VideoResult {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  description: string;
}

export interface TeacherProfile {
  id: string;
  userId: string;
  subjects: string[];
  town?: string | null;
  school?: string | null;
  jobStatus: string;
  bio?: string | null;
  verified: boolean;
  available: boolean;
  rating: number;
  ratingCount: number;
  followerCount?: number;
  isFollowing?: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    points: number;
    streak: number;
    _count: { replies: number; threads: number };
  };
  recentReplies?: {
    id: string;
    content: string;
    isBestAnswer: boolean;
    createdAt: string;
    likeCount: number;
    thread: { id: string; title: string; subject: string };
  }[];
}

export interface BadgeDef {
  name: string;
  emoji: string;
  description: string;
  earned: { id: string; earnedAt: string } | null;
}
