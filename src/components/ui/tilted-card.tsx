"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function TiltedCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ rotateX: 4, rotateY: -5, y: -4 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      className={cn("transform-gpu [transform-style:preserve-3d]", className)}
    >
      {children}
    </motion.div>
  );
}
