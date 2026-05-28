'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search, Star, Users, MessageSquare, MapPin, Briefcase,
  CheckCircle2, BookOpen, UserPlus, UserCheck, GraduationCap, Loader2,
  LayoutGrid, List, Rows3,
} from 'lucide-react';
import { teachers as teachersApi } from '@/lib/api';
import { getUser } from '@/lib/auth';
import { SUBJECTS } from '@/types';
import type { TeacherProfile, User } from '@/types';

type TeacherView = 'grid' | 'large' | 'list';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={12}
          className={i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{rating > 0 ? rating.toFixed(1) : 'New'}</span>
    </div>
  );
}

function TeacherCard({ teacher, currentUserId, onFollowToggle, view = 'grid' }: {
  teacher: TeacherProfile;
  currentUserId: string;
  onFollowToggle: (id: string, following: boolean) => void;
  view?: TeacherView;
}) {
  const [following, setFollowing] = useState(teacher.isFollowing ?? false);
  const [loading, setLoading] = useState(false);
  const isSelf = teacher.userId === currentUserId;

  async function handleFollow(e: React.MouseEvent) {
    e.preventDefault();
    if (isSelf) return;
    setLoading(true);
    try {
      const res = await teachersApi.follow(teacher.userId) as any;
      setFollowing(res.following);
      onFollowToggle(teacher.userId, res.following);
    } finally {
      setLoading(false);
    }
  }

  const initials = teacher.user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);

  const followBtn = !isSelf ? (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`shrink-0 py-2 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
        following
          ? 'bg-primary/8 text-primary border border-primary/20 hover:bg-destructive/8 hover:text-destructive hover:border-destructive/20'
          : 'bg-primary text-white hover:bg-primary/90 shadow-sm shadow-primary/20'
      }`}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : following ? <><UserCheck size={14} /> Following</> : <><UserPlus size={14} /> Follow</>}
    </button>
  ) : null;

  /* ── List view ── */
  if (view === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-card rounded-2xl border border-border/50 p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:shadow-md hover:border-primary/20 transition-all group"
      >
        <Link href={`/teachers/${teacher.userId}`} className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center text-white font-bold text-base shadow-md">
              {initials}
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${teacher.available ? 'bg-emerald-400' : 'bg-muted-foreground/40'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="font-semibold text-secondary text-sm group-hover:text-primary transition-colors truncate">{teacher.user.name}</p>
              {teacher.verified && <CheckCircle2 size={12} className="text-primary shrink-0" />}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
              <span className="flex items-center gap-1"><Briefcase size={10} />{teacher.jobStatus}</span>
              {teacher.town && <span className="flex items-center gap-1"><MapPin size={10} />{teacher.town}</span>}
            </div>
          </div>
          <div className="hidden sm:flex flex-wrap gap-1 max-w-[160px]">
            {teacher.subjects.slice(0, 2).map(s => (
              <span key={s} className="text-xs bg-primary/8 text-primary px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                {s.split(' /')[0]}
              </span>
            ))}
            {teacher.subjects.length > 2 && <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">+{teacher.subjects.length - 2}</span>}
          </div>
          <div className="hidden md:flex items-center gap-3 text-xs text-muted-foreground shrink-0">
            <span className="flex items-center gap-1"><Star size={11} className="text-amber-400 fill-amber-400" />{teacher.rating.toFixed(1)}</span>
            <span className="flex items-center gap-1"><Users size={11} />{teacher.followerCount ?? 0}</span>
            <span className="flex items-center gap-1"><MessageSquare size={11} />{teacher.user._count.replies}</span>
          </div>
        </Link>
        {followBtn}
      </motion.div>
    );
  }

  /* ── Grid / Large view ── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-card rounded-2xl border border-border/50 overflow-hidden hover:shadow-lg hover:shadow-primary/8 hover:border-primary/20 transition-all duration-200 group"
    >
      <Link href={`/teachers/${teacher.userId}`} className="block">
        <div className="relative h-20 bg-gradient-to-br from-primary/20 via-indigo-500/10 to-violet-500/20">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/80" />
          {teacher.verified && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-primary/90 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
              <CheckCircle2 size={10} /> Verified
            </div>
          )}
          <div className={`absolute top-2 left-3 w-2 h-2 rounded-full shadow-sm ${teacher.available ? 'bg-emerald-400' : 'bg-muted-foreground/40'}`} />
        </div>

        <div className="px-4 -mt-8 pb-4 relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-card mb-3">
            {initials}
          </div>

          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-secondary text-sm group-hover:text-primary transition-colors truncate">{teacher.user.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Briefcase size={11} className="text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground truncate">{teacher.jobStatus}</p>
              </div>
              {teacher.town && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <MapPin size={11} className="text-muted-foreground shrink-0" />
                  <p className="text-xs text-muted-foreground truncate">{teacher.town}</p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-2"><StarRating rating={teacher.rating} /></div>
          <div className="flex flex-wrap gap-1 mt-2">
            {teacher.subjects.slice(0, view === 'large' ? 4 : 3).map(s => (
              <span key={s} className="text-xs bg-primary/8 text-primary px-2 py-0.5 rounded-full font-medium">{s.split(' /')[0]}</span>
            ))}
            {teacher.subjects.length > (view === 'large' ? 4 : 3) && (
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">+{teacher.subjects.length - (view === 'large' ? 4 : 3)}</span>
            )}
          </div>
          {view === 'large' && teacher.bio && (
            <p className="text-xs text-muted-foreground mt-3 line-clamp-2 leading-relaxed">{teacher.bio}</p>
          )}
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/40">
            <div className="flex items-center gap-1 text-xs text-muted-foreground"><Users size={11} /><span>{teacher.followerCount ?? 0} students</span></div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground"><MessageSquare size={11} /><span>{teacher.user._count.replies} answers</span></div>
          </div>
        </div>
      </Link>

      {!isSelf && (
        <div className="px-4 pb-4">
          <button
            onClick={handleFollow}
            disabled={loading}
            className={`w-full py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              following
                ? 'bg-primary/8 text-primary border border-primary/20 hover:bg-destructive/8 hover:text-destructive hover:border-destructive/20'
                : 'bg-primary text-white hover:bg-primary/90 shadow-sm shadow-primary/20'
            }`}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : following ? <><UserCheck size={14} /> Following</> : <><UserPlus size={14} /> Follow</>}
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default function TeachersPage() {
  const [teacherList, setTeacherList] = useState<TeacherProfile[]>([]);
  const [loading, setLoading]         = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [search, setSearch]           = useState('');
  const [subject, setSubject]         = useState('');
  const [hasProfile, setHasProfile]   = useState(false);
  const [view, setView]               = useState<TeacherView>('grid');

  useEffect(() => {
    Promise.all([getUser(), teachersApi.list(), teachersApi.me().catch(() => null)]).then(([u, t, me]) => {
      setCurrentUser(u as User);
      setTeacherList(t as TeacherProfile[]);
      setHasProfile(!!(me as any)?.id);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  function handleFollowToggle(userId: string, following: boolean) {
    setTeacherList(prev => prev.map(t =>
      t.userId === userId
        ? { ...t, isFollowing: following, followerCount: (t.followerCount ?? 0) + (following ? 1 : -1) }
        : t
    ));
  }

  const filtered = teacherList.filter(t => {
    const matchSubject = !subject || t.subjects.includes(subject);
    const matchSearch  = !search || t.user.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subjects.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
      (t.town || '').toLowerCase().includes(search.toLowerCase());
    return matchSubject && matchSearch;
  });

  return (
    <div className="animate-enter space-y-6">
      {/* Hero */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-primary to-violet-600 rounded-3xl p-6 md:p-8 text-white overflow-hidden shadow-xl">
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <GraduationCap size={16} />
              </div>
              <span className="text-white/70 text-sm font-medium">Teacher Directory</span>
            </div>
            <h1 className="font-heading font-bold text-2xl md:text-3xl">Find Your Mentor</h1>
            <p className="text-white/70 text-sm mt-1 max-w-md">
              Connect with qualified teachers for extra classes, mentoring, and guidance.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap shrink-0">
            <div className="bg-white/10 backdrop-blur rounded-2xl px-4 py-2 text-center border border-white/20">
              <p className="font-heading font-bold text-xl">{teacherList.length}</p>
              <p className="text-white/70 text-xs">Teachers</p>
            </div>
            <Link
              href={hasProfile ? '/teachers/' + currentUser?.id : '/become-teacher'}
              className="bg-white text-primary px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-white/90 transition-all shadow-md flex items-center gap-2"
            >
              <GraduationCap size={16} />
              {hasProfile ? 'My Profile' : 'Become a Teacher'}
            </Link>
          </div>
        </div>
      </div>

      {/* Search + Filter + View toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, subject or town..."
            className="input-field pl-10 py-2.5 text-sm"
          />
        </div>
        <select
          value={subject}
          onChange={e => setSubject(e.target.value)}
          className="input-field py-2.5 text-sm max-w-xs"
        >
          <option value="">All subjects</option>
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {/* View toggle */}
        <div className="flex border border-border rounded-xl overflow-hidden shrink-0 self-start sm:self-auto">
          {([
            { v: 'grid',  icon: LayoutGrid, tip: 'Grid view' },
            { v: 'large', icon: Rows3,       tip: 'Large cards' },
            { v: 'list',  icon: List,        tip: 'List view' },
          ] as const).map(({ v, icon: Icon, tip }) => (
            <button
              key={v}
              onClick={() => setView(v)}
              title={tip}
              className={`px-3 py-2.5 transition-all ${view === v ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}
            >
              <Icon size={15} />
            </button>
          ))}
        </div>
      </div>

      {/* Teacher cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-border/50 overflow-hidden animate-pulse">
              <div className="h-20 bg-muted" />
              <div className="p-4 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-muted -mt-8" />
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-8 bg-muted rounded-xl mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className={
          view === 'list'  ? 'space-y-2' :
          view === 'large' ? 'grid grid-cols-1 sm:grid-cols-2 gap-5' :
                             'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
        }>
          {filtered.map(t => (
            <TeacherCard
              key={t.userId}
              teacher={t}
              currentUserId={currentUser?.id ?? ''}
              onFollowToggle={handleFollowToggle}
              view={view}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <GraduationCap size={28} className="text-muted-foreground/40" />
          </div>
          <p className="font-semibold text-secondary mb-1">No teachers found</p>
          <p className="text-sm text-muted-foreground mb-4">
            {search || subject ? 'Try adjusting your filters.' : 'Be the first to register as a teacher!'}
          </p>
          <Link href="/become-teacher" className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold">
            <GraduationCap size={16} /> Become a Teacher
          </Link>
        </div>
      )}
    </div>
  );
}
