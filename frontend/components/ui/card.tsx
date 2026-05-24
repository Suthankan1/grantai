"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "relative rounded-2xl overflow-hidden transition-all duration-300",
  {
    variants: {
      variant: {
        // Default surface card
        default: [
          "bg-[var(--bg-surface)]",
          "border border-[var(--border-default)]",
          "shadow-card",
        ],
        // Glass morphism
        glass: [
          "glass",
          "shadow-glass",
        ],
        // Strong glass
        "glass-strong": [
          "glass-strong",
          "shadow-glass-lg",
        ],
        // Elevated surface
        elevated: [
          "bg-[var(--bg-surface-raised)]",
          "border border-[var(--border-strong)]",
          "shadow-card",
        ],
        // Interactive hover with glow
        interactive: [
          "bg-[var(--bg-surface)]",
          "border border-[var(--border-default)]",
          "shadow-card",
          "cursor-pointer",
          "hover:border-[var(--border-glow)] hover:shadow-card-hover hover:-translate-y-1",
        ],
        // Gradient border glow card
        glow: [
          "bg-[var(--bg-surface)]",
          "before:absolute before:inset-0 before:rounded-2xl",
          "before:p-[1px] before:bg-gradient-to-br before:from-[#6C47FF] before:to-[#00D4AA]",
          "before:-z-10 before:content-['']",
          "shadow-glow-sm",
        ],
        // Outlined minimal
        outline: [
          "bg-transparent",
          "border border-[var(--border-strong)]",
        ],
        // Ghost
        ghost: [
          "bg-transparent border-transparent",
        ],
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
        xl: "p-10",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding }), className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-display text-lg font-semibold leading-snug tracking-tight text-[var(--color-text)]",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-[var(--color-muted)] leading-relaxed", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-6 pt-0",
      className
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
};
