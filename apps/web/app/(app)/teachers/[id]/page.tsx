'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Star, Users, MessageSquare, Flame, MapPin, Briefcase,
  CheckCircle2, Video, UserPlus, UserCheck, Award, BookOpen,
  Trophy, Heart, School, Loader2, X,
} from 'lucide-react';

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );
}

function WhatsAppButton({ teacherName, available }: { teacherName: string; available: boolean }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const message = encodeURIComponent(
    `Hi ${teacherName}, I found your profile on Plug and I'd like to learn more about your tutoring sessions. Are you available?`
  );
  const href = `https://wa.me/?text=${message}`;

  return (
    <div className="fixed bottom-20 right-6 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            className="bg-zinc-900 text-white text-xs font-medium px-3 py-2 rounded-xl shadow-xl whitespace-nowrap"
          >
            Contact on WhatsApp
            <div className="absolute bottom-[-5px] right-4 w-2.5 h-2.5 bg-zinc-900 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        {/* Pulsing ring */}
        {available && (
          <>
            <span className="absolute inset-0 rounded-2xl bg-[#25D366] opacity-30 animate-ping" />
            <span className="absolute inset-0 rounded-2xl bg-[#25D366] opacity-20 animate-ping [animation-delay:0.4s]" />
          </>
        )}
        <motion.a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl shadow-green-500/40 transition-shadow hover:shadow-2xl hover:shadow-green-500/50"
          style={{ backgroundColor: '#25D366' }}
          aria-label="Contact on WhatsApp"
        >
          <WhatsAppIcon />
        </motion.a>
      </div>
    </div>
  );
}
import { teachers as teachersApi } from '@/lib/api';
import { getUser } from '@/lib/auth';
import { subjectColor, formatRelativeTime } from '@/lib/utils';
import { VideoCallModal } from '@/components/ui/video-call-modal';
import type { TeacherProfile, User } from '@/types';

function StarRating({ rating, interactive = false, onRate }: { rating: number; interactive?: boolean; onRate?: (r: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          disabled={!interactive}
          onClick={() => onRate?.(i)}
          onMouseEnter={() => interactive && setHovered(i)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
        >
          <Star
            size={interactive ? 20 : 14}
            className={
              i <= (hovered || Math.round(rating))
                ? 'text-amber-400 fill-amber-400'
                : 'text-muted-foreground/30'
            }
          />
        </button>
      ))}
      {!interactive && <span className="text-sm text-muted-foreground ml-1">({rating > 0 ? rating.toFixed(1) : 'No ratings yet'})</span>}
    </div>
  );
}

export default function TeacherProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const [rated, setRated] = useState(false);

  useEffect(() => {
    Promise.all([getUser(), teachersApi.get(id)]).then(([u, p]) => {
      setCurrentUser(u as User);
      const prof = p as TeacherProfile;
      setProfile(prof);
      setFollowing(prof.isFollowing ?? false);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  async function handleFollow() {
    if (!profile) return;
    setFollowLoading(true);
    try {
      const res = await teachersApi.follow(id) as any;
      setFollowing(res.following);
      setProfile(prev => prev ? { ...prev, followerCount: (prev.followerCount ?? 0) + (res.following ? 1 : -1) } : prev);
    } finally {
      setFollowLoading(false);
    }
  }

  async function handleRate(rating: number) {
    if (rated) return;
    await teachersApi.rate(id, rating);
    setRated(true);
    setProfile(prev => prev ? { ...prev, rating } : prev);
  }

  const isSelf = currentUser?.id === profile?.userId;
  const initials = profile?.user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) ?? '?';

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
        <div className="h-40 bg-muted rounded-3xl" />
        <div className="h-60 bg-muted rounded-2xl" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <p className="font-semibold text-secondary">Teacher not found</p>
        <Link href="/teachers" className="text-primary text-sm mt-2 inline-block hover:underline">← Back to directory</Link>
      </div>
    );
  }

  return (
    <div className="animate-enter max-w-3xl mx-auto space-y-5">
      {/* Back */}
      <Link href="/teachers" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={16} /> Teacher Directory
      </Link>

      {/* Hero card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-3xl border border-border/50 overflow-hidden"
      >
        {/* Banner */}
        <div className="h-28 bg-gradient-to-br from-primary/30 via-indigo-500/20 to-violet-500/30 relative">
          {profile.verified && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
              <CheckCircle2 size={11} /> Verified Teacher
            </div>
          )}
          <div className={`absolute top-4 left-4 flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${profile.available ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${profile.available ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}`} />
            {profile.available ? 'Available' : 'Unavailable'}
          </div>
        </div>

        <div className="px-6 pb-6 -mt-10">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center text-white font-bold text-2xl shadow-xl border-4 border-card mb-4">
            {initials}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="font-heading font-bold text-xl text-secondary">{profile.user.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Briefcase size={13} /> {profile.jobStatus}</span>
                {profile.town && <span className="flex items-center gap-1"><MapPin size={13} /> {profile.town}</span>}
                {profile.school && <span className="flex items-center gap-1"><School size={13} /> {profile.school}</span>}
              </div>
              <div className="mt-2">
                <StarRating rating={profile.rating} />
                <p className="text-xs text-muted-foreground mt-0.5">{profile.ratingCount} ratings</p>
              </div>
            </div>

            {/* Action buttons */}
            {!isSelf && (
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setCallOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-500/25"
                >
                  <Video size={15} /> Video Call
                </button>
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    following
                      ? 'bg-primary/8 text-primary border border-primary/20 hover:bg-destructive/8 hover:text-destructive hover:border-destructive/20'
                      : 'bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20'
                  }`}
                >
                  {followLoading ? <Loader2 size={14} className="animate-spin" /> : following ? <><UserCheck size={14} /> Following</> : <><UserPlus size={14} /> Follow</>}
                </button>
              </div>
            )}
            {isSelf && (
              <Link href="/become-teacher" className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                Edit Profile
              </Link>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-muted-foreground leading-relaxed mt-4 border-t border-border/50 pt-4">
              {profile.bio}
            </p>
          )}
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Users, label: 'Students', value: profile.followerCount ?? 0, color: 'text-primary', bg: 'bg-primary/8' },
          { icon: MessageSquare, label: 'Answers', value: profile.user._count.replies, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { icon: Flame, label: 'Streak', value: `${profile.user.streak}d`, color: 'text-orange-500', bg: 'bg-orange-50' },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-2xl border border-border/50 p-4 text-center">
            <div className={`w-8 h-8 ${s.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
              <s.icon size={16} className={s.color} />
            </div>
            <p className="font-heading font-bold text-secondary text-lg">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Subjects */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl border border-border/50 p-5"
      >
        <h2 className="font-semibold text-secondary flex items-center gap-2 mb-3">
          <BookOpen size={15} className="text-primary" /> Subjects Taught
        </h2>
        <div className="flex flex-wrap gap-2">
          {profile.subjects.map(s => (
            <span key={s} className="px-3 py-1.5 rounded-xl bg-primary/8 text-primary text-sm font-medium border border-primary/15">
              {s}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Rate this teacher */}
      {!isSelf && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-card rounded-2xl border border-border/50 p-5"
        >
          <h2 className="font-semibold text-secondary flex items-center gap-2 mb-3">
            <Star size={15} className="text-amber-400" /> Rate This Teacher
          </h2>
          {rated ? (
            <p className="text-sm text-emerald-600 flex items-center gap-2">
              <CheckCircle2 size={14} /> Thanks for your rating!
            </p>
          ) : (
            <div>
              <StarRating rating={profile.rating} interactive onRate={handleRate} />
              <p className="text-xs text-muted-foreground mt-1">Click a star to rate</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Recent community answers */}
      {profile.recentReplies && profile.recentReplies.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl border border-border/50 p-5"
        >
          <h2 className="font-semibold text-secondary flex items-center gap-2 mb-4">
            <MessageSquare size={15} className="text-primary" /> Recent Community Answers
          </h2>
          <div className="space-y-3">
            {profile.recentReplies.map(reply => (
              <div key={reply.id} className={`rounded-xl p-3 border ${reply.isBestAnswer ? 'bg-amber-50 border-amber-200' : 'bg-muted/30 border-border/50'}`}>
                {reply.isBestAnswer && (
                  <div className="flex items-center gap-1.5 text-amber-600 text-xs font-bold mb-1.5">
                    <Trophy size={11} /> Best Answer
                  </div>
                )}
                <p className="text-sm text-foreground leading-relaxed line-clamp-2">{reply.content}</p>
                <div className="flex items-center justify-between mt-2">
                  <Link href={`/social`} className="text-xs text-primary hover:underline truncate max-w-[60%]">
                    {reply.thread.title}
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                    <span className="flex items-center gap-1"><Heart size={10} /> {reply.likeCount}</span>
                    <span>{formatRelativeTime(reply.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Video call modal */}
      <VideoCallModal
        open={callOpen}
        onClose={() => setCallOpen(false)}
        teacherName={profile.user.name}
        roomId={`${currentUser?.id ?? 'anon'}-${profile.userId}`}
      />

      {/* Floating WhatsApp button */}
      {!isSelf && (
        <WhatsAppButton teacherName={profile.user.name} available={profile.available} />
      )}
    </div>
  );
}
