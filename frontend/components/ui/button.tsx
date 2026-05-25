"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base styles
  [
    "inline-flex items-center justify-center gap-2",
    "rounded-xl font-medium text-sm",
    "transition-all duration-200 ease-smooth",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian",
    "disabled:pointer-events-none disabled:opacity-40",
    "select-none whitespace-nowrap",
    "active:scale-[0.97]",
  ],
  {
    variants: {
      variant: {
        // Primary — filled with gradient
        default: [
          "bg-gradient-to-r from-[#6C47FF] to-[#9B73FF]",
          "text-white",
          "hover:shadow-glow hover:brightness-110",
          "border border-primary/30",
        ],
        glow: 'bg-[var(--color-primary)] text-white shadow-[0_0_20px_rgba(108,71,255,0.5),0_0_40px_rgba(108,71,255,0.25)] hover:bg-[var(--color-primary-hover)] hover:shadow-[0_0_30px_rgba(108,71,255,0.7)] transition-all duration-300',
        // Accent — teal/green accent color
        accent: [
          "bg-gradient-to-r from-[#00D4AA] to-[#00EEC0]",
          "text-obsidian font-semibold",
          "hover:shadow-glow-accent hover:brightness-105",
          "border border-accent/30",
        ],
        // Outline — glass border style
        outline: [
          "bg-transparent",
          "border border-[rgba(240,240,255,0.15)]",
          "text-[var(--color-text)]",
          "hover:bg-[rgba(108,71,255,0.1)] hover:border-[rgba(108,71,255,0.4)]",
          "hover:shadow-glow-sm",
        ],
        // Ghost — minimal, text only
        ghost: [
          "bg-transparent border-transparent",
          "text-[var(--color-muted)]",
          "hover:bg-[rgba(240,240,255,0.06)] hover:text-[var(--color-text)]",
        ],
        // Glass — frosted glass style
        glass: [
          "glass",
          "text-[var(--color-text)]",
          "hover:border-[rgba(108,71,255,0.35)] hover:shadow-glow-sm",
          "hover:bg-[rgba(108,71,255,0.08)]",
        ],
        // Destructive
        destructive: [
          "bg-red-500/15 border border-red-500/30",
          "text-red-400",
          "hover:bg-red-500/25 hover:border-red-500/50",
        ],
        // Link style
        link: [
          "bg-transparent border-transparent underline-offset-4",
          "text-[var(--color-primary)]",
          "hover:underline",
          "h-auto px-0 py-0",
        ],
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
        default: "h-10 px-5 text-sm",
        lg: "h-12 px-7 text-base rounded-2xl",
        xl: "h-14 px-9 text-lg rounded-2xl",
        icon: "h-10 w-10 rounded-xl",
        "icon-sm": "h-8 w-8 rounded-lg",
        "icon-lg": "h-12 w-12 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <LoadingSpinner />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

function LoadingSpinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export { Button, buttonVariants };
