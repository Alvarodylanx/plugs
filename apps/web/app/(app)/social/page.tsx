'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Heart, MessageSquare, Eye, Pin, CheckCircle2, Send,
  Trophy, Hash, Users, Flame, Sparkles, TrendingUp, Zap,
  ChevronDown, ChevronUp, Star, Award, MessageCircle,
  AlignJustify, List, LayoutGrid, Pencil, Trash2, X as XIcon,
} from 'lucide-react';
import { threads as threadsApi, community as communityApi } from '@/lib/api';
import { getUser } from '@/lib/auth';
import { subjectColor, subjectIcon, formatRelativeTime, avatarUrl } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SUBJECTS } from '@/types';
import type { Thread, LeaderboardUser, User } from '@/types';

type FeedView = 'comfortable' | 'compact' | 'card';

const SORTS = [
  { key: 'hot', label: 'Hot', icon: '🔥', desc: 'Most active' },
  { key: 'new', label: 'New', icon: '✨', desc: 'Just posted' },
  { key: 'top', label: 'Top', icon: '⬆️', desc: 'Most viewed' },
] as const;

const SUBJECT_GRADIENTS: Record<string, string> = {
  'Computer Science / ICT': 'from-cyan-400 to-blue-500',
  'Biology': 'from-emerald-400 to-green-500',
  'History': 'from-amber-400 to-orange-500',
  'Mathematics': 'from-blue-400 to-indigo-500',
  'Physics': 'from-indigo-400 to-purple-500',
  'Chemistry': 'from-green-400 to-teal-500',
  'English': 'from-pink-400 to-rose-500',
  'Geography': 'from-teal-400 to-cyan-500',
  'Economics': 'from-orange-400 to-amber-500',
};

const SUBJECT_BORDER: Record<string, string> = {
  'Computer Science / ICT': 'border-l-cyan-400',
  'Biology': 'border-l-emerald-400',
  'History': 'border-l-amber-400',
  'Mathematics': 'border-l-blue-400',
  'Physics': 'border-l-indigo-400',
  'Chemistry': 'border-l-green-400',
  'English': 'border-l-pink-400',
  'Geography': 'border-l-teal-400',
  'Economics': 'border-l-orange-400',
};

const POPULAR_TAGS = [
  { tag: 'cell division', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25' },
  { tag: 'OSI model', color: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/25' },
  { tag: 'essay writing', color: 'bg-pink-500/15 text-pink-600 dark:text-pink-400 hover:bg-pink-500/25' },
  { tag: 'DNA', color: 'bg-green-500/15 text-green-600 dark:text-green-400 hover:bg-green-500/25' },
  { tag: 'simultaneous eq.', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 hover:bg-blue-500/25' },
  { tag: 'genetics', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25' },
  { tag: 'networking', color: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/25' },
  { tag: 'WW2', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25' },
  { tag: 'thermodynamics', color: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/25' },
  { tag: 'market forces', color: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 hover:bg-orange-500/25' },
];

const RANK_CONFIG = [
  { bg: 'from-amber-400 to-yellow-300', text: 'text-amber-900', ring: 'ring-amber-300', label: '🥇' },
  { bg: 'from-slate-400 to-slate-300', text: 'text-slate-800', ring: 'ring-slate-300', label: '🥈' },
  { bg: 'from-orange-400 to-amber-300', text: 'text-orange-900', ring: 'ring-orange-300', label: '🥉' },
  { bg: 'from-primary/30 to-primary/10', text: 'text-primary', ring: 'ring-primary/30', label: '⭐' },
  { bg: 'from-primary/20 to-primary/5', text: 'text-primary', ring: 'ring-primary/20', label: '⭐' },
];

function isNew(dateStr: string) {
  return Date.now() - new Date(dateStr).getTime() < 3600_000;
}

export default function CommunityPage() {
  const [threadList, setThreadList] = useState<Thread[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [subject, setSubject] = useState('');
  const [sort, setSort] = useState<'hot' | 'new' | 'top'>('hot');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [newThread, setNewThread] = useState(false);
  const [newForm, setNewForm] = useState({ title: '', content: '', subject: '', tags: '' });
  const [posting, setPosting] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState<string | null>(null);
  const [feedView, setFeedView] = useState<FeedView>('comfortable');
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [deletingReplyId, setDeletingReplyId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getUser(), threadsApi.list(subject || undefined, sort), threadsApi.leaderboard()])
      .then(([u, t, lb]) => {
        setUser(u as User);
        setThreadList(t as Thread[]);
        setLeaderboard(lb as LeaderboardUser[]);
        setLoading(false);
      });
  }, [subject, sort]);

  async function toggleLike(threadId: string) {
    setLikeAnimating(threadId);
    setTimeout(() => setLikeAnimating(null), 600);
    const result = await threadsApi.like(threadId) as any;
    setThreadList(prev => prev.map(t =>
      t.id === threadId ? { ...t, liked: result.liked, likeCount: t.likeCount + (result.liked ? 1 : -1) } : t
    ));
  }

  async function submitReply(threadId: string) {
    if (!replyContent.trim()) return;
    setPosting(true);
    const reply = await threadsApi.reply(threadId, replyContent) as any;
    setThreadList(prev => prev.map(t =>
      t.id === threadId ? { ...t, replies: [...t.replies, reply], replyCount: t.replyCount + 1 } : t
    ));
    setReplyContent('');
    setPosting(false);
  }

  async function submitThread() {
    if (!newForm.title || !newForm.subject) return;
    setPosting(true);
    const tags = newForm.tags.split(',').map(t => t.trim()).filter(Boolean);
    await threadsApi.create({ title: newForm.title, content: newForm.content, subject: newForm.subject, tags });
    const updated = await threadsApi.list(subject || undefined, sort);
    setThreadList(updated as Thread[]);
    setNewThread(false);
    setNewForm({ title: '', content: '', subject: '', tags: '' });
    setPosting(false);
  }

  async function markBestAnswer(threadId: string, replyId: string) {
    await communityApi.markBestAnswer(replyId);
    setThreadList(prev => prev.map(t =>
      t.id === threadId
        ? { ...t, solved: true, replies: t.replies.map(r => ({ ...r, isBestAnswer: r.id === replyId })) }
        : t
    ));
  }

  async function handleEditReply(threadId: string, replyId: string) {
    if (!editingContent.trim()) return;
    await threadsApi.editReply(replyId, editingContent.trim());
    setThreadList(prev => prev.map(t =>
      t.id === threadId
        ? { ...t, replies: t.replies.map(r => r.id === replyId ? { ...r, content: editingContent.trim() } : r) }
        : t
    ));
    setEditingReplyId(null);
    setEditingContent('');
  }

  async function handleDeleteReply(threadId: string, replyId: string) {
    setDeletingReplyId(replyId);
    try {
      await threadsApi.deleteReply(replyId);
      setThreadList(prev => prev.map(t =>
        t.id === threadId
          ? { ...t, replies: t.replies.filter(r => r.id !== replyId), replyCount: t.replyCount - 1 }
          : t
      ));
    } finally {
      setDeletingReplyId(null);
    }
  }

  function toggleExpand(threadId: string) {
    setExpanded(e => e === threadId ? null : threadId);
    setReplyingTo(null);
    setReplyContent('');
  }

  const solvedCount = threadList.filter(t => t.solved).length;
  const solvedPct = threadList.length ? Math.round(solvedCount / threadList.length * 100) : 0;
  const subjects = ['', ...SUBJECTS];

  return (
    <div className="animate-enter space-y-6">

      {/* ── Hero Banner ── */}
      <div className="relative bg-gradient-to-r from-secondary via-indigo-700 to-primary rounded-3xl p-6 text-white overflow-hidden shadow-xl">
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-48 h-24 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Users size={16} className="text-white" />
              </div>
              <span className="text-white/70 text-sm font-medium">Community Hub</span>
            </div>
            <h1 className="font-heading font-bold text-2xl md:text-3xl">Ask, Answer &amp; Earn Points</h1>
            <p className="text-white/70 text-sm mt-1">Help others and climb the leaderboard 🚀</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2 text-center border border-white/20">
              <p className="font-heading font-bold text-xl">{threadList.length || '0'}</p>
              <p className="text-white/70 text-xs">Questions</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2 text-center border border-white/20">
              <p className="font-heading font-bold text-xl">{solvedPct}%</p>
              <p className="text-white/70 text-xs">Solved</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2 text-center border border-white/20">
              <p className="font-heading font-bold text-xl">{leaderboard.length}+</p>
              <p className="text-white/70 text-xs">Active</p>
            </div>
            <Button
              onClick={() => setNewThread(true)}
              className="bg-white text-secondary hover:bg-white/90 shadow-lg gap-2 font-bold"
            >
              <Plus size={16} /> Ask a Question
            </Button>
          </div>
        </div>
      </div>

      {/* ── Subject Filter ── */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        <button
          onClick={() => setSubject('')}
          className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
            subject === '' ? 'bg-secondary text-white border-secondary shadow-md' : 'bg-card border-border/50 text-muted-foreground hover:border-secondary/50 hover:text-secondary'
          }`}
        >
          📚 All Subjects
        </button>
        {SUBJECTS.map(s => {
          const active = subject === s;
          const grad = SUBJECT_GRADIENTS[s] || 'from-gray-400 to-gray-500';
          return (
            <button
              key={s}
              onClick={() => setSubject(s)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold border transition-all whitespace-nowrap ${
                active
                  ? `bg-gradient-to-r ${grad} text-white border-transparent shadow-md`
                  : 'bg-card border-border/50 text-muted-foreground hover:border-primary/40 hover:text-primary'
              }`}
            >
              {subjectIcon(s)} {s.split(' / ')[0]}
            </button>
          );
        })}
      </div>

      {/* ── Main layout ── */}
      <div className="flex gap-6 items-start">

        {/* Feed */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Sort bar + view toggle */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-card border border-border/50 rounded-2xl p-1.5">
              {SORTS.map(s => (
                <button
                  key={s.key}
                  onClick={() => setSort(s.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    sort === s.key
                      ? 'bg-primary text-white shadow-md shadow-primary/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <span>{s.icon}</span> {s.label}
                </button>
              ))}
            </div>
            {/* View toggle */}
            <div className="flex border border-border rounded-xl overflow-hidden ml-auto">
              {([
                { v: 'comfortable', icon: AlignJustify, tip: 'Comfortable' },
                { v: 'compact',     icon: List,          tip: 'Compact' },
                { v: 'card',        icon: LayoutGrid,    tip: 'Card grid' },
              ] as const).map(({ v, icon: Icon, tip }) => (
                <button
                  key={v}
                  onClick={() => setFeedView(v)}
                  title={tip}
                  className={`px-3 py-2 transition-all ${feedView === v ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}
                >
                  <Icon size={14} />
                </button>
              ))}
            </div>
          </div>

          {/* Threads */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-card rounded-2xl border border-border/50 p-5 animate-pulse">
                  <div className="flex gap-3 mb-3"><div className="w-8 h-8 bg-muted rounded-full" /><div className="flex-1 h-4 bg-muted rounded" /></div>
                  <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-full mb-1" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : threadList.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 bg-card rounded-3xl border border-border/50"
            >
              <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MessageCircle size={36} className="text-primary" />
              </div>
              <h3 className="font-heading font-bold text-xl text-secondary mb-2">No questions yet!</h3>
              <p className="text-muted-foreground text-sm mb-6">Be the first to start a conversation.</p>
              <Button onClick={() => setNewThread(true)} className="gap-2 shadow-md shadow-primary/30">
                <Plus size={16} /> Ask the First Question
              </Button>
            </motion.div>
          ) : (
            <div className={feedView === 'card' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-3'}>
              {threadList.map((thread, i) => {
                const borderColor = SUBJECT_BORDER[thread.subject] || 'border-l-primary';
                const isExpanded = expanded === thread.id;
                const threadIsNew = isNew(thread.createdAt);
                const isCompact = feedView === 'compact';
                const isCard = feedView === 'card';

                return (
                  <motion.div
                    key={thread.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    className={`bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm hover:shadow-md transition-shadow ${isCard ? '' : `border-l-4 ${borderColor}`}`}
                  >
                    <div className={isCompact || isCard ? 'p-3.5' : 'p-5'}>
                      {/* Top row: badges */}
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        {thread.pinned && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                            <Pin size={10} /> Pinned
                          </span>
                        )}
                        {thread.solved && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                            <CheckCircle2 size={10} /> Solved
                          </span>
                        )}
                        {threadIsNew && !isCompact && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 animate-pulse">
                            <Sparkles size={10} /> New
                          </span>
                        )}
                        {thread.views > 50 && !isCompact && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-orange-500/15 text-orange-600 dark:text-orange-400">
                            <Flame size={10} /> Trending
                          </span>
                        )}
                        <div className="ml-auto">
                          <Badge variant="subject" subject={thread.subject}>
                            {subjectIcon(thread.subject)} {thread.subject.split(' / ')[0]}
                          </Badge>
                        </div>
                      </div>

                      {/* Title */}
                      <button onClick={() => toggleExpand(thread.id)} className="text-left w-full group">
                        <h3 className={`font-heading font-bold text-secondary group-hover:text-primary transition-colors leading-snug ${isCompact || isCard ? 'text-sm' : 'text-base'}`}>
                          {thread.title}
                        </h3>
                      </button>

                      {/* Content preview — hidden in compact/card */}
                      {!isCompact && !isCard && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{thread.content}</p>
                      )}

                      {/* Tags — hidden in compact */}
                      {!isCompact && thread.tags.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap mt-2">
                          {thread.tags.slice(0, isCard ? 2 : 4).map(t => (
                            <span key={t} className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">#{t}</span>
                          ))}
                        </div>
                      )}

                      {/* Author row */}
                      <div className="flex items-center gap-2 mt-2.5">
                        <img src={avatarUrl(thread.author.name)} alt="" className="w-6 h-6 rounded-full ring-2 ring-border shrink-0" />
                        <span className="text-xs font-semibold text-foreground truncate">{thread.author.name}</span>
                        <span className="text-xs text-muted-foreground shrink-0">· {formatRelativeTime(thread.createdAt)}</span>
                      </div>

                      {/* Action bar */}
                      <div className="flex items-center gap-1 mt-3 pt-2.5 border-t border-border/30">
                        <motion.button
                          whileTap={{ scale: 1.3 }}
                          onClick={() => toggleLike(thread.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            thread.liked ? 'bg-red-500/10 text-red-500 border border-red-500/25' : 'text-muted-foreground hover:bg-red-500/10 hover:text-red-400 border border-transparent'
                          }`}
                        >
                          <motion.span animate={likeAnimating === thread.id ? { scale: [1, 1.5, 1] } : {}} transition={{ duration: 0.4 }}>
                            <Heart size={13} className={thread.liked ? 'fill-current' : ''} />
                          </motion.span>
                          {thread.likeCount}
                        </motion.button>

                        <button
                          onClick={() => toggleExpand(thread.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all border border-transparent"
                        >
                          <MessageSquare size={13} /> {thread.replyCount}
                        </button>

                        <span className="flex items-center gap-1 px-2 py-1.5 text-xs text-muted-foreground">
                          <Eye size={12} /> {thread.views}
                        </span>

                        <button
                          onClick={() => toggleExpand(thread.id)}
                          className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors font-semibold"
                        >
                          {isExpanded ? <><ChevronUp size={13} /> Hide</> : <><ChevronDown size={13} /> Replies</>}
                        </button>
                      </div>
                    </div>

                    {/* Expanded replies */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-border/30 bg-gradient-to-b from-muted/20 to-muted/5 px-5 py-4 space-y-4">

                            {thread.replies.length === 0 ? (
                              <div className="text-center py-4 text-sm text-muted-foreground">
                                No replies yet — be the first to help! 💬
                              </div>
                            ) : (
                              thread.replies.map((reply, ri) => (
                                <motion.div
                                  key={reply.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: ri * 0.05 }}
                                  className="flex gap-3"
                                >
                                  <img
                                    src={avatarUrl(reply.author.name)}
                                    alt=""
                                    className="w-8 h-8 rounded-full ring-2 ring-white shrink-0"
                                  />
                                  <div className={`flex-1 rounded-2xl p-4 border shadow-sm transition-colors ${reply.isBestAnswer ? 'bg-amber-500/8 border-amber-500/25' : 'bg-card border-border/40'}`}>
                                    {reply.isBestAnswer && (
                                      <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-bold mb-2 bg-amber-500/15 px-2.5 py-1 rounded-full w-fit">
                                        <Trophy size={11} /> Best Answer
                                      </div>
                                    )}
                                    <div className="flex items-center justify-between mb-1.5">
                                      <span className="text-sm font-bold text-secondary">{reply.author.name}</span>
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-xs text-muted-foreground">{formatRelativeTime(reply.createdAt)}</span>
                                        {user?.id === reply.author.id && editingReplyId !== reply.id && (
                                          <>
                                            <button
                                              onClick={() => { setEditingReplyId(reply.id); setEditingContent(reply.content); }}
                                              className="p-1 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/8 transition-colors"
                                              title="Edit reply"
                                            >
                                              <Pencil size={11} />
                                            </button>
                                            <button
                                              onClick={() => handleDeleteReply(thread.id, reply.id)}
                                              disabled={deletingReplyId === reply.id}
                                              className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors disabled:opacity-50"
                                              title="Delete reply"
                                            >
                                              <Trash2 size={11} />
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </div>

                                    {editingReplyId === reply.id ? (
                                      <div className="space-y-2">
                                        <textarea
                                          value={editingContent}
                                          onChange={e => setEditingContent(e.target.value)}
                                          className="input-field resize-none w-full text-sm min-h-[72px]"
                                          maxLength={500}
                                          autoFocus
                                        />
                                        <div className="flex items-center gap-2 justify-end">
                                          <button
                                            onClick={() => { setEditingReplyId(null); setEditingContent(''); }}
                                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                          >
                                            <XIcon size={11} /> Cancel
                                          </button>
                                          <Button size="sm" onClick={() => handleEditReply(thread.id, reply.id)} disabled={!editingContent.trim()} className="gap-1 text-xs">
                                            <CheckCircle2 size={11} /> Save
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{reply.content}</p>
                                    )}

                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/20">
                                      <button
                                        onClick={async () => {
                                          const result = await threadsApi.likeReply(reply.id) as any;
                                          setThreadList(prev => prev.map(t =>
                                            t.id === thread.id
                                              ? { ...t, replies: t.replies.map(r => r.id === reply.id ? { ...r, liked: result.liked, likeCount: r.likeCount + (result.liked ? 1 : -1) } : r) }
                                              : t
                                          ));
                                        }}
                                        className={`flex items-center gap-1 text-xs transition-colors ${reply.liked ? 'text-red-500' : 'text-muted-foreground hover:text-red-400'}`}
                                      >
                                        <Heart size={12} className={reply.liked ? 'fill-current' : ''} /> {reply.likeCount || 0}
                                      </button>
                                      {user?.id === thread.author.id && !thread.solved && (
                                        <button
                                          onClick={() => markBestAnswer(thread.id, reply.id)}
                                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-amber-500 transition-colors font-medium"
                                        >
                                          <Trophy size={11} /> Mark Best
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              ))
                            )}

                            {/* Reply composer */}
                            <div className="flex gap-3 pt-2">
                              {user && (
                                <img
                                  src={avatarUrl(user.name)}
                                  alt=""
                                  className="w-8 h-8 rounded-full ring-2 ring-primary/30 shrink-0"
                                />
                              )}
                              <div className="flex-1 space-y-2">
                                <textarea
                                  value={replyContent}
                                  onChange={e => setReplyContent(e.target.value)}
                                  onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) submitReply(thread.id); }}
                                  placeholder="Write a helpful reply... (Ctrl+Enter to send)"
                                  className="input-field resize-none w-full min-h-[80px] text-sm"
                                  maxLength={500}
                                />
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">{replyContent.length}/500</span>
                                  <Button
                                    onClick={() => submitReply(thread.id)}
                                    loading={posting}
                                    disabled={!replyContent.trim()}
                                    size="sm"
                                    className="gap-1.5"
                                  >
                                    <Send size={13} /> Reply
                                  </Button>
                                </div>
                              </div>
                            </div>

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="w-72 shrink-0 space-y-4 hidden xl:block">

          {/* Points earned CTA */}
          <div className="bg-gradient-to-br from-primary to-indigo-600 rounded-2xl p-4 text-white shadow-lg shadow-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={16} className="text-white/80" />
              <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Earn Points</span>
            </div>
            <p className="font-heading font-bold text-base mb-1">Help others, gain XP</p>
            <div className="space-y-1 mt-3">
              {[['Post a question', '+15 pts'], ['Write a reply', '+10 pts'], ['Get a like', '+2 pts']].map(([a, p]) => (
                <div key={a} className="flex items-center justify-between text-sm">
                  <span className="text-white/80">{a}</span>
                  <span className="font-bold text-white bg-white/20 rounded-lg px-2 py-0.5 text-xs">{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={16} className="text-amber-500" />
              <h3 className="font-heading font-bold text-secondary text-sm">Top Students</h3>
              <span className="ml-auto text-xs text-muted-foreground">This week</span>
            </div>
            <div className="space-y-2">
              {leaderboard.slice(0, 5).map((lb, i) => {
                const rank = RANK_CONFIG[i] ?? RANK_CONFIG[3];
                const isMe = user?.id === lb.id;
                const maxPoints = leaderboard[0]?.points || 1;
                return (
                  <motion.div
                    key={lb.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className={`rounded-xl p-2.5 transition-all ${isMe ? 'ring-2 ring-primary/30 bg-primary/5' : 'hover:bg-muted/50'}`}
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${rank.bg} flex items-center justify-center text-sm font-bold shrink-0`}>
                        {i < 3 ? rank.label : <span className={`text-xs font-bold ${rank.text}`}>{i + 1}</span>}
                      </div>
                      <img src={avatarUrl(lb.name)} alt="" className={`w-7 h-7 rounded-full ring-2 ${rank.ring} shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-secondary truncate">{lb.name}{isMe ? ' (you)' : ''}</p>
                          <span className="text-xs font-bold text-primary shrink-0">{lb.points.toLocaleString()}</span>
                        </div>
                        <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${rank.bg} transition-all duration-700`}
                            style={{ width: `${Math.round((lb.points / maxPoints) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-14">
                      <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                        <MessageSquare size={10} /> {lb._count.replies} answers
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Popular Tags */}
          <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Hash size={14} className="text-primary" />
              <h3 className="font-heading font-bold text-secondary text-sm">Trending Tags</h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_TAGS.map(({ tag, color }) => (
                <motion.span
                  key={tag}
                  whileHover={{ scale: 1.05 }}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${color}`}
                >
                  #{tag}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Community Stats */}
          <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-primary" />
              <h3 className="font-heading font-bold text-secondary text-sm">Community Stats</h3>
            </div>
            <div className="space-y-3">
              {[
                { icon: Users, label: 'Members', value: `${leaderboard.length * 100}+`, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { icon: MessageSquare, label: 'Questions', value: `${threadList.length}`, color: 'text-primary', bg: 'bg-primary/10' },
                { icon: CheckCircle2, label: 'Solved', value: `${solvedPct}%`, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                { icon: Award, label: 'Points Earned', value: `${leaderboard.reduce((s, l) => s + l.points, 0).toLocaleString()}`, color: 'text-amber-500', bg: 'bg-amber-500/10' },
              ].map(({ icon: Icon, label, value, color, bg }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                    <Icon size={14} className={color} />
                  </div>
                  <span className="text-sm text-muted-foreground flex-1">{label}</span>
                  <span className="text-sm font-bold text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Ask Question Modal ── */}
      <Modal open={newThread} onClose={() => setNewThread(false)} title="Ask the Community" size="lg">
        <div className="space-y-4">
          {/* Tips banner */}
          <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/20 rounded-xl">
            <Sparkles size={14} className="text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-primary leading-relaxed">
              <strong>Tip:</strong> Clear, specific questions get answered faster. Add context and mention what you've already tried.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Question Title <span className="text-destructive">*</span></label>
            <input
              value={newForm.title}
              onChange={e => setNewForm(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. How does osmosis differ from diffusion?"
              className="input-field"
              maxLength={120}
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">{newForm.title.length}/120</p>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Details</label>
            <textarea
              value={newForm.content}
              onChange={e => setNewForm(p => ({ ...p, content: e.target.value }))}
              placeholder="Provide context, what you've tried, or share relevant notes..."
              className="input-field resize-none"
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">{newForm.content.length}/1000</p>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Subject <span className="text-destructive">*</span></label>
            <select
              value={newForm.subject}
              onChange={e => setNewForm(p => ({ ...p, subject: e.target.value }))}
              className="input-field"
            >
              <option value="">Select a subject...</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{subjectIcon(s)} {s}</option>)}
            </select>
            {newForm.subject && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"
              >
                <span className="text-base">{subjectIcon(newForm.subject)}</span>
                <span>Posting in <strong className="text-foreground">{newForm.subject}</strong></span>
              </motion.div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Tags <span className="text-muted-foreground text-xs font-normal">(comma-separated)</span></label>
            <input
              value={newForm.tags}
              onChange={e => setNewForm(p => ({ ...p, tags: e.target.value }))}
              placeholder="e.g. osmosis, diffusion, O-Level"
              className="input-field"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setNewThread(false)} className="flex-1">Cancel</Button>
            <Button
              onClick={submitThread}
              loading={posting}
              disabled={!newForm.title.trim() || !newForm.subject}
              className="flex-1 gap-2"
            >
              <Send size={14} /> Post Question (+15 pts)
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
