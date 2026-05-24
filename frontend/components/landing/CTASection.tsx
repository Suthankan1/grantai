"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fadeInUp, stagger } from "./animations";

export function CTASection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleCTASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
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
  );
}
