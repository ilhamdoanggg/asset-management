"use client";

import { motion, useReducedMotion } from "motion/react";

export function NotFoundArt() {
  const reduce = useReducedMotion();
  const float = reduce
    ? {}
    : { animate: { y: [0, -8, 0] }, transition: { duration: 5, repeat: Infinity, ease: "easeInOut" as const } };
  const twinkle = (delay: number) =>
    reduce
      ? {}
      : {
          animate: { opacity: [0.25, 1, 0.25], scale: [0.85, 1.1, 0.85] },
          transition: { duration: 2.6, repeat: Infinity, delay, ease: "easeInOut" as const },
        };
  const spin = reduce
    ? {}
    : { animate: { rotate: 360 }, transition: { duration: 28, repeat: Infinity, ease: "linear" as const } };

  return (
    <motion.div {...float} className="relative mx-auto w-fit text-primary" role="img" aria-label="Ilustrasi halaman tidak ditemukan">
      <svg width="248" height="188" viewBox="0 0 248 188" fill="none" aria-hidden>
        {/* orbit ring */}
        <motion.g {...spin} style={{ originX: "124px", originY: "104px" }}>
          <ellipse cx="124" cy="104" rx="104" ry="64" stroke="currentColor" strokeOpacity="0.25" strokeDasharray="5 9" strokeWidth="2" />
        </motion.g>
        {/* shadow */}
        <ellipse cx="124" cy="168" rx="56" ry="9" fill="currentColor" opacity="0.12" />
        {/* open box */}
        <path d="M72 96 124 66l52 30v44l-52 30-52-30V96Z" fill="currentColor" opacity="0.14" />
        <path d="M72 96l52 30 52-30M124 96v74" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M72 96 124 66l52 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M72 96v44l52 30 52-30V96" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
        {/* magnifier */}
        <g>
          <circle cx="158" cy="66" r="24" fill="hsl(var(--card))" stroke="currentColor" strokeWidth="5" />
          <circle cx="166" cy="58" r="6" fill="currentColor" opacity="0.25" />
          <path d="M176 84l20 20" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
          <text x="158" y="78" textAnchor="middle" fontSize="26" fontWeight="800" fill="currentColor">?</text>
        </g>
        {/* sparkles */}
        <motion.g {...twinkle(0)}>
          <path d="M44 52l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5 2.5-6Z" fill="currentColor" />
        </motion.g>
        <motion.g {...twinkle(0.9)}>
          <circle cx="208" cy="44" r="5" fill="currentColor" />
        </motion.g>
        <motion.g {...twinkle(1.7)}>
          <path d="M212 128l2 4.8 4.8 2-4.8 2-2 4.8-2-4.8-4.8-2 4.8-2 2-4.8Z" fill="currentColor" opacity="0.7" />
        </motion.g>
        <motion.g {...twinkle(0.4)}>
          <circle cx="52" cy="132" r="4" fill="currentColor" opacity="0.6" />
        </motion.g>
      </svg>
      {/* glow */}
      <div className="absolute inset-6 -z-10 rounded-full bg-primary/15 blur-2xl" aria-hidden />
    </motion.div>
  );
}
