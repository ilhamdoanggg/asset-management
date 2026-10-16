"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

/** Enter-only fade between dashboard routes (no exit — PPR/streaming safe). */
export function RouteFade({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as const }}
    >
      {children}
    </motion.div>
  );
}
