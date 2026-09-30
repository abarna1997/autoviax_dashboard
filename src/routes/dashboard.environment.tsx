import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CloudSun, Factory, Leaf, Recycle } from "lucide-react";
import { FeatureList, Meter, PageHeader, Panel, StatCard } from "@/components/dashboard/kit";

export const Route = createFileRoute("/dashboard/environment")({
  component: Environment,
});

const emissions = [
  { month: "Apr", tonnes: 412 },
  { month: "May", tonnes: 388 },
  { month: "Jun", tonnes: 351 },
  { month: "Jul", tonnes: 322 },
  { month: "Aug", tonnes: 297 },
  { month: "Sep", tonnes: 268 },
];

function Environment() {
  return (
    <>
      <PageHeader
        eyebrow="Sustainability"
        title="Environmental accounting"
        copy="Every kilometre is costed in carbon, energy and grid impact — producing audit-ready reporting rather than estimates at year end."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="CO₂e avoided" value="1,842 t" delta="Year to date" icon={Leaf} />
        <StatCard label="Energy per km" value="0.71 kWh" delta="-14% YoY" icon={Factory} />
        <StatCard label="Regen recovery" value="23%" delta="Of drive energy" icon={Recycle} />
        <StatCard
          label="Clean-grid charging"
          value="68%"
          delta="Low-carbon windows"
          icon={CloudSun}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Panel title="Fleet emissions" subtitle="Tonnes CO₂e per month">
          <div className="h-[240px] sm:h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={emissions}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "var(--color-surface-2)" }}
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="tonnes"
                  fill="var(--color-primary)"
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Reporting readiness" subtitle="Coverage of disclosure frameworks">
          <div className="space-y-5">
            <Meter label="Scope 1 coverage" value={100} />
            <Meter label="Scope 2 coverage" value={96} />
            <Meter label="Scope 3 transport" value={81} />
            <Meter label="Data lineage verified" value={93} />
          </div>
        </Panel>
      </div>

      <Panel title="Accounting model" subtitle="From telemetry to disclosure">
        <FeatureList
          items={[
            {
              title: "Per-trip carbon ledger",
              copy: "Energy draw, payload and grid intensity attributed to each trip and client.",
            },
            {
              title: "Grid-aware charging",
              copy: "Charging shifts toward low-carbon, low-cost windows without missing dispatch.",
            },
            {
              title: "Payload efficiency",
              copy: "Emissions normalised per tonne-km so consolidation gains are visible.",
            },
            {
              title: "Export-ready evidence",
              copy: "Immutable records suitable for assurance and customer disclosures.",
            },
          ]}
        />
      </Panel>
    </>
  );
}
