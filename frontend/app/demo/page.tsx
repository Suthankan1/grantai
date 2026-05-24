"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, Zap, Database, BrainCircuit, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/lib/auth-store";
import { seedDemoData } from "@/lib/api";

export default function DemoPortalPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleLaunchDemo = () => {
    setLoading(true);

    // 1. Enable Demo Mode in storage
    window.localStorage.setItem("grantai-demo-mode", "true");

    // 2. Initialize mock datasets
    seedDemoData();

    // 3. Log in mock user
    login({
      id: "demo-user-id",
      email: "alex.mercer@stanford.edu",
      fullName: "Dr. Alex Mercer",
      role: "RESEARCHER",
      profileComplete: true
    }, "demo-jwt-token-string");

    // 4. Redirect to dashboard
    setTimeout(() => {
      router.push("/dashboard");
    }, 800);
  };

  return (
    <div className="relative min-h-[90vh] w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Dynamic backgrounds */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(108,71,255,0.18),_transparent_45%),radial-gradient(circle_at_bottom_left,_rgba(0,212,170,0.12),_transparent_40%),linear-gradient(180deg,_#05050c_0%,_#080810_100%)] -z-10" />
      <div className="absolute inset-0 bg-grid opacity-20 -z-10" aria-hidden="true" />

      <div className="max-w-3xl w-full space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-br from-[#6C47FF] to-[#00D4AA] flex items-center justify-center shadow-glow mb-4">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-display">
            GrantAI Guided Demo Portal
          </h1>
          <p className="mt-2 text-sm text-[var(--color-muted)] max-w-lg mx-auto">
            Experience the full capabilities of GrantAI instantly. Evaluates candidate profiles, generates cover letters, and performs mock panel interviews.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card variant="glass" className="p-4 border-[rgba(108,71,255,0.15)] bg-[rgba(10,10,18,0.4)]">
            <CardContent className="p-0 space-y-2">
              <div className="h-8 w-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Database className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Pre-seeded Profile</h3>
              <p className="text-[11px] text-[var(--color-muted)] leading-relaxed">
                Stanford Bio-computation PhD candidate profile complete with research papers and interests.
              </p>
            </CardContent>
          </Card>

          <Card variant="glass" className="p-4 border-[rgba(0,212,170,0.15)] bg-[rgba(10,10,18,0.4)]">
            <CardContent className="p-0 space-y-2">
              <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <BrainCircuit className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Simulated Stream</h3>
              <p className="text-[11px] text-[var(--color-muted)] leading-relaxed">
                AI cover letter generator streams results using simulated Server-Sent Events client-side.
              </p>
            </CardContent>
          </Card>

          <Card variant="glass" className="p-4 border-[rgba(245,158,11,0.15)] bg-[rgba(10,10,18,0.4)]">
            <CardContent className="p-0 space-y-2">
              <div className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Activity className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">100% Client-Side</h3>
              <p className="text-[11px] text-[var(--color-muted)] leading-relaxed">
                Zero cold starts, zero API errors. Drag-and-drop cards and update notes freely.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action card */}
        <Card variant="glass-strong" className="p-6 sm:p-8 rounded-3xl border-[rgba(108,71,255,0.2)] bg-[rgba(15,15,26,0.85)] relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 h-32 w-32 bg-[radial-gradient(circle,_rgba(108,71,255,0.12),_transparent_70%)]" />

          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#00D4AA]" /> Simulated Profile Verification
              </h2>
              <div className="text-xs text-[var(--color-text)]/90 space-y-1.5 leading-relaxed bg-black/30 border border-[var(--border-default)] p-3 rounded-2xl">
                <div><strong>Candidate Name:</strong> Dr. Alex Mercer</div>
                <div><strong>Institution:</strong> Stanford University</div>
                <div><strong>Research Topic:</strong> Geometric Deep Learning in Structural Proteomics</div>
                <div><strong>Matching Opportunities:</strong> NIH Pioneer Award, NSF GRFP, DeepMind Bio-AI</div>
              </div>
            </div>

            <Button
              onClick={handleLaunchDemo}
              loading={loading}
              variant="glow"
              size="lg"
              className="w-full text-sm font-semibold rounded-2xl h-12 flex items-center justify-center gap-2 text-white bg-gradient-to-r from-[#6C47FF] to-[#00D4AA]"
            >
              Initialize Demo & Open Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
