"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Play, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { containerVariants, slideUp } from "./animations";
import { ParticleCanvas } from "./ParticleCanvas";

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden"
      aria-labelledby="hero-heading"
      style={{ minHeight: "100svh" }}
    >
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          opacity: 0.035,
          mixBlendMode: "overlay",
        }}
        aria-hidden="true"
      />

      {/* Top glow blob */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% -15%, rgba(108,71,255,0.28) 0%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      {/* Side accent glows */}
      <div
        className="absolute -left-48 top-1/3 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(108,71,255,0.1) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute -right-48 bottom-1/3 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(0,212,170,0.08) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        aria-hidden="true"
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid pointer-events-none" aria-hidden="true" />

      {/* Particle canvas */}
      <ParticleCanvas />

      {/* Hero content */}
      <motion.div
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-32 pb-24"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={slideUp(0)} className="flex flex-col items-center gap-3 mb-8">
          <Badge variant="primary" className="gap-1.5 py-1.5 px-4 text-xs">
            <Zap className="h-3 w-3" aria-hidden="true" />
            Now with GPT-4o · 10,000+ live grant sources
          </Badge>
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs text-purple-300 hover:bg-purple-500/20 transition-all duration-300"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
            <strong>Hackathon Judges:</strong> Click here to launch Demo Mode instantly & bypass server cold starts!
          </Link>
        </motion.div>

        {/* Headline */}
        <motion.h1
          id="hero-heading"
          variants={slideUp(0.1)}
          className="font-display font-bold leading-[1.06] tracking-tight text-balance mb-6"
          style={{ fontSize: "clamp(3rem,7.5vw,5.75rem)" }}
        >
          Find Your Funding. <br className="hidden sm:block" />
          Apply with{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #6C47FF 0%, #9B73FF 40%, #00D4AA 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundSize: "200% auto",
              animation: "gradient-shift 4s ease infinite",
            }}
          >
            AI.
          </span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          variants={slideUp(0.3)}
          className="text-pretty leading-relaxed max-w-2xl mx-auto mb-10"
          style={{
            fontSize: "clamp(1.05rem,2.5vw,1.25rem)",
            color: "var(--color-muted)",
            fontFamily: "var(--font-satoshi), system-ui, sans-serif",
          }}
        >
          GrantAI discovers perfectly matched funding, writes compelling applications,
          and tracks your entire pipeline — so your team can focus on mission,
          not paperwork.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={slideUp(0.5)}
          className="flex flex-wrap items-center justify-center gap-4 mb-12"
        >
          <Button
            id="hero-cta-primary"
            variant="glow"
            size="lg"
            asChild
            className="group"
          >
            <Link href="/auth/register">
              Get Started Free
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </Button>
          <Button
            id="hero-cta-demo-mode"
            variant="default"
            size="lg"
            asChild
            className="group bg-gradient-to-r from-[#6C47FF] to-[#00D4AA] hover:opacity-90 text-white font-semibold border-0 shadow-glow"
          >
            <Link href="/demo" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
              Try Demo Mode
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button
            id="hero-cta-demo"
            variant="glass"
            size="lg"
            asChild
            className="group"
          >
            <Link href="#demo" className="flex items-center gap-2">
              <span
                className="flex items-center justify-center w-7 h-7 rounded-full border transition-all duration-200 group-hover:border-[var(--color-primary)]"
                style={{ borderColor: "rgba(240,240,255,0.2)", background: "rgba(240,240,255,0.04)" }}
              >
                <Play className="h-3 w-3 ml-0.5" style={{ color: "var(--color-muted)" }} aria-hidden="true" />
              </span>
              Watch Demo
            </Link>
          </Button>
        </motion.div>

        {/* Trust signals */}
        <motion.div
          variants={slideUp(0.65)}
          className="flex flex-wrap items-center justify-center gap-6 text-xs"
          style={{ color: "var(--color-muted)" }}
        >
          {["No credit card required", "Free 14-day trial", "SOC 2 compliant"].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <CheckCircle2
                className="h-3.5 w-3.5 flex-shrink-0"
                style={{ color: "var(--color-accent)" }}
                aria-hidden="true"
              />
              {t}
            </span>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        aria-hidden="true"
      >
        <span className="text-[10px] tracking-widest uppercase" style={{ color: "var(--color-muted)" }}>
          Scroll
        </span>
        <div
          className="w-px h-10 relative overflow-hidden rounded"
          style={{ background: "rgba(240,240,255,0.08)" }}
        >
          <motion.div
            className="absolute inset-x-0 top-0 h-1/2 rounded"
            style={{ background: "linear-gradient(to bottom, #6C47FF, transparent)" }}
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
