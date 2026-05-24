"use client";

import { motion } from "framer-motion";
import { Search, FileText, TrendingUp, Shield, Bell, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fadeInUp, stagger } from "./animations";

const FEATURES = [
  {
    icon: Search,
    title: "AI-Powered Discovery",
    desc: "Semantic search across 10,000+ databases surfaces grants your competitors miss.",
    accent: "#6C47FF",
    label: "Core",
  },
  {
    icon: FileText,
    title: "Smart Application Writing",
    desc: "Generate compelling narratives tailored to each funder's language and priorities.",
    accent: "#00D4AA",
    label: "GPT-4o",
  },
  {
    icon: TrendingUp,
    title: "Success Analytics",
    desc: "Track win rates, benchmark against peers, and optimize your grant portfolio.",
    accent: "#9B73FF",
    label: "Insights",
  },
  {
    icon: Shield,
    title: "Compliance Guard",
    desc: "Auto-flag eligibility mismatches, deadlines, and reporting requirements.",
    accent: "#22c55e",
    label: "Safety",
  },
  {
    icon: Bell,
    title: "Deadline Alerts",
    desc: "Never miss a grant cycle. Intelligent reminders keep your pipeline moving.",
    accent: "#f59e0b",
    label: "Alerts",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    desc: "Real-time co-editing, comments, and role-based access for entire grant teams.",
    accent: "#ec4899",
    label: "Teams",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative py-28 px-4 sm:px-6 lg:px-8 overflow-hidden"
      aria-labelledby="features-heading"
    >
      {/* Background accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 40% at 50% 50%, rgba(108,71,255,0.06) 0%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.div variants={fadeInUp} className="flex justify-center mb-4">
            <Badge variant="primary" dot>
              Everything you need
            </Badge>
          </motion.div>
          <motion.h2
            id="features-heading"
            variants={fadeInUp}
            className="font-display font-bold tracking-tight text-balance"
            style={{ fontSize: "clamp(2rem,5vw,3.5rem)" }}
          >
            Grant success, <span className="text-gradient-accent">automated</span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mt-4 max-w-xl mx-auto text-lg"
            style={{ color: "var(--color-muted)" }}
          >
            From discovery to submission, GrantAI handles every step of the grant lifecycle.
          </motion.p>
        </motion.div>

        {/* 2×3 Grid */}
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                variants={fadeInUp}
                custom={i}
                whileHover={{ y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
                className="group relative rounded-2xl overflow-hidden"
                style={{
                  background: "rgba(15,15,26,0.6)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(240,240,255,0.08)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
              >
                {/* Colored top accent border */}
                <div
                  className="absolute inset-x-0 top-0 h-0.5 transition-all duration-500 group-hover:opacity-100"
                  style={{
                    background: `linear-gradient(90deg, ${f.accent}, ${f.accent}80)`,
                    opacity: 0.6,
                  }}
                  aria-hidden="true"
                />

                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse 60% 40% at 50% 0%, ${f.accent}10 0%, transparent 70%)`,
                    boxShadow: `inset 0 0 0 1px ${f.accent}20`,
                  }}
                  aria-hidden="true"
                />

                <div className="relative z-10 p-6">
                  {/* Icon */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: `${f.accent}15`,
                      border: `1px solid ${f.accent}25`,
                    }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: f.accent }}
                      aria-hidden="true"
                    />
                  </div>

                  {/* Label chip */}
                  <span
                    className="inline-block text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full mb-3"
                    style={{
                      background: `${f.accent}15`,
                      color: f.accent,
                      border: `1px solid ${f.accent}25`,
                    }}
                  >
                    {f.label}
                  </span>

                  <h3
                    className="font-display font-semibold text-base mb-2"
                    style={{ color: "var(--color-text)" }}
                  >
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
                    {f.desc}
                  </p>
                </div>

                {/* Bottom glow shadow on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                  style={{
                    boxShadow: `0 0 0 1px ${f.accent}20, 0 16px 48px ${f.accent}15`,
                  }}
                  aria-hidden="true"
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
