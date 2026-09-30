import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Fuel, MapPin, Route as RouteIcon, Timer } from "lucide-react";
import { FeatureList, PageHeader, Panel, StatCard } from "@/components/dashboard/kit";

export const Route = createFileRoute("/dashboard/routes")({
  component: Routing,
});

const savings = [
  { day: "Mon", baseline: 100, optimised: 88 },
  { day: "Tue", baseline: 100, optimised: 84 },
  { day: "Wed", baseline: 100, optimised: 81 },
  { day: "Thu", baseline: 100, optimised: 79 },
  { day: "Fri", baseline: 100, optimised: 74 },
  { day: "Sat", baseline: 100, optimised: 77 },
  { day: "Sun", baseline: 100, optimised: 72 },
];

const corridors = [
  { name: "Corridor 14 — Port loop", load: "High", change: "-12 min avg", status: "Re-optimised" },
  {
    name: "Corridor 07 — Southern express",
    load: "Medium",
    change: "-6% energy",
    status: "Stable",
  },
  {
    name: "Corridor 22 — Urban last mile",
    load: "High",
    change: "+4 drops/hr",
    status: "Re-optimised",
  },
  { name: "Corridor 03 — Depot shuttle", load: "Low", change: "-9% idle", status: "Stable" },
];

function Routing() {
  return (
    <>
      <PageHeader
        eyebrow="Routing"
        title="Continuous route optimisation"
        copy="Corridors are recomputed continuously as demand, traffic, weather, charge state and delivery windows shift — not once at dispatch."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Re-optimisations / day" value="184K" delta="Fleet-wide" icon={RouteIcon} />
        <StatCard label="Time saved" value="21%" delta="vs static dispatch" icon={Timer} />
        <StatCard label="Energy saved" value="17%" delta="Per delivered tonne-km" icon={Fuel} />
        <StatCard label="On-time rate" value="98.4%" delta="Across all SLAs" icon={MapPin} />
      </div>

      <Panel title="Cost index vs static dispatch" subtitle="Baseline 100 — lower is better">
        <div className="h-[240px] sm:h-[300px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={savings}>
              <defs>
                <linearGradient id="go" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="day"
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[60, 110]}
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="baseline"
                stroke="var(--color-chart-5)"
                fill="transparent"
                strokeDasharray="4 4"
              />
              <Area
                type="monotone"
                dataKey="optimised"
                stroke="var(--color-primary)"
                fill="url(#go)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel title="Active corridors" subtitle="Live optimisation state">
          <div className="space-y-3">
            {corridors.map((c) => (
              <div
                key={c.name}
                className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface-2/40 p-4"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{c.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Load {c.load} • {c.change}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs text-primary">
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="What the optimiser weighs" subtitle="Every re-plan balances these together">
          <FeatureList
            items={[
              {
                title: "Demand & load",
                copy: "Orders, priorities and cargo constraints shape the sequence.",
              },
              {
                title: "Network state",
                copy: "Congestion, closures and incident feeds re-price every edge.",
              },
              {
                title: "Energy & charge",
                copy: "State of charge, depot capacity and grid pricing windows.",
              },
              {
                title: "Driver & duty rules",
                copy: "Teleop coverage, shift limits and jurisdictional constraints.",
              },
            ]}
          />
        </Panel>
      </div>
    </>
  );
}
