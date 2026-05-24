"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { FileText, Globe, TrendingUp, Clock } from "lucide-react";
import { fadeInUp, stagger } from "./animations";

/* ─── useCountUp Hook ────────────────────────────────────────────────── */

function useCountUp(end: number, duration = 2.2, decimals = 0) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(parseFloat((eased * end).toFixed(decimals)));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, end, duration, decimals]);

  return { count, ref };
}

/* ─── Stats Data ─────────────────────────────────────────────────────── */

const STATS = [
  {
    prefix: "",
    value: 10000,
    suffix: "+",
    label: "Grants Indexed",
    icon: FileText,
    decimals: 0,
    display: (n: number) => n.toLocaleString(),
  },
  {
    prefix: "",
    value: 180,
    suffix: "+",
    label: "Countries",
    icon: Globe,
    decimals: 0,
    display: (n: number) => n.toLocaleString(),
  },
  {
    prefix: "",
    value: 94,
    suffix: "%",
    label: "Match Accuracy",
    icon: TrendingUp,
    decimals: 0,
    display: (n: number) => n.toString(),
  },
  {
    prefix: "< ",
    value: 10,
    suffix: "s",
    label: "Generation Time",
    icon: Clock,
    decimals: 0,
    display: (n: number) => n.toString(),
  },
];

/* ─── Stat Counter Component ─────────────────────────────────────────── */

function StatCounter({ stat }: { stat: (typeof STATS)[0] }) {
  const { count, ref } = useCountUp(stat.value, 2.2, stat.decimals);
  const Icon = stat.icon;

  return (
    <div ref={ref} className="text-center">
      <div className="flex items-center justify-center gap-2 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(108,71,255,0.12)", border: "1px solid rgba(108,71,255,0.2)" }}
        >
          <Icon className="w-5 h-5" style={{ color: "#6C47FF" }} aria-hidden="true" />
        </div>
      </div>
      <div
        className="font-display text-[clamp(2.2rem,4vw,3.5rem)] font-bold leading-none mb-2"
        style={{
          background: "linear-gradient(135deg, #6C47FF, #9B73FF 50%, #00D4AA)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {stat.prefix}{stat.display(count)}{stat.suffix}
      </div>
      <div className="text-sm font-medium" style={{ color: "var(--color-muted)" }}>
        {stat.label}
      </div>
    </div>
  );
}

export function StatsSection() {
  return (
    <section
      id="stats"
      className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
      aria-label="Platform statistics"
    >
      {/* Divider line top */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(108,71,255,0.3) 50%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-5xl mx-auto">
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {STATS.map((stat) => (
            <motion.div
              key={stat.label}
              variants={fadeInUp}
              className="relative"
            >
              <StatCounter stat={stat} />
            </motion.div>
          ))}
        </motion.div>

        {/* Stats divider labels */}
        <motion.p
          className="text-center mt-10 text-xs tracking-wide"
          style={{ color: "var(--color-muted)" }}
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          Trusted by 2,400+ nonprofits, research institutions, and government agencies worldwide
        </motion.p>
      </div>

      {/* Divider line bottom */}
      <div
        className="absolute inset-x-0 bottom-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(108,71,255,0.3) 50%, transparent 100%)",
        }}
        aria-hidden="true"
      />
    </section>
  );
}
