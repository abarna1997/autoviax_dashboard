import { createFileRoute } from "@tanstack/react-router";
import { Brain, Cpu, GitBranch, Timer } from "lucide-react";
import { FeatureList, Meter, PageHeader, Panel, StatCard } from "@/components/dashboard/kit";

export const Route = createFileRoute("/dashboard/decision")({
  component: Decision,
});

const stages = [
  { name: "Predict", copy: "Multi-agent trajectory forecasting up to 8 seconds ahead." },
  { name: "Plan", copy: "Cost-shaped manoeuvre search under comfort and safety constraints." },
  { name: "Arbitrate", copy: "Operational policy, SLA priority and depot constraints resolved." },
  { name: "Act", copy: "Commands issued to vehicle stack with a verified fallback envelope." },
];

function Decision() {
  return (
    <>
      <PageHeader
        eyebrow="Reasoning"
        title="Decision intelligence core"
        copy="A policy-aware reasoning engine that turns the fused world model into safe, explainable and commercially optimal decisions for every vehicle and every load."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Decisions / second" value="42,800" delta="Fleet-wide" icon={Cpu} />
        <StatCard label="Plan horizon" value="8.0 s" delta="Rolling re-plan @ 20 Hz" icon={Timer} />
        <StatCard label="Explainability" value="100%" delta="Every decision traced" icon={Brain} />
        <StatCard label="Policy variants" value="34" delta="Per region & client" icon={GitBranch} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Decision pipeline" subtitle="Each stage is independently auditable">
          <ol className="relative space-y-6 border-l border-border pl-6">
            {stages.map((s, i) => (
              <li key={s.name}>
                <span className="absolute -left-[9px] flex size-[18px] items-center justify-center rounded-full border border-primary/40 bg-background text-[10px] text-primary">
                  {i + 1}
                </span>
                <h3 className="text-sm font-semibold text-foreground">{s.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{s.copy}</p>
              </li>
            ))}
          </ol>
        </Panel>

        <Panel title="Objective weighting" subtitle="Live tuning across the active policy">
          <div className="space-y-5">
            <Meter label="Safety margin" value={97} />
            <Meter label="On-time delivery" value={88} />
            <Meter label="Energy efficiency" value={76} />
            <Meter label="Ride comfort" value={82} />
            <Meter label="Cost per km" value={69} />
          </div>
        </Panel>
      </div>

      <Panel
        title="Why it earns approval"
        subtitle="Built for regulated, high-consequence operations"
      >
        <FeatureList
          items={[
            {
              title: "Deterministic guardrails",
              copy: "Learned components propose; verified rules dispose. Nothing reaches the actuator unchecked.",
            },
            {
              title: "Counterfactual replay",
              copy: "Any decision can be re-run against alternative policies for review boards.",
            },
            {
              title: "Per-client policy sets",
              copy: "Different SLAs, jurisdictions and cargo classes run side by side on the same fleet.",
            },
            {
              title: "Graceful degradation",
              copy: "Confidence loss triggers conservative envelopes, teleop assist, then safe stop.",
            },
          ]}
        />
      </Panel>
    </>
  );
}
