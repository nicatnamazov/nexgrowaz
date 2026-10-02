"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

// Saytlab exact easing: cubic-bezier(0.44, 0, 0.56, 1)
const EASE_REVEAL = [0.25, 0.1, 0.25, 1] as const; // Faster ease-out

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
    up:    { y: prefersReduced ? 0 : 20, x: 0 },
    down:  { y: prefersReduced ? 0 : -20, x: 0 },
    left:  { x: prefersReduced ? 0 : 20, y: 0 },
    right: { x: prefersReduced ? 0 : -20, y: 0 },
    none:  { x: 0, y: 0 },
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        ...dirs[direction],
        filter: prefersReduced ? "none" : "blur(2px)",
        scale: 1,
      }}
      whileInView={{ opacity: 1, x: 0, y: 0, filter: "blur(0px)", }}
      viewport={{ once: true, margin: "0px" }}
      transition={{
        duration: prefersReduced ? 0 : 0.3,
        delay: prefersReduced ? 0 : delay,
        ease: EASE_REVEAL,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
