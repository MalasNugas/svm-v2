import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Profile() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [stats, setStats] = useState({ total: 0, labeled: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle();
      setDisplayName(profile?.display_name || user.email?.split("@")[0] || "");
      const { data: r } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      setRoles((r ?? []).map((x: any) => x.role));
      const { count: total } = await supabase.from("tweets").select("*", { count: "exact", head: true });
      const { count: labeled } = await supabase.from("tweets").select("*", { count: "exact", head: true }).not("sentiment", "is", null);
      setStats({ total: total ?? 0, labeled: labeled ?? 0 });
    })();
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ display_name: displayName }).eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  };

  const initial = (displayName || user?.email || "U").charAt(0).toUpperCase();

  return (
    <AppShell searchPlaceholder="Search...">
      <section className="max-w-3xl">
        <div className="flex items-center gap-3 text-secondary text-[11px] tracking-[0.25em] uppercase font-bold">
          <span className="w-8 h-px bg-secondary" /> Account
        </div>
        <h1 className="mt-4 font-headline text-5xl font-extrabold text-primary tracking-tight">Your Profile</h1>

        <div className="mt-10 bg-surface-lowest rounded-2xl p-8 shadow-ambient">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-secondary-container flex items-center justify-center text-secondary text-3xl font-bold">
              {initial}
            </div>
            <div>
              <p className="font-headline text-2xl font-bold text-primary">{displayName || "Unnamed"}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div className="mt-2 flex gap-2">
                {roles.length === 0 && <span className="text-xs px-2 py-1 rounded bg-surface-low text-muted-foreground">researcher</span>}
                {roles.map((r) => (
                  <span key={r} className={`text-xs px-2 py-1 rounded font-bold ${r === "admin" ? "bg-secondary text-secondary-foreground" : "bg-surface-low text-muted-foreground"}`}>{r}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-2">
            <label className="text-xs uppercase tracking-[0.18em] font-bold text-muted-foreground">Display Name</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="bg-surface-low rounded-xl px-4 py-3 text-sm text-primary outline-none"
            />
          </div>
          <div className="mt-4 grid gap-2">
            <label className="text-xs uppercase tracking-[0.18em] font-bold text-muted-foreground">Email</label>
            <input value={user?.email || ""} disabled className="bg-surface-low rounded-xl px-4 py-3 text-sm text-muted-foreground outline-none" />
          </div>

          <button onClick={save} disabled={saving} className="mt-6 bg-primary text-primary-foreground rounded-xl px-6 py-3 text-sm font-bold hover:opacity-90 disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-surface-lowest rounded-2xl p-6 shadow-ambient">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-bold">Total Tweets</p>
            <p className="mt-2 font-headline text-4xl font-bold text-primary">{stats.total.toLocaleString()}</p>
          </div>
          <div className="bg-surface-lowest rounded-2xl p-6 shadow-ambient">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-bold">Labeled</p>
            <p className="mt-2 font-headline text-4xl font-bold text-secondary">{stats.labeled.toLocaleString()}</p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
