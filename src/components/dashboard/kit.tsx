import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function PageHeader({
  eyebrow,
  title,
  copy,
  actions,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl min-w-0">
        <p className="text-[11px] font-semibold tracking-[0.22em] text-primary uppercase">
          {eyebrow}
        </p>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
          {title}
        </h1>
        <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-muted-foreground">{copy}</p>
      </div>
      {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
    </header>
  );
}

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
}: {
  label: string;
  value: string;
  delta?: string;
  icon: LucideIcon;
}) {
  return (
    <div className="glass-panel p-4 sm:p-5 transition-all duration-200 hover:border-primary/40">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] sm:text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
      </div>
      <p className="mt-3 sm:mt-4 font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
        {value}
      </p>
      {delta && <p className="mt-1 text-[11px] sm:text-xs font-medium text-primary">{delta}</p>}
    </div>
  );
}

export function Panel({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`glass-panel min-w-0 p-4 sm:p-5 md:p-6 ${className}`}>
      <div className="mb-4 sm:mb-5">
        <h2 className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export function Meter({
  label,
  value,
  suffix = "%",
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground">
          {value}
          {suffix}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}

export function FeatureList({ items }: { items: { title: string; copy: string }[] }) {
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {items.map((i) => (
        <li key={i.title} className="rounded-xl border border-border bg-surface-2/50 p-4">
          <h3 className="text-sm font-semibold text-foreground">{i.title}</h3>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{i.copy}</p>
        </li>
      ))}
    </ul>
  );
}
