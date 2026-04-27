"use client";

import { motion } from "framer-motion";

export function TextReveal({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {text.split(" ").map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          className="inline-block pr-[0.22em]"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.025, duration: 0.35 }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}
