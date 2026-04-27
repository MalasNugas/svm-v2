import { useState } from "react";
import { useNavigate } from "react-router-dom";
import heroImg from "@/assets/login-hero.jpg";

export default function Login() {
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire to /api/auth/login via src/lib/api.ts when Express is ready
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Hero */}
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
            <div className="mt-12 flex items-center gap-4 text-[11px] tracking-[0.25em] uppercase text-white/70">
              <span>Sentiment Thesis 2024</span>
              <span className="w-12 h-px bg-white/40" />
              <span>Labuan Bajo Ecosystem</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
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
            {mode === "login"
              ? "Access the researcher dashboard to continue your analysis."
              : "Join the thesis platform to start curating sentiment insights."}
          </p>

          <form onSubmit={onSubmit} className="mt-10 space-y-6">
            <div>
              <label className="text-[11px] font-bold tracking-[0.18em] uppercase text-muted-foreground">Email Address</label>
              <input
                type="email"
                required
                placeholder="researcher@thesis.edu"
                className="mt-2 w-full bg-transparent border-0 border-b border-border focus:border-secondary focus:ring-0 outline-none py-3 text-primary placeholder:text-muted-foreground/60"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold tracking-[0.18em] uppercase text-muted-foreground">Password</label>
                <button type="button" className="text-[11px] font-bold tracking-[0.18em] uppercase text-secondary">Forgot?</button>
              </div>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="mt-2 w-full bg-transparent border-0 border-b border-border focus:border-secondary focus:ring-0 outline-none py-3 pr-10 text-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-0 bottom-3 text-muted-foreground"
                >
                  <span className="material-symbols-outlined text-[20px]">{showPwd ? "visibility" : "visibility_off"}</span>
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" className="rounded border-border text-secondary focus:ring-secondary" />
              Keep me logged in for this session
            </label>

            <button
              type="submit"
              className="w-full py-4 gradient-primary text-primary-foreground rounded-xl font-bold text-sm shadow-ambient hover:saturate-150 transition-all"
            >
              {mode === "login" ? "Login to Dashboard" : "Create Researcher Account"}
            </button>

            <div className="flex items-center gap-4">
              <span className="flex-1 h-px bg-border" />
              <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-muted-foreground">or institutional access</span>
              <span className="flex-1 h-px bg-border" />
            </div>

            <button
              type="button"
              className="w-full py-4 bg-surface-low rounded-xl font-bold text-primary flex items-center justify-center gap-2 hover:bg-surface-container transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">account_balance</span>
              University Login
            </button>

            <p className="text-center text-sm text-muted-foreground">
              {mode === "login" ? "New to Flores Insight? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="font-bold text-primary"
              >
                {mode === "login" ? "Register Account" : "Sign In"}
              </button>
            </p>
          </form>
        </div>

        <div className="mt-10 flex flex-wrap justify-between gap-4 text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
          <span>© 2024 Flores Tourism Sentiment Thesis</span>
          <div className="flex gap-6">
            <a href="#">Methodology</a>
            <a href="#">Privacy</a>
          </div>
        </div>
      </div>
    </div>
  );
}
