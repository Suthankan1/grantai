"use client";

import { motion } from "framer-motion";
import { CountUp } from "./CountUp";

interface CircularProgressProps {
  percentage: number;
}

export function CircularProgress({ percentage }: CircularProgressProps) {
  const radius = 22;
  const strokeWidth = 4;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center h-14 w-14 shrink-0">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="28"
          cy="28"
          r={radius}
          stroke="rgba(240, 240, 255, 0.04)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <motion.circle
          cx="28"
          cy="28"
          r={radius}
          stroke="#10B981" // emerald-500
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-[10px] font-bold text-white">
        <CountUp value={percentage} suffix="%" />
      </div>
    </div>
  );
}
