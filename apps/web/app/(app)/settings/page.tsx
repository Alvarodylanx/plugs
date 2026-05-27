'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Check, UserCircle2, Mail, Save, AlertCircle, Award, Lock } from 'lucide-react';
import { auth as authApi, badges as badgesApi } from '@/lib/api';
import { getUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import type { User, BadgeDef } from '@/types';

const AVATAR_KEY = 'plug_avatar';

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [badgeList, setBadgeList] = useState<BadgeDef[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getUser().then(u => {
      if (u) { setUser(u); setName(u.name); }
    });
    setAvatarSrc(localStorage.getItem(AVATAR_KEY));
    badgesApi.getAll().then(b => setBadgeList(b as BadgeDef[])).catch(() => {});
  }, []);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError('Image must be under 2 MB'); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      const b64 = ev.target?.result as string;
      setAvatarSrc(b64);
      localStorage.setItem(AVATAR_KEY, b64);
      window.dispatchEvent(new CustomEvent('plug_profile_updated'));
    };
    reader.readAsDataURL(file);
  }

  function removeAvatar() {
    setAvatarSrc(null);
    localStorage.removeItem(AVATAR_KEY);
    window.dispatchEvent(new CustomEvent('plug_profile_updated'));
  }

  async function handleSave() {
    if (!name.trim() || name.trim().length < 2) { setError('Name must be at least 2 characters'); return; }
    setError('');
    setSaving(true);
    try {
      const updated = await authApi.updateProfile({ name: name.trim() }) as User;
      setUser(updated);
      const { setCachedUser } = await import('@/lib/auth');
      setCachedUser(updated);
      window.dispatchEvent(new CustomEvent('plug_profile_updated'));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  }

  if (!user) {
    return <div className="h-64 bg-muted rounded-2xl animate-pulse" />;
  }

  return (
    <div className="animate-enter space-y-6 max-w-2xl">
      <div>
        <h1 className="font-heading font-bold text-2xl text-secondary">Profile Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account and appearance</p>
      </div>

      {/* Avatar section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border/50 p-6"
      >
        <h2 className="font-semibold text-secondary mb-4 flex items-center gap-2">
          <UserCircle2 size={16} className="text-primary" /> Profile Picture
        </h2>

        <div className="flex items-center gap-6">
          {/* Avatar preview */}
          <div className="relative shrink-0">
            {avatarSrc ? (
              <img src={avatarSrc} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-primary/20 shadow-lg" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center text-white font-heading font-bold text-2xl shadow-lg border-4 border-primary/20">
                {getInitials(user.name)}
              </div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
            >
              <Camera size={14} />
            </button>
          </div>

          <div className="flex-1">
            <p className="font-semibold text-secondary">{user.name}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{user.email}</p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => fileRef.current?.click()}
                className="text-sm font-semibold text-primary border border-primary/30 hover:bg-primary/5 px-4 py-1.5 rounded-xl transition-colors"
              >
                Upload photo
              </button>
              {avatarSrc && (
                <button
                  onClick={removeAvatar}
                  className="text-sm font-semibold text-destructive/70 border border-border hover:bg-destructive/5 px-4 py-1.5 rounded-xl transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">JPG, PNG or GIF. Max 2 MB.</p>
          </div>

          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
      </motion.div>

      {/* Account info */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="bg-card rounded-2xl border border-border/50 p-6 space-y-4"
      >
        <h2 className="font-semibold text-secondary flex items-center gap-2">
          <Mail size={16} className="text-primary" /> Account Details
        </h2>

        <div>
          <label className="text-sm font-medium block mb-1.5">Display Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="input-field"
            placeholder="Your name"
            maxLength={60}
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1.5 text-muted-foreground">Email Address</label>
          <input type="email" value={user.email} disabled className="input-field opacity-50 cursor-not-allowed" />
          <p className="text-xs text-muted-foreground mt-1">Email cannot be changed.</p>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1.5 text-muted-foreground">Level</label>
          <input type="text" value={user.level} disabled className="input-field opacity-50 cursor-not-allowed" />
        </div>
      </motion.div>

      {/* Stats (read-only) */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        className="grid grid-cols-3 gap-3"
      >
        {[
          { label: 'Points', value: user.points.toLocaleString(), emoji: '⭐' },
          { label: 'Streak', value: `${user.streak} days`, emoji: '🔥' },
          { label: 'Level', value: user.level, emoji: '🎓' },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-xl border border-border/50 p-4 text-center">
            <span className="text-2xl block mb-1">{s.emoji}</span>
            <p className="font-heading font-bold text-secondary">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Badges */}
      {badgeList.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
          className="bg-card rounded-2xl border border-border/50 p-6"
        >
          <h2 className="font-semibold text-secondary flex items-center gap-2 mb-1">
            <Award size={16} className="text-amber-500" /> Your Badges
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            {badgeList.filter(b => b.earned !== null).length} of {badgeList.length} earned
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {badgeList.map(badge => (
              <div
                key={badge.name}
                className={`relative rounded-xl border p-3 transition-all ${
                  badge.earned
                    ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-700/30'
                    : 'bg-muted/30 border-border/50 opacity-60'
                }`}
              >
                {!badge.earned && (
                  <Lock size={10} className="absolute top-2 right-2 text-muted-foreground" />
                )}
                <div className="text-2xl mb-1.5">{badge.emoji}</div>
                <p className={`text-xs font-bold leading-tight ${badge.earned ? 'text-amber-700 dark:text-amber-400' : 'text-muted-foreground'}`}>
                  {badge.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{badge.description}</p>
                {badge.earned?.earnedAt && (
                  <p className="text-xs text-amber-600/70 mt-1 font-medium">
                    {new Date(badge.earned.earnedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Error / Save */}
      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/8 border border-destructive/20 rounded-xl px-4 py-3">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving} className="gap-2 shadow-md shadow-primary/20">
          {saved ? <><Check size={16} /> Saved!</> : saving ? 'Saving…' : <><Save size={16} /> Save Changes</>}
        </Button>
      </div>
    </div>
  );
}
