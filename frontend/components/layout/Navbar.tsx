"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Zap, Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NavLink {
  label: string;
  href: string;
  badge?: string;
  children?: { label: string; href: string; description?: string }[];
}

const NAV_LINKS: NavLink[] = [
  { label: "Features", href: "#features" },
  { label: "Grant Search", href: "#grants", badge: "New" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
];

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { scrollY } = useScroll();

  // Detect scroll position to animate the border-bottom appearance
  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
  });

  // Close mobile menu on resize
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  React.useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <motion.header
        role="banner"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50",
          "h-16",
          "transition-all duration-300 ease-smooth"
        )}
      >
        {/* Frosted glass background */}
        <div
          className={cn(
            "absolute inset-0",
            "backdrop-blur-glass",
            "transition-all duration-300",
            scrolled
              ? "bg-[rgba(8,8,16,0.85)] border-b border-[rgba(240,240,255,0.08)]"
              : "bg-transparent border-b border-transparent"
          )}
        />

        {/* Glow line under nav when scrolled */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(108,71,255,0.5) 30%, rgba(0,212,170,0.4) 70%, transparent 100%)",
          }}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{
            opacity: scrolled ? 1 : 0,
            scaleX: scrolled ? 1 : 0,
          }}
          transition={{ duration: 0.4 }}
        />

        {/* Content */}
        <nav
          className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          aria-label="Main navigation"
        >
          <div className="flex items-center justify-between h-full gap-8">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 shrink-0 group"
              aria-label="GrantAI — home"
              id="nav-logo"
            >
              <div className="relative h-8 w-8 rounded-xl bg-gradient-to-br from-[#6C47FF] to-[#00D4AA] flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-shadow duration-300">
                <Zap className="h-4 w-4 text-white" aria-hidden="true" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#6C47FF] to-[#00D4AA] opacity-0 group-hover:opacity-30 blur-md transition-opacity duration-300" />
              </div>
              <span className="font-display text-[1.1rem] font-semibold tracking-tight text-[var(--color-text)]">
                Grant
                <span className="text-gradient-primary">AI</span>
              </span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <NavItem key={link.href} link={link} />
              ))}
            </div>

            {/* Auth buttons */}
            <div className="hidden md:flex items-center gap-3 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                asChild
                id="nav-signin"
              >
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button
                variant="default"
                size="sm"
                asChild
                id="nav-get-started"
                className="relative overflow-hidden"
              >
                <Link href="/sign-up">
                  Get started
                  <ArrowIcon />
                </Link>
              </Button>
            </div>

            {/* Mobile hamburger */}
            <button
              className="flex md:hidden items-center justify-center h-9 w-9 rounded-lg border border-[var(--border-default)] text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[rgba(240,240,255,0.06)] transition-all duration-200"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              id="nav-mobile-toggle"
            >
              <motion.div
                animate={{ rotate: mobileOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {mobileOpen ? (
                  <X className="h-4.5 w-4.5" aria-hidden="true" />
                ) : (
                  <Menu className="h-4.5 w-4.5" aria-hidden="true" />
                )}
              </motion.div>
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile menu */}
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}

/* ─── Nav Item ─────────────────────────────────────────────────── */

function NavItem({ link }: { link: NavLink }) {
  return (
    <Link
      href={link.href}
      className="relative flex items-center gap-1.5 px-3 py-2 text-sm text-[var(--color-muted)] rounded-lg transition-all duration-200 hover:text-[var(--color-text)] hover:bg-[rgba(240,240,255,0.06)] group"
      id={`nav-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      {link.label}
      {link.badge && (
        <Badge variant="primary" size="sm">
          {link.badge}
        </Badge>
      )}
      {link.children && (
        <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180" />
      )}
    </Link>
  );
}

/* ─── Arrow Icon ────────────────────────────────────────────────── */

function ArrowIcon() {
  return (
    <svg
      className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M1 7h12M7 1l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── Mobile Menu ───────────────────────────────────────────────── */

function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <motion.div
      id="mobile-nav"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
      initial={false}
      animate={open ? "open" : "closed"}
      variants={{
        open: { opacity: 1, x: 0, pointerEvents: "auto" },
        closed: { opacity: 0, x: "100%", pointerEvents: "none" },
      }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed inset-0 z-40 top-16 glass-strong flex flex-col p-6 md:hidden"
    >
      {/* Links */}
      <nav className="flex flex-col gap-2">
        {NAV_LINKS.map((link, i) => (
          <motion.div
            key={link.href}
            initial={{ opacity: 0, x: 20 }}
            animate={open ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
          >
            <Link
              href={link.href}
              onClick={onClose}
              className="flex items-center justify-between px-4 py-3 rounded-xl text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[rgba(240,240,255,0.06)] transition-all duration-200 text-base"
            >
              <span className="font-medium">{link.label}</span>
              {link.badge && (
                <Badge variant="primary" size="sm">
                  {link.badge}
                </Badge>
              )}
            </Link>
          </motion.div>
        ))}
      </nav>

      {/* Divider */}
      <div className="mt-6 mb-6 h-px bg-[var(--border-default)]" />

      {/* CTA buttons */}
      <motion.div
        className="flex flex-col gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ delay: 0.25, duration: 0.3 }}
      >
        <Button variant="outline" size="lg" asChild>
          <Link href="/sign-in" onClick={onClose}>
            Sign in
          </Link>
        </Button>
        <Button variant="default" size="lg" asChild>
          <Link href="/sign-up" onClick={onClose}>
            Get started free
          </Link>
        </Button>
      </motion.div>

      {/* Bottom glow decoration */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[var(--color-primary)] rounded-full opacity-10 blur-3xl pointer-events-none" />
    </motion.div>
  );
}
