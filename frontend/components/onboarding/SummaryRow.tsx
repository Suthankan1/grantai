import type { ReactNode } from "react";

interface SummaryRowProps {
  label: string;
  value: string | number | ReactNode;
}

export function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--border-default)] py-3 last:border-0">
      <span className="text-sm text-[var(--color-muted)]">{label}</span>
      <span className="max-w-[65%] text-right text-sm text-[var(--color-text)]">{value}</span>
    </div>
  );
}
