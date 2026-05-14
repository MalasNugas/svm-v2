import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { auth } from "@/lib/api";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/analysis", label: "Analysis", icon: "analytics" },
  { to: "/dataset", label: "Dataset", icon: "database" },
  { to: "/tourism", label: "Tourism", icon: "map" },
  { to: "/about", label: "About", icon: "info" },
];

interface AppShellProps {
  children: ReactNode;
  searchPlaceholder?: string;
  rightSlot?: ReactNode;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
}

export function AppShell({ children, searchPlaceholder = "Search sentiment data...", rightSlot, searchValue, onSearchChange }: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const showTopNav = ["/dashboard"].includes(location.pathname);
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState<string>("");
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle()
      .then(({ data }) => setDisplayName(data?.display_name || user.email?.split("@")[0] || "User"));
    supabase.from("tweets").select("*", { count: "exact", head: true })
      .not("labeled_at", "is", null)
      .gte("labeled_at", new Date(Date.now() - 24 * 3600 * 1000).toISOString())
      .then(({ count }) => setNotifCount(count ?? 0));
  }, [user]);

  const initial = (displayName || "U").charAt(0).toUpperCase();

  const handleSignOut = async () => {
    await auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 fixed left-0 top-0 h-screen flex-col bg-surface-low/60 px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground">
            <span className="material-symbols-outlined text-[20px]">database</span>
          </div>
          <div>
            <h2 className="font-headline font-bold text-primary leading-tight text-[15px]">Cognitive Curator</h2>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Thesis Edition</p>
          </div>
        </div>

        <button onClick={() => navigate("/analysis")} className="w-full py-3 px-4 mb-8 gradient-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 shadow-ambient hover:saturate-150 transition-all text-sm">
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Analysis
        </button>

        <nav className="space-y-1 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${
                  isActive
                    ? "text-secondary border-l-4 border-secondary bg-surface-container rounded-l-none pl-3"
                    : "text-muted-foreground hover:text-primary hover:bg-surface-container/60"
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button onClick={() => navigate("/profile")} className="flex items-center gap-3 pt-6 hover:opacity-80 text-left">
          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-secondary font-bold">
            {initial}
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-primary">{displayName || "Guest"}</p>
            <p className="text-xs text-muted-foreground">Researcher</p>
          </div>
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 md:ml-64 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-surface/80 backdrop-blur-xl px-6 md:px-12 py-5 flex items-center gap-6">
          <div className="flex-1 max-w-2xl">
            <div className="flex items-center gap-3 bg-surface-low rounded-full px-5 py-3">
              <span className="material-symbols-outlined text-muted-foreground text-[20px]">search</span>
              <input
                type="text"
                value={searchValue ?? ""}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder={searchPlaceholder}
                className="flex-1 bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground"
              />
            </div>
          </div>
          {showTopNav && (
            <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold">
              <a href="/dashboard" className="text-primary">Dashboard</a>
              <a href="/dataset" className="text-muted-foreground hover:text-primary">Datasets</a>
              <a href="/reports" className="text-muted-foreground hover:text-primary">Reports</a>
            </nav>
          )}
          <div className="flex items-center gap-3">
            {rightSlot}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative w-10 h-10 rounded-full hover:bg-surface-low flex items-center justify-center text-muted-foreground">
                  <span className="material-symbols-outlined text-[22px]">notifications</span>
                  {notifCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-destructive" />}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifCount > 0 ? (
                  <DropdownMenuItem onClick={() => navigate("/dataset")}>
                    <div>
                      <p className="text-sm font-semibold">{notifCount} tweets labeled</p>
                      <p className="text-xs text-muted-foreground">In the last 24 hours</p>
                    </div>
                  </DropdownMenuItem>
                ) : (
                  <div className="px-2 py-6 text-center text-sm text-muted-foreground">No new activity</div>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/analysis")}>
                  <span className="material-symbols-outlined text-[18px] mr-2">analytics</span>
                  Run new analysis
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-10 h-10 rounded-full hover:bg-surface-low flex items-center justify-center text-muted-foreground">
                  <span className="material-symbols-outlined text-[22px]">settings</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{displayName || "Account"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <span className="material-symbols-outlined text-[18px] mr-2">person</span>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  <span className="material-symbols-outlined text-[18px] mr-2">dashboard</span>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <span className="material-symbols-outlined text-[18px] mr-2">logout</span>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 px-6 md:px-12 py-8 animate-fade-in">{children}</main>

        <footer className="px-6 md:px-12 py-6 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2024 Flores Tourism Sentiment Thesis</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary">Methodology</a>
            <a href="#" className="hover:text-primary">Privacy</a>
            <a href="#" className="hover:text-primary">API Documentation</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
