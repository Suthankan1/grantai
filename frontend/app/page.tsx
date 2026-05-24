"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  Search,
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  Clock,
  CheckCircle2,
  Play,
  FileText,
  Bot,
  Bell,
  Users,
  ChevronRight,
  Star,
  Quote,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Variants } from "framer-motion";

/* ─── Framer Motion Variants ─────────────────────────────────────────── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0 },
  },
};

const slideUp = (delay = 0): Variants => ({
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const, delay },
  },
});

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

/* ─── Particle Canvas ────────────────────────────────────────────────── */

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      opacity: number;
    };

    let particles: Particle[] = [];
    const COUNT = 55;
    const MAX_DIST = 130;

    const resize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    const init = () => {
      particles = Array.from({ length: COUNT }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.6 + 0.6,
        opacity: Math.random() * 0.5 + 0.25,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // update positions
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      }

      // draw lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.18;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(108, 71, 255, ${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // draw dots
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(108, 71, 255, ${p.opacity})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    resize();
    init();
    draw();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}

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

/* ─── How It Works ───────────────────────────────────────────────────── */

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

/* ─── Feature Cards ──────────────────────────────────────────────────── */

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

/* ─── Testimonials ───────────────────────────────────────────────────── */

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

/* ─── Main Page Component ────────────────────────────────────────────── */

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleCTASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ scrollBehavior: "smooth" }}>

      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════ */}
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
            <Link href="/demo" className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs text-purple-300 hover:bg-purple-500/20 transition-all duration-300">
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
            Find Your Funding.{" "}
            <br className="hidden sm:block" />
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

      {/* ═══════════════════════════════════════════════════════════════
          STATS BAR
      ═══════════════════════════════════════════════════════════════ */}
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

      {/* ═══════════════════════════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════════════════════════ */}
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

      {/* ═══════════════════════════════════════════════════════════════
          FEATURES — 2×3 glass-morphism grid
      ═══════════════════════════════════════════════════════════════ */}
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
              Grant success,{" "}
              <span className="text-gradient-accent">automated</span>
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

      {/* ═══════════════════════════════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════════════════════════════ */}
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

      {/* ═══════════════════════════════════════════════════════════════
          CTA — Full-bleed violet gradient
      ═══════════════════════════════════════════════════════════════ */}
      <section
        id="cta"
        className="relative py-28 px-4 sm:px-6 lg:px-8 overflow-hidden"
        aria-labelledby="cta-heading"
      >
        {/* Full bleed gradient background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(108,71,255,0.18) 0%, rgba(155,115,255,0.12) 40%, rgba(0,212,170,0.1) 100%)",
          }}
          aria-hidden="true"
        />
        {/* Mesh glows */}
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(108,71,255,0.25) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(0,212,170,0.2) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
          aria-hidden="true"
        />

        {/* Border lines */}
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(108,71,255,0.5) 50%, transparent 100%)",
          }}
          aria-hidden="true"
        />

        <div className="max-w-3xl mx-auto relative z-10 text-center">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <motion.div variants={fadeInUp} className="flex justify-center mb-6">
              <Badge variant="primary" className="gap-1.5">
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                Start free today
              </Badge>
            </motion.div>

            <motion.h2
              id="cta-heading"
              variants={fadeInUp}
              className="font-display font-bold tracking-tight text-balance mb-5"
              style={{ fontSize: "clamp(2rem,5vw,3.75rem)" }}
            >
              Ready to win more grants?
            </motion.h2>

            <motion.p
              variants={fadeInUp}
              className="text-lg mb-10 max-w-xl mx-auto"
              style={{ color: "var(--color-muted)" }}
            >
              Join 2,400+ nonprofits and researchers already using GrantAI to secure funding faster than ever before.
            </motion.p>

            {/* Sign-up form */}
            <motion.div variants={fadeInUp}>
              {!submitted ? (
                <form
                  onSubmit={handleCTASubmit}
                  className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-6"
                  aria-label="Get started with GrantAI"
                >
                  <label htmlFor="cta-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="cta-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="flex-1 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 transition-all duration-200"
                    style={{
                      background: "rgba(15,15,26,0.8)",
                      border: "1px solid rgba(240,240,255,0.12)",
                      color: "var(--color-text)",
                      backdropFilter: "blur(12px)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "rgba(108,71,255,0.5)";
                      e.target.style.boxShadow = "0 0 0 3px rgba(108,71,255,0.12)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(240,240,255,0.12)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <button
                    type="submit"
                    id="cta-submit"
                    className="group flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white whitespace-nowrap transition-all duration-200 hover:opacity-90 active:scale-95"
                    style={{
                      background: "linear-gradient(135deg, #6C47FF 0%, #9B73FF 100%)",
                      boxShadow: "0 0 24px rgba(108,71,255,0.4), 0 4px 12px rgba(0,0,0,0.3)",
                    }}
                  >
                    Get Started Free
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </button>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-3 mb-6 py-4 px-6 rounded-xl max-w-md mx-auto"
                  style={{
                    background: "rgba(0,212,170,0.1)",
                    border: "1px solid rgba(0,212,170,0.25)",
                  }}
                >
                  <CheckCircle2 className="w-5 h-5" style={{ color: "#00D4AA" }} aria-hidden="true" />
                  <span className="font-medium" style={{ color: "#00D4AA" }}>
                    You&apos;re on the list! We&apos;ll be in touch soon.
                  </span>
                </motion.div>
              )}

              <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                No credit card required · Cancel anytime · SOC 2 Type II certified
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────────────────── */}
      <footer
        className="relative py-10 px-4 sm:px-6 lg:px-8 text-center"
        role="contentinfo"
        style={{ borderTop: "1px solid var(--border-default)" }}
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #6C47FF, #00D4AA)" }}
              aria-hidden="true"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" aria-hidden="true" />
            </div>
            <span className="font-display font-semibold text-sm" style={{ color: "var(--color-text)" }}>
              GrantAI
            </span>
          </div>
          <p className="text-xs" style={{ color: "var(--color-muted)" }}>
            © {new Date().getFullYear()} GrantAI. All rights reserved.
          </p>
          <div className="flex gap-5 text-xs" style={{ color: "var(--color-muted)" }}>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
