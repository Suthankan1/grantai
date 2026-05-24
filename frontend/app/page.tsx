"use client";

import { motion } from "framer-motion";
import { ArrowRight, Search, Sparkles, TrendingUp, Shield, Zap, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/* ─── Animation Variants ────────────────────────────────────────── */

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.55,
      ease: "easeOut" as const,
    },
  }),
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

/* ─── Stats Data ─────────────────────────────────────────────────── */

const STATS = [
  { value: "$4.2B+", label: "Grants indexed" },
  { value: "12,000+", label: "Funding sources" },
  { value: "94%", label: "Match accuracy" },
  { value: "3×", label: "Faster applications" },
];

/* ─── Feature Cards ──────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: Search,
    title: "AI-Powered Discovery",
    description: "Semantic search across 12,000+ databases to surface grants your competitors miss.",
    badge: "Core",
    badgeVariant: "primary" as const,
    gradient: "from-[#6C47FF]/15 to-transparent",
  },
  {
    icon: Sparkles,
    title: "Smart Application Writing",
    description: "Generate compelling narratives tailored to each funder's language and priorities.",
    badge: "GPT-4",
    badgeVariant: "accent" as const,
    gradient: "from-[#00D4AA]/15 to-transparent",
  },
  {
    icon: TrendingUp,
    title: "Success Analytics",
    description: "Track win rates, benchmark against peers, and optimize your grant portfolio.",
    badge: "Insights",
    badgeVariant: "default" as const,
    gradient: "from-[#6C47FF]/10 to-transparent",
  },
  {
    icon: Shield,
    title: "Compliance Guard",
    description: "Automatically flag eligibility mismatches, deadlines, and reporting requirements.",
    badge: "Safety",
    badgeVariant: "success" as const,
    gradient: "from-[#22c55e]/10 to-transparent",
  },
];

/* ─── Page Component ─────────────────────────────────────────────── */

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Background elements */}
      <div className="fixed inset-0 bg-grid pointer-events-none" aria-hidden="true" />
      <div className="fixed inset-0 hero-glow pointer-events-none" aria-hidden="true" />

      {/* Floating orbs */}
      <div
        className="fixed top-1/4 -left-32 w-96 h-96 rounded-full opacity-[0.07] blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #6C47FF, transparent)" }}
        aria-hidden="true"
      />
      <div
        className="fixed top-3/4 -right-32 w-96 h-96 rounded-full opacity-[0.05] blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #00D4AA, transparent)" }}
        aria-hidden="true"
      />

      {/* ─── Hero ────────────────────────────────────────────────── */}
      <section
        className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8"
        aria-labelledby="hero-heading"
      >
        <div className="max-w-5xl mx-auto text-center">
          {/* Top badge */}
          <motion.div
            variants={fadeInUp}
            custom={0}
            initial="hidden"
            animate="visible"
            className="flex justify-center mb-8"
          >
            <Badge variant="primary" className="gap-1.5 py-1.5 px-4 text-xs">
              <Zap className="h-3 w-3" aria-hidden="true" />
              Powered by advanced AI · 12,000+ grant sources
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1
            id="hero-heading"
            variants={fadeInUp}
            custom={1}
            initial="hidden"
            animate="visible"
            className="font-display text-[clamp(2.8rem,7vw,5.5rem)] font-bold leading-[1.08] tracking-tight text-balance mb-6"
          >
            Win more grants with{" "}
            <span className="text-gradient-primary">AI precision</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeInUp}
            custom={2}
            initial="hidden"
            animate="visible"
            className="text-[clamp(1rem,2.5vw,1.25rem)] text-[var(--color-muted)] max-w-2xl mx-auto mb-10 text-pretty leading-relaxed"
          >
            GrantAI discovers perfectly matched funding opportunities, writes compelling applications, 
            and tracks your pipeline — so your team focuses on mission, not paperwork.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={fadeInUp}
            custom={3}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap items-center justify-center gap-4 mb-16"
          >
            <Button
              id="hero-cta-primary"
              variant="glow"
              size="lg"
              asChild
              className="group"
            >
              <Link href="/sign-up">
                Start for free
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </Button>
            <Button
              id="hero-cta-secondary"
              variant="glass"
              size="lg"
              asChild
            >
              <Link href="#demo">Watch demo</Link>
            </Button>
          </motion.div>

          {/* Trust signals */}
          <motion.div
            variants={fadeInUp}
            custom={4}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--color-muted)]"
          >
            {["No credit card required", "Free 14-day trial", "Cancel anytime"].map(
              (text) => (
                <span key={text} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-accent)]" aria-hidden="true" />
                  {text}
                </span>
              )
            )}
          </motion.div>
        </div>
      </section>

      {/* ─── Stats ───────────────────────────────────────────────── */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8" aria-label="Platform statistics">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {STATS.map((stat, i) => (
              <motion.div key={stat.label} variants={fadeInUp} custom={i}>
                <Card variant="glass" className="text-center py-6 px-4 hover:border-[var(--border-glow)] transition-all duration-300">
                  <div
                    className="font-display text-3xl font-bold mb-1"
                    style={{
                      background: "linear-gradient(135deg, #6C47FF, #00D4AA)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-sm text-[var(--color-muted)]">{stat.label}</div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Features ────────────────────────────────────────────── */}
      <section
        className="relative py-24 px-4 sm:px-6 lg:px-8"
        aria-labelledby="features-heading"
        id="features"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <motion.div variants={fadeInUp} className="flex justify-center mb-4">
              <Badge variant="accent" dot>Everything you need</Badge>
            </motion.div>
            <motion.h2
              id="features-heading"
              variants={fadeInUp}
              className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold tracking-tight mb-4 text-balance"
            >
              Grant success,{" "}
              <span className="text-gradient-accent">automated</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-[var(--color-muted)] text-lg max-w-xl mx-auto"
            >
              From discovery to submission, GrantAI handles every step of the grant lifecycle.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-5"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div key={feature.title} variants={fadeInUp} custom={i}>
                  <Card
                    variant="interactive"
                    padding="none"
                    className="group overflow-hidden"
                  >
                    {/* Gradient overlay on hover */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                      aria-hidden="true"
                    />
                    <CardContent className="p-6 relative">
                      <div className="flex items-start gap-4">
                        <div className="shrink-0 h-10 w-10 rounded-xl bg-[rgba(108,71,255,0.15)] border border-[rgba(108,71,255,0.2)] flex items-center justify-center group-hover:shadow-glow-sm transition-shadow duration-300">
                          <Icon className="h-5 w-5 text-[var(--color-primary)]" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-display font-semibold text-[var(--color-text)]">
                              {feature.title}
                            </h3>
                            <Badge variant={feature.badgeVariant} size="sm">
                              {feature.badge}
                            </Badge>
                          </div>
                          <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA Section ─────────────────────────────────────────── */}
      <section
        className="relative py-24 px-4 sm:px-6 lg:px-8"
        aria-labelledby="cta-heading"
      >
        <div className="max-w-3xl mx-auto">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <Card variant="glass-strong" className="text-center p-10 relative overflow-hidden">
              {/* Inner glow */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 60% 40% at 50% 100%, rgba(108,71,255,0.4) 0%, transparent 100%)",
                }}
                aria-hidden="true"
              />

              <Badge variant="primary" className="mb-6">
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                Start free today
              </Badge>

              <h2
                id="cta-heading"
                className="font-display text-[clamp(1.8rem,4vw,3rem)] font-bold tracking-tight mb-4"
              >
                Ready to win more grants?
              </h2>
              <p className="text-[var(--color-muted)] text-lg mb-8 max-w-md mx-auto">
                Join 2,400+ nonprofits and researchers already using GrantAI.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button id="cta-signup" variant="glow" size="xl" asChild className="group">
                  <Link href="/sign-up">
                    Get started free
                    <ArrowRight
                      className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                </Button>
                <Button id="cta-demo" variant="outline" size="xl" asChild>
                  <Link href="/demo">Request demo</Link>
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 px-4 border-t border-[var(--border-default)] text-center" role="contentinfo">
        <p className="text-sm text-[var(--color-muted)]">
          © {new Date().getFullYear()} GrantAI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
