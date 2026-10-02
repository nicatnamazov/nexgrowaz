"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

// Saytlab exact easing: cubic-bezier(0.44, 0, 0.56, 1)
const EASE_REVEAL = [0.44, 0, 0.56, 1] as const;

interface AnimateInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
}

export default function AnimateIn({
  children,
  delay = 0,
  className = "",
  direction = "up",
}: AnimateInProps) {
  const prefersReduced = useReducedMotion();

  const dirs = {
    up:    { y: prefersReduced ? 0 : 44, x: 0 },
    down:  { y: prefersReduced ? 0 : -44, x: 0 },
    left:  { x: prefersReduced ? 0 : 52, y: 0 },
    right: { x: prefersReduced ? 0 : -52, y: 0 },
    none:  { x: 0, y: 0 },
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        ...dirs[direction],
        filter: prefersReduced ? "none" : "blur(4px)",
        scale: prefersReduced ? 1 : 0.98,
      }}
      whileInView={{ opacity: 1, x: 0, y: 0, filter: "blur(0px)", scale: 1 }}
      viewport={{ once: true, margin: "-4%" }}
      transition={{
        duration: prefersReduced ? 0 : 0.8,
        delay: prefersReduced ? 0 : delay,
        ease: EASE_REVEAL,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
