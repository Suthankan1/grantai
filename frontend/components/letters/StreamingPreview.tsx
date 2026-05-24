"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

interface StreamToken {
  id: string;
  token: string;
}

interface StreamingPreviewProps {
  streamTokens: StreamToken[];
}

export function StreamingPreview({ streamTokens }: StreamingPreviewProps) {
  return (
    <div className="relative h-full overflow-y-auto rounded-2xl border border-[var(--border-default)] bg-[rgba(12,12,22,0.75)] p-5 leading-8">
      <AnimatePresence>
        <motion.div
          key="stream"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="whitespace-pre-wrap text-[15px] text-[var(--color-text)]"
        >
          {streamTokens.map((item, index) => (
            <motion.span
              key={item.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.22,
                ease: "easeOut",
                delay: Math.min(index * 0.002, 0.25),
              }}
            >
              {item.token}
            </motion.span>
          ))}
          <motion.span
            className="inline-block h-5 w-[2px] translate-y-1 bg-[var(--color-accent)]"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
