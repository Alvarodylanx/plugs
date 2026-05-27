'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Heart, MessageSquare, Eye, Pin, CheckCircle2, Send, Trophy, Hash, Users } from 'lucide-react';
import { threads as threadsApi } from '@/lib/api';
import { getUser } from '@/lib/auth';
import { subjectColor, subjectIcon, formatRelativeTime, avatarUrl } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SUBJECTS } from '@/types';
import type { Thread, LeaderboardUser, User } from '@/types';

const SORTS = ['hot', 'new', 'top'] as const;

export default function CommunityPage() {
  const [threadList, setThreadList] = useState<Thread[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [subject, setSubject] = useState('');
  const [sort, setSort] = useState<'hot' | 'new' | 'top'>('hot');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [newThread, setNewThread] = useState(false);
  const [newForm, setNewForm] = useState({ title: '', content: '', subject: '', tags: '' });
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    Promise.all([getUser(), threadsApi.list(subject || undefined, sort), threadsApi.leaderboard()]).then(([u, t, lb]) => {
      setUser(u as User);
      setThreadList(t as Thread[]);
      setLeaderboard(lb as LeaderboardUser[]);
      setLoading(false);
    });
  }, [subject, sort]);

  async function toggleLike(threadId: string) {
    const result = await threadsApi.like(threadId) as any;
    setThreadList(prev => prev.map(t => t.id === threadId ? { ...t, liked: result.liked, likeCount: t.likeCount + (result.liked ? 1 : -1) } : t));
  }

  async function submitReply(threadId: string) {
    if (!replyContent.trim()) return;
    setPosting(true);
    const reply = await threadsApi.reply(threadId, replyContent) as any;
    setThreadList(prev => prev.map(t => t.id === threadId ? { ...t, replies: [...t.replies, reply], replyCount: t.replyCount + 1 } : t));
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

  const rankEmoji = ['🏆', '🥈', '🥉', '⭐', '⭐'];
  const subjects = ['', ...SUBJECTS];

  return (
    <div className="animate-enter space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading font-bold text-2xl text-secondary">Community Hub</h1>
          <p className="text-muted-foreground text-sm mt-1">Ask questions, share knowledge, earn points</p>
        </div>
        <Button onClick={() => setNewThread(true)} className="gap-2 shadow-md shadow-primary/30">
          <Plus size={16} /> Ask a Question
        </Button>
      </div>

      {/* Subject tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {subjects.map(s => (
          <button key={s || 'all'} onClick={() => setSubject(s)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold border transition-all ${subject === s ? 'bg-primary text-white border-primary shadow-sm' : 'bg-card border-border/50 text-muted-foreground hover:border-primary/50 hover:text-primary'}`}
          >
            {s ? `${subjectIcon(s)} ${s.split(' / ')[0]}` : '📚 All'}
          </button>
        ))}
      </div>

      {/* Sort + content */}
      <div className="flex gap-6 items-start">
        {/* Main feed */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Sort */}
          <div className="flex items-center gap-1">
            {SORTS.map(s => (
              <button key={s} onClick={() => setSort(s)} className={`px-3 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${sort === s ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}>
                {s === 'hot' ? '🔥' : s === 'new' ? '✨' : '⬆️'} {s}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-36 bg-muted rounded-2xl animate-pulse" />)}
            </div>
          ) : threadList.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare size={36} className="text-muted-foreground mx-auto mb-3" />
              <p className="font-semibold text-secondary">No threads yet</p>
              <p className="text-sm text-muted-foreground mt-1">Be the first to ask a question!</p>
            </div>
          ) : (
            threadList.map((thread, i) => (
              <motion.div key={thread.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl border border-border/50 overflow-hidden"
              >
                <div className="p-5">
                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-2">
                    {thread.pinned && <span className="badge bg-amber-100 text-amber-700"><Pin size={10} /> Pinned</span>}
                    {thread.solved && <span className="badge bg-emerald-100 text-emerald-700"><CheckCircle2 size={10} /> Solved</span>}
                    <Badge variant="subject" subject={thread.subject} className="ml-auto">{subjectIcon(thread.subject)} {thread.subject.split(' / ')[0]}</Badge>
                  </div>

                  {/* Title */}
                  <button onClick={() => setExpanded(expanded === thread.id ? null : thread.id)} className="text-left w-full">
                    <h3 className="font-heading font-semibold text-secondary hover:text-primary transition-colors">{thread.title}</h3>
                  </button>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{thread.content}</p>

                  {/* Author + tags */}
                  <div className="flex items-center gap-2 mt-3">
                    <img src={avatarUrl(thread.author.name)} alt="" className="w-6 h-6 rounded-full" />
                    <span className="text-xs text-muted-foreground">{thread.author.name}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{formatRelativeTime(thread.createdAt)}</span>
                    {thread.tags.slice(0, 3).map(t => <span key={t} className="badge bg-muted text-muted-foreground text-xs">#{t}</span>)}
                  </div>

                  {/* Footer actions */}
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/30">
                    <button onClick={() => toggleLike(thread.id)} className={`flex items-center gap-1.5 text-sm transition-colors ${thread.liked ? 'text-red-500' : 'text-muted-foreground hover:text-red-400'}`}>
                      <Heart size={15} className={thread.liked ? 'fill-current' : ''} /> {thread.likeCount}
                    </button>
                    <button onClick={() => setExpanded(expanded === thread.id ? null : thread.id)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <MessageSquare size={15} /> {thread.replyCount}
                    </button>
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground ml-auto">
                      <Eye size={15} /> {thread.views}
                    </span>
                  </div>
                </div>

                {/* Expanded replies */}
                <AnimatePresence>
                  {expanded === thread.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-border/30 bg-muted/30"
                    >
                      <div className="p-5 space-y-4">
                        {thread.replies.map(reply => (
                          <div key={reply.id} className="flex gap-3">
                            <img src={avatarUrl(reply.author.name)} alt="" className="w-8 h-8 rounded-full shrink-0" />
                            <div className="flex-1 bg-card rounded-xl p-3 border border-border/30">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-semibold text-secondary">{reply.author.name}</span>
                                <span className="text-xs text-muted-foreground">{formatRelativeTime(reply.createdAt)}</span>
                              </div>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{reply.content}</p>
                            </div>
                          </div>
                        ))}

                        {/* Reply input */}
                        <div className="flex gap-3">
                          {user && <img src={avatarUrl(user.name)} alt="" className="w-8 h-8 rounded-full shrink-0" />}
                          <div className="flex-1 flex gap-2">
                            <textarea
                              value={replyContent}
                              onChange={e => setReplyContent(e.target.value)}
                              placeholder="Write a helpful reply..."
                              className="input-field resize-none flex-1 min-h-[72px] text-sm"
                            />
                            <Button onClick={() => submitReply(thread.id)} loading={posting} disabled={!replyContent.trim()} size="sm" className="self-end">
                              <Send size={14} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>

        {/* Sidebar */}
        <div className="w-64 shrink-0 space-y-4 hidden xl:block">
          {/* Leaderboard */}
          <div className="bg-card rounded-2xl border border-border/50 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={16} className="text-amber-500" />
              <h3 className="font-heading font-semibold text-secondary text-sm">Community Leaders</h3>
            </div>
            <div className="space-y-3">
              {leaderboard.slice(0, 5).map((lb, i) => (
                <div key={lb.id} className={`flex items-center gap-2.5 p-2 rounded-xl transition-colors ${user?.id === lb.id ? 'bg-primary/5 border border-primary/20' : 'hover:bg-muted'}`}>
                  <span className="text-base">{rankEmoji[i]}</span>
                  <img src={avatarUrl(lb.name)} alt="" className="w-7 h-7 rounded-full shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-secondary truncate">{lb.name}</p>
                    <p className="text-xs text-muted-foreground">{lb.points.toLocaleString()} pts</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{lb._count.replies}ans</span>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Tags */}
          <div className="bg-card rounded-2xl border border-border/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Hash size={14} className="text-muted-foreground" />
              <h3 className="font-heading font-semibold text-secondary text-sm">Popular Tags</h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['cell division', 'OSI model', 'essay writing', 'DNA', 'simultaneous equations', 'genetics', 'networking', 'history'].map(t => (
                <span key={t} className="badge bg-muted text-muted-foreground text-xs cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors">#{t}</span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-card rounded-2xl border border-border/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users size={14} className="text-muted-foreground" />
              <h3 className="font-heading font-semibold text-secondary text-sm">Community Stats</h3>
            </div>
            <div className="space-y-2">
              {[['Members', leaderboard.length + '00+'], ['Questions', threadList.length + '00+'], ['Solved', Math.round(threadList.filter(t => t.solved).length / threadList.length * 100 || 0) + '%']].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-semibold text-foreground">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ask question modal */}
      <Modal open={newThread} onClose={() => setNewThread(false)} title="Ask a Question" size="lg">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Question Title</label>
            <input value={newForm.title} onChange={e => setNewForm(p => ({ ...p, title: e.target.value }))} placeholder="What do you want to know?" className="input-field" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Details</label>
            <textarea value={newForm.content} onChange={e => setNewForm(p => ({ ...p, content: e.target.value }))} placeholder="Explain your question in more detail..." className="input-field resize-none" rows={5} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Subject</label>
            <select value={newForm.subject} onChange={e => setNewForm(p => ({ ...p, subject: e.target.value }))} className="input-field">
              <option value="">Select subject...</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Tags (comma-separated)</label>
            <input value={newForm.tags} onChange={e => setNewForm(p => ({ ...p, tags: e.target.value }))} placeholder="e.g. photosynthesis, biology, O-Level" className="input-field" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setNewThread(false)} className="flex-1">Cancel</Button>
            <Button onClick={submitThread} loading={posting} disabled={!newForm.title || !newForm.subject} className="flex-1">Post Question</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
