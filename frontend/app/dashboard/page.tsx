import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(108,71,255,0.2),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(0,212,170,0.12),_transparent_28%),linear-gradient(180deg,_#05050c_0%,_#080810_100%)]" />
      <div className="absolute inset-0 bg-grid opacity-35" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-6rem)] w-full max-w-5xl items-center justify-center">
        <Card variant="glass-strong" padding="none" className="w-full overflow-hidden">
          <CardHeader className="border-b border-[var(--border-default)]">
            <CardTitle>Dashboard</CardTitle>
            <CardDescription>Your onboarding profile has been saved. This is the landing target for the post-submit redirect.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 px-6 py-6 sm:px-8 sm:py-8">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                ["Profile", "Complete"],
                ["Auth", "Secure cookie session"],
                ["Next", "Grant matching"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-[var(--border-default)] bg-[rgba(240,240,255,0.04)] p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">{label}</div>
                  <div className="mt-2 text-lg font-medium text-[var(--color-text)]">{value}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/onboarding">Edit onboarding</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Go home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}