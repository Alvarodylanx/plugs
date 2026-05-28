'use client';
import { motion } from 'framer-motion';

export type MascotMood = 'idle' | 'happy' | 'excited' | 'thinking' | 'celebrating' | 'sleeping' | 'encouraging' | 'sad';

interface Props {
  mood?: MascotMood;
  size?: number;
  className?: string;
  message?: string;
}

const T  = '#0d9d80';
const TD = '#0a7a65';
const TL = '#5ecfb8';

function Eyes({ mood }: { mood: MascotMood }) {
  if (mood === 'sleeping') {
    return (
      <g>
        <path d="M 28,52 Q 41,43 54,52" stroke={TD} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M 66,52 Q 79,43 92,52" stroke={TD} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      </g>
    );
  }
  if (mood === 'celebrating') {
    return (
      <g>
        <circle cx="41" cy="52" r="13" fill="white" />
        <circle cx="79" cy="52" r="13" fill="white" />
        <path d="M 29,55 Q 41,44 53,55" stroke={TD} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M 67,55 Q 79,44 91,55" stroke={TD} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      </g>
    );
  }
  if (mood === 'sad') {
    return (
      <g>
        <circle cx="41" cy="52" r="13" fill="white" />
        <circle cx="41" cy="52" r="9" fill="#065f46" />
        <circle cx="40" cy="55" r="5.5" fill="#0d1117" />
        <circle cx="42" cy="53" r="2" fill="white" opacity="0.7" />
        {/* sad eyebrows — inner corners raised */}
        <path d="M 30,40 Q 38,35 50,39" stroke={TD} strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="79" cy="52" r="13" fill="white" />
        <circle cx="79" cy="52" r="9" fill="#065f46" />
        <circle cx="78" cy="55" r="5.5" fill="#0d1117" />
        <circle cx="80" cy="53" r="2" fill="white" opacity="0.7" />
        <path d="M 70,39 Q 82,35 90,40" stroke={TD} strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* tears */}
        <motion.ellipse cx="34" cy="66" rx="2.5" ry="3.5" fill="#93c5fd"
          animate={{ y: [0, 14], opacity: [0.9, 0] } as any}
          transition={{ duration: 1.6, repeat: Infinity, delay: 0.3 }}
        />
        <motion.ellipse cx="72" cy="66" rx="2.5" ry="3.5" fill="#93c5fd"
          animate={{ y: [0, 14], opacity: [0.9, 0] } as any}
          transition={{ duration: 1.6, repeat: Infinity, delay: 1.1 }}
        />
      </g>
    );
  }

  const lp = mood === 'thinking' ? { cx: 39, cy: 49 } : { cx: 42, cy: 52 };
  const rp = mood === 'thinking' ? { cx: 77, cy: 49 } : { cx: 80, cy: 52 };
  const ir = mood === 'excited' ? 10 : 9;
  const pr = mood === 'excited' ? 6.5 : 5.5;

  return (
    <g>
      <circle cx="41" cy="52" r="13" fill="white" />
      <circle cx="41" cy="52" r={ir} fill="#065f46" />
      <circle cx={lp.cx} cy={lp.cy} r={pr} fill="#0d1117" />
      <circle cx={lp.cx + 2} cy={lp.cy - 2} r="2.5" fill="white" opacity="0.9" />
      <circle cx="79" cy="52" r="13" fill="white" />
      <circle cx="79" cy="52" r={ir} fill="#065f46" />
      <circle cx={rp.cx} cy={rp.cy} r={pr} fill="#0d1117" />
      <circle cx={rp.cx + 2} cy={rp.cy - 2} r="2.5" fill="white" opacity="0.9" />
    </g>
  );
}

function Mouth({ mood }: { mood: MascotMood }) {
  if (mood === 'excited') return <ellipse cx="60" cy="80" rx="7" ry="5.5" fill={TD} />;
  if (mood === 'celebrating') {
    return (
      <g>
        <path d="M 46,76 Q 60,91 74,76" stroke={TD} strokeWidth="3" fill="none" strokeLinecap="round" />
        <clipPath id="smileClip"><path d="M 46,76 Q 60,91 74,76 L 74,84 Q 60,97 46,84 Z" /></clipPath>
        <ellipse cx="60" cy="84" rx="13" ry="8" fill="white" clipPath="url(#smileClip)" />
      </g>
    );
  }
  if (mood === 'sad')
    return <path d="M 49,84 Q 60,73 71,84" stroke={TD} strokeWidth="2.5" fill="none" strokeLinecap="round" />;
  if (mood === 'happy' || mood === 'encouraging')
    return <path d="M 49,76 Q 60,87 71,76" stroke={TD} strokeWidth="2.5" fill="none" strokeLinecap="round" />;
  if (mood === 'thinking')
    return <path d="M 53,82 Q 58,79 64,82" stroke={TD} strokeWidth="2.5" fill="none" strokeLinecap="round" />;
  if (mood === 'sleeping')
    return <path d="M 52,80 L 68,80" stroke={TD} strokeWidth="2.5" strokeLinecap="round" />;
  return <path d="M 52,78 Q 60,83 68,78" stroke={TD} strokeWidth="2.5" fill="none" strokeLinecap="round" />;
}

const ANIMS: Record<MascotMood, { animate: object; transition: object }> = {
  idle:        { animate: { y: [0, -6, 0] },       transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } },
  happy:       { animate: { y: [0, -10, 0] },      transition: { duration: 0.9, repeat: Infinity, ease: 'easeOut' } },
  excited:     { animate: { x: [-4, 4, -4, 4, 0] }, transition: { duration: 0.45, repeat: Infinity, repeatDelay: 1 } },
  thinking:    { animate: { rotate: [-5, 5, -5] }, transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } },
  celebrating: { animate: { y: [0, -18, 0] },      transition: { duration: 0.4, repeat: Infinity, repeatDelay: 0.15, ease: 'easeOut' } },
  sleeping:    { animate: { y: [0, -2, 0] },       transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } },
  encouraging: { animate: { y: [0, -8, 0] },       transition: { duration: 1.1, repeat: Infinity, ease: 'easeOut' } },
  sad:         { animate: { y: [0, -3, 0] },       transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } },
};

export function Mascot({ mood = 'idle', size = 120, className = '', message }: Props) {
  const { animate, transition } = ANIMS[mood];
  const celebrating = mood === 'celebrating';
  const blushOpacity = (mood === 'happy' || celebrating) ? 0.7 : mood === 'sad' ? 0.15 : 0.45;

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`} style={{ width: size }}>
      {message && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white border border-border/60 rounded-2xl px-3 py-2 text-xs text-center font-medium text-secondary shadow-md max-w-[150px] relative leading-snug"
        >
          {message}
          <span className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 block w-0 h-0
            border-l-[7px] border-r-[7px] border-t-[7px]
            border-l-transparent border-r-transparent border-t-white" />
        </motion.div>
      )}

      <motion.div animate={animate as any} transition={transition as any}>
        <svg viewBox="0 0 120 160" width={size} height={Math.round(size * 1.33)} xmlns="http://www.w3.org/2000/svg">
          {/* Shadow */}
          <ellipse cx="60" cy="154" rx="28" ry="7" fill="rgba(0,0,0,0.09)" />

          {/* Ear tufts */}
          <polygon points="20,14 32,36 44,20" fill={TD} />
          <polygon points="76,20 88,36 100,14" fill={TD} />

          {/* Body */}
          <ellipse cx="60" cy="114" rx="34" ry="40" fill={T} />

          {/* Head */}
          <circle cx="60" cy="62" r="42" fill={T} />

          {/* Belly highlight */}
          <ellipse cx="60" cy="80" rx="25" ry="22" fill={TL} opacity="0.4" />

          <Eyes mood={mood} />

          {/* Blush */}
          <ellipse cx="21" cy="66" rx="9" ry="5.5" fill="#fda4af" opacity={blushOpacity} />
          <ellipse cx="99" cy="66" rx="9" ry="5.5" fill="#fda4af" opacity={blushOpacity} />

          {/* Beak */}
          <polygon points="60,68 53,78 67,78" fill="#f97316" />

          <Mouth mood={mood} />

          {/* Wings */}
          <ellipse
            cx="28" cy={celebrating ? 102 : 112}
            rx="11" ry="17" fill={TD}
            transform={celebrating ? 'rotate(-55, 28, 102)' : 'rotate(-12, 28, 112)'}
          />
          <ellipse
            cx="92" cy={celebrating ? 102 : 112}
            rx="11" ry="17" fill={TD}
            transform={celebrating ? 'rotate(55, 92, 102)' : 'rotate(12, 92, 112)'}
          />

          {/* Feet */}
          <ellipse cx="46" cy="149" rx="11" ry="6.5" fill={TD} />
          <ellipse cx="74" cy="149" rx="11" ry="6.5" fill={TD} />

          {/* Sleeping Zs */}
          {mood === 'sleeping' && (
            <>
              <motion.text x="93" y="42" fontSize="11" fill={T} fontWeight="bold"
                animate={{ opacity: [0, 1, 0], y: [42, 30] } as any}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0 }}
              >Z</motion.text>
              <motion.text x="100" y="28" fontSize="8" fill={T} fontWeight="bold"
                animate={{ opacity: [0, 1, 0], y: [28, 16] } as any}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.8 }}
              >z</motion.text>
            </>
          )}

          {/* Celebrating sparkles */}
          {celebrating && (
            <>
              <motion.circle cx="15" cy="30" r="3.5" fill="#fde047"
                animate={{ opacity: [0, 1, 0], r: [1, 3.5, 1] } as any}
                transition={{ duration: 0.7, repeat: Infinity, delay: 0 }} />
              <motion.circle cx="105" cy="25" r="3" fill="#f97316"
                animate={{ opacity: [0, 1, 0], r: [1, 3, 1] } as any}
                transition={{ duration: 0.7, repeat: Infinity, delay: 0.35 }} />
              <motion.circle cx="110" cy="50" r="2.5" fill="#a78bfa"
                animate={{ opacity: [0, 1, 0], r: [0.5, 2.5, 0.5] } as any}
                transition={{ duration: 0.7, repeat: Infinity, delay: 0.15 }} />
              <motion.circle cx="10" cy="55" r="2.5" fill="#34d399"
                animate={{ opacity: [0, 1, 0], r: [0.5, 2.5, 0.5] } as any}
                transition={{ duration: 0.7, repeat: Infinity, delay: 0.5 }} />
            </>
          )}
        </svg>
      </motion.div>
    </div>
  );
}
