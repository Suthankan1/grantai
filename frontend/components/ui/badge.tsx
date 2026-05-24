import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  [
    "inline-flex items-center gap-1",
    "rounded-full px-2.5 py-0.5",
    "text-xs font-medium",
    "border",
    "transition-colors duration-200",
    "select-none",
  ],
  {
    variants: {
      variant: {
        // Default — subtle surface
        default: [
          "bg-[rgba(240,240,255,0.06)]",
          "border-[rgba(240,240,255,0.12)]",
          "text-[var(--color-subtle)]",
        ],
        // Primary — purple
        primary: [
          "bg-[rgba(108,71,255,0.15)]",
          "border-[rgba(108,71,255,0.3)]",
          "text-[#9B73FF]",
        ],
        // Accent — teal
        accent: [
          "bg-[rgba(0,212,170,0.12)]",
          "border-[rgba(0,212,170,0.25)]",
          "text-[#00D4AA]",
        ],
        // Success — green
        success: [
          "bg-[rgba(34,197,94,0.12)]",
          "border-[rgba(34,197,94,0.25)]",
          "text-[#4ade80]",
        ],
        // Warning — amber
        warning: [
          "bg-[rgba(245,158,11,0.12)]",
          "border-[rgba(245,158,11,0.25)]",
          "text-[#fbbf24]",
        ],
        // Destructive — red
        destructive: [
          "bg-[rgba(239,68,68,0.12)]",
          "border-[rgba(239,68,68,0.25)]",
          "text-[#f87171]",
        ],
        // Info — blue
        info: [
          "bg-[rgba(59,130,246,0.12)]",
          "border-[rgba(59,130,246,0.25)]",
          "text-[#93c5fd]",
        ],
        // Outline — border only
        outline: [
          "bg-transparent",
          "border-[var(--border-strong)]",
          "text-[var(--color-muted)]",
        ],
        // Solid primary
        "solid-primary": [
          "bg-[var(--color-primary)]",
          "border-[var(--color-primary)]",
          "text-white",
        ],
        // Solid accent
        "solid-accent": [
          "bg-[var(--color-accent)]",
          "border-[var(--color-accent)]",
          "text-[var(--bg-obsidian)] font-semibold",
        ],
      },
      size: {
        sm: "px-2 py-0 text-[10px]",
        default: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, size, dot = false, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full bg-current shrink-0",
            variant === "success" && "bg-[#4ade80]",
            variant === "warning" && "bg-[#fbbf24]",
            variant === "destructive" && "bg-[#f87171]",
            variant === "primary" && "bg-[#9B73FF]",
            variant === "accent" && "bg-[#00D4AA]"
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
