"use client";

import { useRef, useEffect } from "react";
import { useInView, animate } from "framer-motion";

export default function AnimatedNumber({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  
  useEffect(() => {
    if (!inView || !ref.current) return;
    const num = parseFloat(value.replace(/[^0-9.]/g, ""));
    const isFloat = value.includes(".");
    const suffix = value.replace(/[0-9.]/g, "");
    
    if (!isNaN(num)) {
      const controls = animate(0, num, {
        duration: 1.2,
        ease: "easeOut",
        onUpdate: (val) => {
          if (ref.current) {
            ref.current.textContent = (isFloat ? val.toFixed(1) : Math.floor(val)) + suffix;
          }
        }
      });
      return () => controls.stop();
    }
  }, [inView, value]);

  return <span ref={ref} className="text-3xl font-bold text-white">0{value.replace(/[0-9.]/g, "")}</span>;
}
