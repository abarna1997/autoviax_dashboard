import { createFileRoute } from "@tanstack/react-router";
import { Boxes, Cloud, Plug, Terminal } from "lucide-react";
import { FeatureList, PageHeader, Panel, StatCard } from "@/components/dashboard/kit";

export const Route = createFileRoute("/dashboard/architecture")({
  component: Architecture,
});

const layers = [
  {
    name: "Vehicle edge",
    copy: "Perception fusion and safety monitor running on in-vehicle compute.",
    tags: ["ROS 2", "AUTOSAR", "gRPC"],
  },
  {
    name: "Mobility data plane",
    copy: "Streaming telemetry, map state and environmental feeds.",
    tags: ["Kafka", "MQTT", "Parquet"],
  },
  {
    name: "Intelligence services",
    copy: "Decision core, optimiser and environmental accounting.",
    tags: ["REST", "GraphQL", "Webhooks"],
  },
  {
    name: "Enterprise systems",
    copy: "TMS, WMS, ERP and telematics integration.",
    tags: ["SAP", "Oracle TMS", "Custom"],
  },
];

function Architecture() {
  return (
    <>
      <PageHeader
        eyebrow="Platform"
        title="Open architecture"
        copy="AutoViaX is an intelligence layer, not a walled garden — it composes with the vehicle stacks, telematics and enterprise systems you already run."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Integrations" value="60+" delta="Certified connectors" icon={Plug} />
        <StatCard label="Deployment" value="Hybrid" delta="Cloud, on-prem or edge" icon={Cloud} />
        <StatCard
          label="API surface"
          value="REST · gRPC"
          delta="Fully documented"
          icon={Terminal}
        />
        <StatCard label="Vehicle stacks" value="Agnostic" delta="OEM independent" icon={Boxes} />
      </div>

      <Panel
        title="Reference architecture"
        subtitle="Four composable layers, each independently replaceable"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {layers.map((l, i) => (
            <div key={l.name} className="rounded-xl border border-border bg-surface-2/40 p-5">
              <span className="text-[11px] tracking-[0.2em] text-primary uppercase">
                Layer {i + 1}
              </span>
              <h3 className="mt-2 text-sm font-semibold text-foreground">{l.name}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{l.copy}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {l.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-md border border-border px-2 py-0.5 text-[10px] text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel title="Sample request" subtitle="Fleet optimisation endpoint">
          <pre className="overflow-x-auto rounded-xl border border-border bg-[oklch(0.07_0.012_260)] p-4 text-xs leading-relaxed text-muted-foreground">
            {`POST /v1/fleet/optimise
Authorization: Bearer <token>

{
  "fleet_id": "avx-emea-01",
  "objective": ["on_time", "energy"],
  "constraints": {
    "max_duty_minutes": 540,
    "min_state_of_charge": 0.18
  }
}`}
          </pre>
        </Panel>

        <Panel title="Built to integrate" subtitle="What makes the platform open">
          <FeatureList
            items={[
              {
                title: "Standards first",
                copy: "ROS 2, MQTT, OpenAPI and GTFS-RT interfaces out of the box.",
              },
              {
                title: "Bring your own models",
                copy: "Swap perception or prediction components without leaving the platform.",
              },
              {
                title: "Data residency",
                copy: "Deploy regionally to satisfy sovereignty and contractual requirements.",
              },
              {
                title: "No lock-in",
                copy: "Export raw telemetry, decisions and evidence packs at any time.",
              },
            ]}
          />
        </Panel>
      </div>
    </>
  );
}
