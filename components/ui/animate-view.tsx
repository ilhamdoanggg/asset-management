"use client";

import * as React from "react";
import { motion } from "motion/react";

/**
 * Shared reveal transition for content swapping in (table pagination,
 * search results, async panels). Remount via `key` to replay the entrance.
 * Reduced motion is handled globally by `MotionConfig reducedMotion="user"`.
 */
export function AnimateView({
  children,
  className,
  delay = 0,
  y = 8,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** vertical travel in px; 0 for fade-only */
  y?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: [0.16, 1, 0.3, 1] as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
