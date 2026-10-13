"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { buttonVariants } from "@/components/ui/button";
import type { Dictionary, Locale } from "@/lib/i18n";

export function HomeHero({
  dict,
  locale,
}: {
  dict: Dictionary["home"];
  locale: Locale;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] as const }}
      className="text-center space-y-6 max-w-md flex flex-col items-center"
    >
      <motion.div
        whileHover={{ scale: 1.06, rotate: 2 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className="flex size-16 items-center justify-center rounded-2xl border bg-background p-2 shadow-sm cursor-pointer"
      >
        <Image
          src="/logo.png"
          alt="Logo"
          width={48}
          height={48}
          className="size-full object-contain"
          priority
        />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] as const }}
        className="text-4xl font-extrabold tracking-tight"
      >
        {dict.heroTitle}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
        className="text-muted-foreground"
      >
        {dict.heroDesc}
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
        className="flex justify-center gap-4"
      >
        <Link
          href={`/${locale}/login`}
          className={buttonVariants({ size: "lg" })}
        >
          {dict.actionLogin}
        </Link>
        <Link
          href={`/${locale}/register`}
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          {dict.actionRegister}
        </Link>
      </motion.div>
    </motion.div>
  );
}
