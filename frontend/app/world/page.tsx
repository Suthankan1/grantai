"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Menu, Globe, Compass, GraduationCap, Award, Landmark, MapPin } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import UniversityList from "@/components/world/UniversityList";
import { motion, AnimatePresence } from "framer-motion";

// Dynamically import the WorldMap component to disable Server-Side Rendering (SSR)
// react-simple-maps uses SVG/DOM window variables that aren't available on the server.
const WorldMap = dynamic(() => import("@/components/world/WorldMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[580px] rounded-2xl border border-[var(--border-default)] bg-[#030307] flex flex-col items-center justify-center space-y-4 animate-pulse">
      <Globe className="h-12 w-12 text-[#6C47FF] animate-spin" style={{ animationDuration: "3s" }} />
      <span className="text-sm font-semibold text-[var(--color-muted)]">Loading interactive globe coordinates...</span>
    </div>
  )
});

export default function WorldFinderPage() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleSelectCountry = (country: string) => {
    setSelectedCountry(country || null);
  };

  const handleClearSelection = () => {
    setSelectedCountry(null);
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-obsidian)] text-white overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10">
        
        {/* Obsidian Theme Radial Background Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(108,71,255,0.12),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(0,212,170,0.06),_transparent_32%),linear-gradient(180deg,_#05050c_0%,_#080810_100%)] -z-10" />
        <div className="absolute inset-0 bg-grid opacity-25 -z-10" aria-hidden="true" />

        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b border-[rgba(240,240,255,0.05)] px-4 bg-[rgba(8,8,16,0.5)] backdrop-blur-md md:hidden shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-[#6C47FF] to-[#00D4AA] flex items-center justify-center shadow-glow-sm">
              <span className="text-[10px] font-bold text-white">G</span>
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">GrantAI</span>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(240,240,255,0.06)] text-[var(--color-muted)] hover:text-white"
            aria-label="Open Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        {/* Main Content Area */}
        <main className="relative flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-[1600px] mx-auto w-full">
          {/* Header Description */}
          <div className="mb-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(108,71,255,0.3)] bg-[rgba(108,71,255,0.08)] text-xs text-[#9B73FF] font-semibold">
              <Compass className="h-3.5 w-3.5" />
              <span>Interactive Navigation</span>
            </div>
            <h1 className="font-display text-[clamp(2.2rem,5vw,4rem)] leading-[1.0] tracking-tight text-white">
              Global University & Grant Explorer
            </h1>
            <p className="max-w-3xl text-sm text-[var(--color-muted)]">
              Interact with the vector map or click pulsating global hotspots. Discover top universities, navigate directly to official websites, and preview local funding opportunities.
            </p>
          </div>

          {/* Split Screen Grid Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            {/* Left Section: World Map */}
            <div className="xl:col-span-8 space-y-6">
              <WorldMap
                selectedCountry={selectedCountry}
                onSelectCountry={handleSelectCountry}
              />
            </div>

            {/* Right Section: Details Panel */}
            <div className="xl:col-span-4 h-full min-h-[580px]">
              <AnimatePresence mode="wait">
                {selectedCountry ? (
                  <motion.div
                    key="selected-uni-panel"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full"
                  >
                    <UniversityList
                      countryName={selectedCountry}
                      onClear={handleClearSelection}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="global-info-panel"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="flex flex-col h-full bg-[#0F0F1A] border border-[var(--border-default)] rounded-2xl p-6 justify-between min-h-[580px] shadow-glow-sm"
                  >
                    {/* Global Overview Section */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-[var(--border-default)] pb-4">
                        <Globe className="h-6 w-6 text-[#00D4AA]" />
                        <div>
                          <h2 className="text-lg font-bold text-white leading-tight">Global Overview</h2>
                          <p className="text-xs text-[var(--color-muted)] mt-0.5">Explore institutional stats</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex gap-4 p-4 rounded-xl bg-[rgba(8,8,16,0.3)] border border-[var(--border-default)]">
                          <GraduationCap className="h-8 w-8 text-[#6C47FF] shrink-0" />
                          <div>
                            <h3 className="text-sm font-bold text-white">9,800+ Universities</h3>
                            <p className="text-xs text-[var(--color-muted)] mt-1 leading-normal">
                              Database coverage spanning 190+ sovereign countries and territories.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-4 p-4 rounded-xl bg-[rgba(8,8,16,0.3)] border border-[var(--border-default)]">
                          <Award className="h-8 w-8 text-[#00D4AA] shrink-0" />
                          <div>
                            <h3 className="text-sm font-bold text-white">Active Research Grants</h3>
                            <p className="text-xs text-[var(--color-muted)] mt-1 leading-normal">
                              Integrated grant trackers linking student fellowships and academic research funding.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-4 p-4 rounded-xl bg-[rgba(8,8,16,0.3)] border border-[var(--border-default)]">
                          <Landmark className="h-8 w-8 text-[#9B73FF] shrink-0" />
                          <div>
                            <h3 className="text-sm font-bold text-white">Direct Website Verification</h3>
                            <p className="text-xs text-[var(--color-muted)] mt-1 leading-normal">
                              Access official, verified web portals for universities to review admission and scholarship requirements.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Prompt */}
                    <div className="border-t border-[var(--border-default)] pt-4 mt-6 text-center text-xs text-[var(--color-muted)] flex items-center justify-center gap-1.5 leading-relaxed bg-[rgba(108,71,255,0.03)] p-3 rounded-xl border border-[rgba(108,71,255,0.06)]">
                      <MapPin className="h-3.5 w-3.5 text-[#00D4AA] shrink-0 animate-bounce" />
                      <span>Select any country on the map to begin exploring.</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
