"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { Package, Wrench, BarChart3 } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, x: -14 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function AuthBrandPanel({
  dict,
  appName,
}: {
  dict: Dictionary["auth"];
  appName: string;
}) {
  const features = [
    { icon: Package, title: dict.featInventoryTitle, desc: dict.featInventoryDesc },
    { icon: Wrench, title: dict.featMaintenanceTitle, desc: dict.featMaintenanceDesc },
    { icon: BarChart3, title: dict.featReportTitle, desc: dict.featReportDesc },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/70 p-8 text-primary-foreground lg:flex"
    >
      <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 size-80 rounded-full bg-black/10 blur-2xl" />

      <motion.div variants={item} className="relative flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-white/15 p-1.5 ring-1 ring-white/25">
          <Image
            src="/logo.png"
            alt={appName}
            width={28}
            height={28}
            className="size-full object-contain"
            priority
          />
        </div>
        <span className="text-base font-semibold tracking-tight">{appName}</span>
      </motion.div>

      <div className="relative flex flex-col gap-7">
        <motion.div variants={item} className="flex flex-col gap-2">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-balance xl:text-3xl">
            {dict.panelTitle}
          </h2>
          <p className="text-sm opacity-80">{dict.panelDesc}</p>
        </motion.div>

        <div className="flex flex-col gap-4">
          {features.map((f) => (
            <motion.div key={f.title} variants={item} className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
                <f.icon className="size-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-semibold">{f.title}</p>
                <p className="text-xs opacity-75">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.p variants={item} className="relative text-[11px] opacity-60">
        {dict.securityNote}
      </motion.p>
    </motion.div>
  );
}
