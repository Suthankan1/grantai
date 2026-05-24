export function DashboardSkeleton() {
  return (
    <div className="grid gap-6 animate-pulse">
      {/* Stat Cards row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 bg-[rgba(240,240,255,0.02)] border border-[var(--border-default)] rounded-2xl shimmer"
          />
        ))}
      </div>
      {/* Charts section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 h-[340px] bg-[rgba(240,240,255,0.02)] border border-[var(--border-default)] rounded-3xl shimmer" />
        <div className="h-[340px] bg-[rgba(240,240,255,0.02)] border border-[var(--border-default)] rounded-3xl shimmer" />
      </div>
      {/* Timeline + Feed row */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 h-[380px] bg-[rgba(240,240,255,0.02)] border border-[var(--border-default)] rounded-3xl shimmer" />
        <div className="h-[380px] bg-[rgba(240,240,255,0.02)] border border-[var(--border-default)] rounded-3xl shimmer" />
      </div>
    </div>
  );
}
