"use client";

import * as React from "react";
import { animate, useReducedMotion } from "motion/react";
import { formatAssetValue } from "@/lib/format";

/** Animated portfolio valuation; jumps to final value when reduced-motion is set. */
export function CountUp({ value }: { value: number }) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = React.useState(reduce ? value : 0);

  React.useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [value, reduce]);

  return <>{formatAssetValue(display)}</>;
}
