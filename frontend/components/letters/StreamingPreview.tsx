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
  // Group tokens into chunks of 15 tokens to prevent DOM node explosion and expensive Framer Motion rendering
  const tokenGroups = React.useMemo(() => {
    const groups: { id: string; text: string }[] = [];
    const chunkSize = 15;
    for (let i = 0; i < streamTokens.length; i += chunkSize) {
      const chunk = streamTokens.slice(i, i + chunkSize);
      groups.push({
        id: chunk[0]?.id || `group-${i}`,
        text: chunk.map(item => item.token).join(""),
      });
    }
    return groups;
  }, [streamTokens]);

  return (
    <div className="relative h-full overflow-y-auto rounded-2xl border border-[var(--border-default)] bg-[rgba(12,12,22,0.75)] p-5 leading-8">
      <AnimatePresence>
        <motion.div
          key="stream"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="whitespace-pre-wrap text-[15px] text-[var(--color-text)]"
        >
          {tokenGroups.map((group) => (
            <motion.span
              key={group.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {group.text}
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
