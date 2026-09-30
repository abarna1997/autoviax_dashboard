import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, FileCheck, ShieldCheck, Siren } from "lucide-react";
import { FeatureList, Meter, PageHeader, Panel, StatCard } from "@/components/dashboard/kit";

export const Route = createFileRoute("/dashboard/safety")({
  component: Safety,
});

const events = [
  {
    time: "09:42",
    vehicle: "AVX-1042",
    event: "Pedestrian cut-in",
    response: "Comfort brake, 1.4 m clearance",
    outcome: "Nominal",
  },
  {
    time: "08:17",
    vehicle: "AVX-2318",
    event: "Debris on lane",
    response: "Lane shift within envelope",
    outcome: "Nominal",
  },
  {
    time: "07:55",
    vehicle: "AVX-0871",
    event: "Camera confidence drop",
    response: "Teleop assist engaged",
    outcome: "Escalated",
  },
  {
    time: "06:30",
    vehicle: "AVX-5590",
    event: "Emergency vehicle",
    response: "Yield and hold",
    outcome: "Nominal",
  },
];

function Safety() {
  return (
    <>
      <PageHeader
        eyebrow="Assurance"
        title="Safety assurance layer"
        copy="An independent envelope that monitors, constrains and records every autonomous action — designed for regulators, insurers and internal review boards."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Safety score" value="A+" delta="Independent audit" icon={ShieldCheck} />
        <StatCard
          label="Interventions / 1k km"
          value="0.42"
          delta="-41% this quarter"
          icon={AlertTriangle}
        />
        <StatCard label="Envelope violations" value="0" delta="Last 90 days" icon={Siren} />
        <StatCard label="Evidence packs" value="12,480" delta="Auto-generated" icon={FileCheck} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Panel
          title="Recent safety events"
          subtitle="Every event carries a replayable evidence pack"
        >
          <div className="overflow-x-auto -mx-1 sm:mx-0">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="text-[11px] sm:text-xs tracking-wide text-muted-foreground uppercase border-b border-border">
                  <th className="pb-3 font-medium">Time</th>
                  <th className="pb-3 font-medium">Vehicle</th>
                  <th className="pb-3 font-medium">Event</th>
                  <th className="pb-3 font-medium">Response</th>
                  <th className="pb-3 font-medium">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr
                    key={e.time}
                    className="border-b border-border/50 last:border-0 hover:bg-surface-2/30 transition-colors"
                  >
                    <td className="py-3 text-xs sm:text-sm text-muted-foreground">{e.time}</td>
                    <td className="py-3 text-xs sm:text-sm font-semibold text-foreground">
                      {e.vehicle}
                    </td>
                    <td className="py-3 text-xs sm:text-sm text-muted-foreground">{e.event}</td>
                    <td className="py-3 text-xs sm:text-sm text-muted-foreground">{e.response}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          e.outcome === "Nominal"
                            ? "border border-primary/30 bg-primary/10 text-primary"
                            : "border border-destructive/40 bg-destructive/10 text-destructive"
                        }`}
                      >
                        {e.outcome}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Assurance coverage" subtitle="Verification status by domain">
          <div className="space-y-5">
            <Meter label="Functional safety (ISO 26262)" value={96} />
            <Meter label="SOTIF (ISO 21448)" value={91} />
            <Meter label="Cybersecurity (ISO 21434)" value={94} />
            <Meter label="Scenario library coverage" value={88} />
          </div>
        </Panel>
      </div>

      <Panel
        title="Layers of protection"
        subtitle="Defence in depth around every autonomous decision"
      >
        <FeatureList
          items={[
            {
              title: "Runtime monitor",
              copy: "An independent watchdog validates each command against a formal safety envelope.",
            },
            {
              title: "Fallback ladder",
              copy: "Conservative driving, teleop assist, then minimal-risk manoeuvre — always available.",
            },
            {
              title: "Scenario regression",
              copy: "Millions of replayed and synthetic scenarios gate every model release.",
            },
            {
              title: "Evidence by default",
              copy: "Sensor, decision and actuation traces are packaged automatically for review.",
            },
          ]}
        />
      </Panel>
    </>
  );
}
