'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Play, X, ExternalLink, Youtube, Loader2, BookOpen } from 'lucide-react';
import { videos as videosApi } from '@/lib/api';
import type { VideoResult } from '@/types';

const SUGGESTED = [
  'Photosynthesis explained',
  'Newton\'s Laws of Motion',
  'Cell division mitosis',
  'Quadratic equations',
  'French Revolution',
  'Ohm\'s Law circuits',
  'DNA replication',
  'Climate change geography',
];

function VideoCard({
  video,
  onPlay,
  playing,
}: {
  video: VideoResult;
  onPlay: (v: VideoResult) => void;
  playing: boolean;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group bg-card rounded-2xl border overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 ${
        playing ? 'border-primary ring-2 ring-primary/20' : 'border-border/50'
      }`}
      onClick={() => onPlay(video)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Youtube size={32} className="text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${playing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <div className="w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center">
            <Play size={18} className="text-primary ml-0.5" fill="currentColor" />
          </div>
        </div>
        {playing && (
          <div className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
            Now Playing
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-semibold text-secondary leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {video.title}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{video.channel}</p>
      </div>
    </motion.div>
  );
}

function PlayerPanel({ video, onClose }: { video: VideoResult; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-card rounded-2xl border border-primary/30 overflow-hidden shadow-2xl shadow-primary/15"
    >
      {/* Player header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
          <p className="text-sm font-semibold text-secondary truncate">{video.title}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-3">
          <a
            href={`https://www.youtube.com/watch?v=${video.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Open in YouTube"
          >
            <ExternalLink size={14} />
          </a>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Iframe */}
      <div className="aspect-video w-full">
        <iframe
          src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0&modestbranding=1`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>

      {/* Channel + description */}
      <div className="px-4 py-3 border-t border-border/50">
        <p className="text-xs font-semibold text-primary">{video.channel}</p>
        {video.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
            {video.description}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function VideosPage() {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState<VideoResult[]>([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);
  const [playing, setPlaying]   = useState<VideoResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function doSearch(q: string) {
    if (!q.trim()) return;
    setLoading(true);
    setPlaying(null);
    setSearched(true);
    try {
      const res = await videosApi.search(q.trim()) as VideoResult[];
      setResults(res);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    doSearch(query);
  }

  return (
    <div className="animate-enter space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="font-heading font-bold text-2xl text-secondary flex items-center gap-2">
          <Youtube size={22} className="text-red-500" /> Video Library
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Search and watch educational videos — all without leaving Plug.
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={'Search for a topic, e.g. "Photosynthesis explained"'}
              className="input-field pl-10 py-3 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="btn-primary px-5 py-3 flex items-center gap-2 shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            Search
          </button>
        </div>
      </form>

      {/* Suggestions (shown before first search) */}
      {!searched && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Try searching for...
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED.map(s => (
              <button
                key={s}
                onClick={() => { setQuery(s); doSearch(s); }}
                className="text-sm px-4 py-1.5 rounded-full border border-border hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all text-muted-foreground font-medium"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Player */}
      <AnimatePresence>
        {playing && (
          <PlayerPanel video={playing} onClose={() => setPlaying(null)} />
        )}
      </AnimatePresence>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-border/50 overflow-hidden animate-pulse">
              <div className="aspect-video bg-muted" />
              <div className="p-3 space-y-2">
                <div className="h-3.5 bg-muted rounded w-5/6" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && searched && results.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
        >
          {results.map(v => (
            <VideoCard
              key={v.videoId}
              video={v}
              onPlay={setPlaying}
              playing={playing?.videoId === v.videoId}
            />
          ))}
        </motion.div>
      )}

      {/* No results */}
      {!loading && searched && results.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Youtube size={28} className="text-muted-foreground/40" />
          </div>
          <p className="font-semibold text-secondary mb-1">No videos found</p>
          <p className="text-sm text-muted-foreground">
            Make sure your YouTube API key is configured, or try a different search.
          </p>
        </div>
      )}

      {/* Empty state (no key configured) info banner */}
      {!loading && !searched && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <BookOpen size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">YouTube API key needed</p>
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
              Add <code className="bg-amber-100 px-1 rounded">YOUTUBE_API_KEY=your_key</code> to{' '}
              <code className="bg-amber-100 px-1 rounded">apps/api/.env</code> to enable video search.
              Get a free key at Google Cloud Console → YouTube Data API v3.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
