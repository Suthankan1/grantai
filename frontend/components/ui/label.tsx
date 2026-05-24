"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
    required?: boolean;
    optional?: boolean;
  }
>(({ className, required, optional, children, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "text-sm font-medium text-[var(--color-subtle)]",
      "leading-none",
      "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
      "select-none",
      className
    )}
    {...props}
  >
    {children}
    {required && (
      <span className="ml-1 text-red-400" aria-label="required">
        *
      </span>
    )}
    {optional && (
      <span className="ml-1.5 text-[10px] text-[var(--color-muted)] font-normal">
        (optional)
      </span>
    )}
  </LabelPrimitive.Root>
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
