"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fadeInUp, stagger } from "./animations";

const TESTIMONIALS = [
  {
    quote:
      "GrantAI found us three federal grants we had never heard of. We won two of them within 60 days. This tool paid for itself in week one.",
    name: "Dr. Amara Osei",
    role: "Executive Director",
    org: "Bright Futures Foundation",
    avatar: "AO",
    stars: 5,
  },
  {
    quote:
      "The AI-written narratives are genuinely better than what our team produced manually. Reviewers keep commenting on how compelling our applications are.",
    name: "Marcus Chen",
    role: "Research Director",
    org: "Pacific Innovation Lab",
    avatar: "MC",
    stars: 5,
  },
  {
    quote:
      "We went from applying to 4 grants a quarter to 22. Our success rate improved from 18% to 67%. The ROI is extraordinary.",
    name: "Sofia Delacroix",
    role: "Grants Manager",
    org: "EcoAction Europe",
    avatar: "SD",
    stars: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="relative py-28 px-4 sm:px-6 lg:px-8 overflow-hidden"
      aria-labelledby="testimonials-heading"
    >
      {/* BG pattern */}
      <div className="absolute inset-0 bg-dots opacity-30 pointer-events-none" aria-hidden="true" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-16"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.div variants={fadeInUp} className="flex justify-center mb-4">
            <Badge variant="accent" dot>
              Social proof
            </Badge>
          </motion.div>
          <motion.h2
            id="testimonials-heading"
            variants={fadeInUp}
            className="font-display font-bold tracking-tight"
            style={{ fontSize: "clamp(2rem,5vw,3.5rem)" }}
          >
            Loved by grant teams{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #6C47FF, #00D4AA)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              worldwide
            </span>
          </motion.h2>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-6"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              variants={fadeInUp}
              custom={i}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative rounded-2xl p-7 flex flex-col gap-5"
              style={{
                background: "rgba(15,15,26,0.65)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(240,240,255,0.08)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            >
              {/* Quote icon */}
              <Quote
                className="w-8 h-8 opacity-30"
                style={{ color: "#6C47FF" }}
                aria-hidden="true"
              />

              {/* Stars */}
              <div className="flex gap-1" aria-label={`${t.stars} stars`}>
                {Array.from({ length: t.stars }).map((_, si) => (
                  <Star
                    key={si}
                    className="w-4 h-4"
                    fill="#f59e0b"
                    style={{ color: "#f59e0b" }}
                    aria-hidden="true"
                  />
                ))}
              </div>

              <blockquote className="flex-1 text-sm leading-relaxed" style={{ color: "var(--color-subtle)" }}>
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: "rgba(240,240,255,0.07)" }}>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #6C47FF, #00D4AA)",
                    color: "#fff",
                  }}
                  aria-hidden="true"
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                    {t.name}
                  </div>
                  <div className="text-xs" style={{ color: "var(--color-muted)" }}>
                    {t.role} · {t.org}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
