import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Eye, Radar, Waves, Satellite } from "lucide-react";
import { FeatureList, Meter, PageHeader, Panel, StatCard } from "@/components/dashboard/kit";
import { sensorHealth } from "@/lib/fleet-data";

export const Route = createFileRoute("/dashboard/perception")({
  component: Perception,
});

function Perception() {
  return (
    <>
      <PageHeader
        eyebrow="Perception"
        title="Multi-sensor perception fusion"
        copy="LiDAR, radar, vision, ultrasonic and GNSS streams are time-aligned and fused into a single probabilistic world model with per-object confidence."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Fusion rate" value="120 Hz" delta="Deterministic pipeline" icon={Waves} />
        <StatCard label="Tracked objects" value="1.9M / day" delta="Across the fleet" icon={Eye} />
        <StatCard
          label="Detection recall"
          value="99.3%"
          delta="Vulnerable road users"
          icon={Radar}
        />
        <StatCard
          label="Localisation drift"
          value="4.1 cm"
          delta="RTK-corrected"
          icon={Satellite}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Panel title="Sensor health index" subtitle="Calibration confidence by modality">
          <div className="h-[240px] sm:h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sensorHealth}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="name"
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
                  dataKey="value"
                  fill="var(--color-primary)"
                  radius={[6, 6, 0, 0]}
                  barSize={38}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Conditions coverage" subtitle="Model performance by environment">
          <div className="space-y-5">
            <Meter label="Clear daylight" value={99} />
            <Meter label="Heavy rain" value={94} />
            <Meter label="Night / low light" value={96} />
            <Meter label="Fog & spray" value={89} />
            <Meter label="Dense urban occlusion" value={91} />
          </div>
        </Panel>
      </div>

      <Panel title="How fusion works" subtitle="From raw signal to actionable world model">
        <FeatureList
          items={[
            {
              title: "Time alignment",
              copy: "Every sensor frame is stamped against a common clock so motion is reconstructed without smearing.",
            },
            {
              title: "Probabilistic association",
              copy: "Detections across modalities are merged into single objects with calibrated uncertainty.",
            },
            {
              title: "Semantic enrichment",
              copy: "Lanes, signals, road users and hazards are typed and attributed with intent estimates.",
            },
            {
              title: "Degradation awareness",
              copy: "When a modality degrades, the model rebalances weighting and flags the vehicle for service.",
            },
          ]}
        />
      </Panel>
    </>
  );
}
