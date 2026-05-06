import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import heroImg from "@/assets/login-hero.jpg";
import { auth } from "@/lib/api";

export default function Login() {
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await auth.signIn(email, password);
        if (error) throw error;
        toast.success("Welcome back");
        navigate("/dashboard");
      } else {
        const { error } = await auth.signUp(email, password, name);
        if (error) throw error;
        toast.success("Account created — please check your email if confirmation is required.");
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img src={heroImg} alt="Flores paradise" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
        <div className="relative h-full flex flex-col p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary-container">trending_up</span>
            </div>
            <span className="font-headline font-bold text-xl">Flores Insight</span>
          </div>
          <div className="mt-auto">
            <h1 className="font-headline text-5xl xl:text-6xl font-extrabold leading-[1.05] tracking-tight">
              Deciphering the<br />Pulse of Paradise.
            </h1>
            <p className="mt-6 text-white/80 max-w-md leading-relaxed">
              The Cognitive Curator for social media sentiment, transforming regional tourism data into academic and professional excellence.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col bg-surface px-6 py-10 lg:px-20 lg:py-16">
        <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto">
          <div className="flex items-center gap-2 mb-6 text-secondary text-xs tracking-[0.2em] font-bold uppercase">
            <span className="material-symbols-outlined text-[18px]">monitoring</span>
            Social Media Sentiment Analysis
          </div>
          <h2 className="font-headline text-4xl font-extrabold text-primary">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {mode === "login" ? "Access the researcher dashboard to continue your analysis." : "Join the thesis platform to start curating sentiment insights."}
          </p>

          <form onSubmit={onSubmit} className="mt-10 space-y-6">
            {mode === "register" && (
              <div>
                <label className="text-[11px] font-bold tracking-[0.18em] uppercase text-muted-foreground">Display Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
                  className="mt-2 w-full bg-transparent border-0 border-b border-border focus:border-secondary outline-none py-3 text-primary placeholder:text-muted-foreground/60" />
              </div>
            )}
            <div>
              <label className="text-[11px] font-bold tracking-[0.18em] uppercase text-muted-foreground">Email Address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="researcher@thesis.edu"
                className="mt-2 w-full bg-transparent border-0 border-b border-border focus:border-secondary outline-none py-3 text-primary placeholder:text-muted-foreground/60" />
            </div>
            <div>
              <label className="text-[11px] font-bold tracking-[0.18em] uppercase text-muted-foreground">Password</label>
              <div className="relative">
                <input type={showPwd ? "text" : "password"} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                  className="mt-2 w-full bg-transparent border-0 border-b border-border focus:border-secondary outline-none py-3 pr-10 text-primary" />
                <button type="button" onClick={() => setShowPwd(s => !s)} className="absolute right-0 bottom-3 text-muted-foreground">
                  <span className="material-symbols-outlined text-[20px]">{showPwd ? "visibility" : "visibility_off"}</span>
                </button>
              </div>
            </div>
            <button type="submit" disabled={busy}
              className="w-full py-4 gradient-primary text-primary-foreground rounded-xl font-bold text-sm shadow-ambient hover:saturate-150 transition-all disabled:opacity-60">
              {busy ? "Please wait..." : mode === "login" ? "Login to Dashboard" : "Create Researcher Account"}
            </button>
            <p className="text-center text-sm text-muted-foreground">
              {mode === "login" ? "New to Flores Insight? " : "Already have an account? "}
              <button type="button" onClick={() => setMode(mode === "login" ? "register" : "login")} className="font-bold text-primary">
                {mode === "login" ? "Register Account" : "Sign In"}
              </button>
            </p>
          </form>
        </div>

        <div className="mt-10 flex flex-wrap justify-between gap-4 text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
          <span>© 2024 Flores Tourism Sentiment Thesis</span>
        </div>
      </div>
    </div>
  );
}
