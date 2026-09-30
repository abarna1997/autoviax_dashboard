import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel } from "@/components/dashboard/kit";
import { useAuth } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user, signOut, updateDisplayName } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = window.localStorage.getItem("autoviax.prefs");
        if (saved) return JSON.parse(saved);
      } catch {
        /* ignore */
      }
    }
    return {
      safety: true,
      routing: true,
      energy: false,
      weekly: true,
    };
  });

  useEffect(() => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
  }, [user?.name, user?.email]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a name.");
      return;
    }
    setSaving(true);
    try {
      await updateDisplayName(name.trim());
      toast.success("Admin profile updated successfully");
    } catch (err) {
      toast.error((err as Error).message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  const handleTogglePref = (key: string, v: boolean, label: string) => {
    setPrefs((s: typeof prefs) => {
      const next = { ...s, [key]: v };
      try {
        window.localStorage.setItem("autoviax.prefs", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
    toast.success(`${label} ${v ? "enabled" : "disabled"}`);
  };

  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        copy="Manage your operator profile, alerting preferences and fleet defaults for this AutoViaX workspace."
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <Panel title="Operator profile" subtitle="Visible to your fleet operations team">
          <form className="space-y-4" onSubmit={handleSave}>
            <div className="mb-4 flex items-center gap-3">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.name}
                  className="size-12 rounded-xl object-cover border border-border"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-base font-bold text-primary-foreground">
                  {(user?.name || "A").slice(0, 1).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {user?.name || "Administrator"}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    {user?.role || "Administrator"}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {user?.provider === "google.com" ? "Google Account" : "Active Session"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pname">Full name</Label>
              <Input
                id="pname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 bg-surface"
                placeholder="Enter your name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pemail">Work email</Label>
              <Input
                id="pemail"
                value={email || user?.email || ""}
                readOnly
                disabled
                className="h-11 bg-surface text-muted-foreground cursor-not-allowed opacity-80"
              />
              <p className="text-[11px] text-muted-foreground">
                Email is tied to your login provider.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prole">Role</Label>
              <Input
                id="prole"
                value={user?.role ?? "Administrator"}
                readOnly
                disabled
                className="h-11 bg-surface text-muted-foreground cursor-not-allowed opacity-80"
              />
            </div>
            <Button type="submit" disabled={saving} className="h-11 font-semibold cursor-pointer">
              {saving ? "Saving changes…" : "Save changes"}
            </Button>
          </form>
        </Panel>

        <div className="space-y-6">
          <Panel title="Alerting" subtitle="Choose what reaches your notification bell">
            <div className="space-y-4">
              {[
                {
                  key: "safety",
                  label: "Safety interventions",
                  copy: "Envelope events and teleop escalations",
                },
                {
                  key: "routing",
                  label: "Route re-optimisations",
                  copy: "Corridor level changes above 5 minutes",
                },
                {
                  key: "energy",
                  label: "Energy & charging",
                  copy: "Grid pricing and depot capacity shifts",
                },
                {
                  key: "weekly",
                  label: "Weekly intelligence digest",
                  copy: "Fleet performance summary each Monday",
                },
              ].map((p) => (
                <div
                  key={p.key}
                  className="flex items-start justify-between gap-4 rounded-xl border border-border bg-surface-2/40 p-4"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{p.copy}</p>
                  </div>
                  <Switch
                    checked={prefs[p.key as keyof typeof prefs]}
                    onCheckedChange={(v) => handleTogglePref(p.key, v, p.label)}
                  />
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Session" subtitle="Active operator workspace">
            <Button
              variant="outline"
              className="h-11 w-full cursor-pointer hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40"
              onClick={async () => {
                await signOut();
                toast.success("Signed out successfully");
                navigate({ to: "/" });
              }}
            >
              <LogOut className="mr-2 size-4" /> Sign out
            </Button>
          </Panel>
        </div>
      </div>
    </>
  );
}
