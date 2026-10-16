"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { buttonVariants } from "@/components/ui/button";
import type { Dictionary, Locale } from "@/lib/i18n";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export function HomeHero({
  dict,
  locale,
}: {
  dict: Dictionary["home"];
  locale: Locale;
}) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex max-w-md flex-col items-center gap-6 text-center"
    >
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.06, rotate: 2 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className="flex size-16 items-center justify-center rounded-2xl border bg-background p-2 shadow-sm"
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
        variants={itemVariants}
        className="text-4xl font-extrabold tracking-tight"
      >
        {dict.heroTitle}
      </motion.h1>
      <motion.p
        variants={itemVariants}
        className="text-muted-foreground"
      >
        {dict.heroDesc}
      </motion.p>
      <motion.div
        variants={itemVariants}
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
