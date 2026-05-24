"use client";

import { motion } from "framer-motion";
import { Search, Bot, Sparkles, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fadeInUp, stagger } from "./animations";

const STEPS = [
  {
    num: "01",
    icon: Search,
    title: "Describe Your Mission",
    desc: "Tell GrantAI about your organization, goals, and funding needs. Our AI builds a rich profile in seconds.",
    color: "#6C47FF",
  },
  {
    num: "02",
    icon: Bot,
    title: "AI Finds Your Matches",
    desc: "Our semantic engine scans 10,000+ live grant databases and ranks opportunities by match score.",
    color: "#9B73FF",
  },
  {
    num: "03",
    icon: Sparkles,
    title: "Apply with One Click",
    desc: "Generate a tailored, compelling application in under 10 seconds — ready for review and submit.",
    color: "#00D4AA",
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative py-28 px-4 sm:px-6 lg:px-8"
      aria-labelledby="hiw-heading"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-20"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.div variants={fadeInUp} className="flex justify-center mb-4">
            <Badge variant="accent" dot>
              Simple process
            </Badge>
          </motion.div>
          <motion.h2
            id="hiw-heading"
            variants={fadeInUp}
            className="font-display font-bold tracking-tight text-balance"
            style={{ fontSize: "clamp(2rem,5vw,3.5rem)" }}
          >
            From idea to{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #00D4AA, #6C47FF)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              funded
            </span>{" "}
            in minutes
          </motion.h2>
        </motion.div>

        {/* Steps */}
        <div className="relative grid md:grid-cols-3 gap-6 lg:gap-8">
          {/* Connector lines (desktop) */}
          <div
            className="hidden md:block absolute top-[3.5rem] left-[33%] right-[33%] h-px"
            style={{ background: "linear-gradient(90deg, rgba(108,71,255,0.4), rgba(0,212,170,0.4))" }}
            aria-hidden="true"
          />

          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                className="relative flex flex-col items-center text-center group"
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.15 }}
              >
                {/* Giant step number behind card */}
                <div
                  className="absolute -top-6 left-1/2 -translate-x-1/2 font-display font-bold select-none pointer-events-none"
                  style={{
                    fontSize: "clamp(5rem,10vw,8rem)",
                    lineHeight: 1,
                    color: "transparent",
                    WebkitTextStroke: `1px rgba(${step.color === "#6C47FF" ? "108,71,255" : step.color === "#9B73FF" ? "155,115,255" : "0,212,170"},0.12)`,
                    zIndex: 0,
                  }}
                  aria-hidden="true"
                >
                  {step.num}
                </div>

                {/* Card */}
                <div
                  className="relative z-10 w-full rounded-2xl p-8 transition-all duration-300 group-hover:-translate-y-1"
                  style={{
                    background: "rgba(15,15,26,0.7)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(240,240,255,0.08)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
                  }}
                >
                  {/* Step indicator dot */}
                  <div className="flex items-center justify-center gap-3 mb-5">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                      style={{
                        background: `linear-gradient(135deg, ${step.color}22, ${step.color}0a)`,
                        border: `1px solid ${step.color}33`,
                        boxShadow: `0 0 20px ${step.color}18`,
                      }}
                    >
                      <Icon
                        className="w-6 h-6"
                        style={{ color: step.color }}
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  <h3
                    className="font-display font-semibold text-lg mb-3"
                    style={{ color: "var(--color-text)" }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
                    {step.desc}
                  </p>

                  {/* Step number small */}
                  <div
                    className="absolute top-4 right-4 text-xs font-mono font-bold tracking-widest"
                    style={{ color: step.color, opacity: 0.5 }}
                  >
                    {step.num}
                  </div>
                </div>

                {/* Mobile connector arrow */}
                {i < STEPS.length - 1 && (
                  <ChevronRight
                    className="md:hidden mt-4 rotate-90"
                    style={{ color: "rgba(108,71,255,0.4)" }}
                    aria-hidden="true"
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
