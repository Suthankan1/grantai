"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  [
    "flex w-full rounded-xl",
    "text-sm text-[var(--color-text)]",
    "placeholder:text-[var(--color-muted)]",
    "transition-all duration-200",
    "disabled:cursor-not-allowed disabled:opacity-40",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/50 focus-visible:ring-offset-0",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-[var(--bg-surface)]",
          "border border-[var(--border-default)]",
          "focus-visible:border-[var(--color-primary)]",
          "hover:border-[var(--border-strong)]",
          "px-4 py-2.5",
        ],
        glass: [
          "glass",
          "focus-visible:border-[var(--color-primary)]",
          "px-4 py-2.5",
        ],
        ghost: [
          "bg-transparent",
          "border border-transparent",
          "focus-visible:bg-[var(--bg-surface)] focus-visible:border-[var(--border-default)]",
          "px-4 py-2.5",
        ],
        filled: [
          "bg-[rgba(240,240,255,0.06)]",
          "border border-transparent",
          "focus-visible:border-[var(--color-primary)] focus-visible:bg-[var(--bg-surface)]",
          "hover:bg-[rgba(240,240,255,0.09)]",
          "px-4 py-2.5",
        ],
      },
      inputSize: {
        sm: "h-8 px-3 text-xs rounded-lg",
        default: "h-10",
        lg: "h-12 px-5 text-base rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: boolean;
  errorMessage?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, variant, inputSize, type = "text", leftIcon, rightIcon, error, errorMessage, ...props },
    ref
  ) => {
    if (leftIcon || rightIcon) {
      return (
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 flex items-center text-[var(--color-muted)]">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            type={type}
            className={cn(
              inputVariants({ variant, inputSize }),
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "border-red-500/60 focus-visible:ring-red-500/30",
              className
            )}
            aria-invalid={error}
            aria-describedby={errorMessage ? `${props.id}-error` : undefined}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 flex items-center text-[var(--color-muted)]">
              {rightIcon}
            </span>
          )}
          {errorMessage && (
            <p
              id={`${props.id}-error`}
              className="absolute -bottom-5 left-0 text-xs text-red-400"
            >
              {errorMessage}
            </p>
          )}
        </div>
      );
    }

    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          inputVariants({ variant, inputSize }),
          error && "border-red-500/60 focus-visible:ring-red-500/30",
          className
        )}
        aria-invalid={error}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input, inputVariants };
