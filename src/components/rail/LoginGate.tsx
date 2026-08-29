import { useState } from "react";
import { haptic } from "@/lib/haptics";
import { Lock } from "lucide-react";
import logo from "@/assets/railex-logo.png.asset.json";

export const LOGIN_KEY = "rail.auth.v1";

const ID = "AEOS";
const PASSWORD = "Buildwhatmovesindia";

/** Demo-only gate: a single shared demo credential, no accounts or backend. */
export function LoginGate({ onSuccess }: { onSuccess: () => void }) {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (id.trim().toUpperCase() === ID && password === PASSWORD) {
      window.localStorage.setItem(LOGIN_KEY, "1");
      haptic("success");
      onSuccess();
      return;
    }
    haptic("error");
    setError(true);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-5 text-foreground">
      <div aria-hidden className="pointer-events-none fixed inset-0 bg-atmosphere" />
      <section className="liquid-panel reveal relative z-10 w-full max-w-sm rounded-2xl p-6 shadow-(--shadow-lift)">
        <img src={logo.url} alt="RaileX" className="mx-auto h-8 w-auto dark:brightness-0 dark:invert" />
        <p className="mt-2 text-center text-xs text-muted-foreground">Sign in to continue to the booking simulation</p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <input
            value={id}
            onChange={(e) => { setId(e.target.value); setError(false); }}
            placeholder="ID"
            aria-label="ID"
            autoFocus
            className="form-field w-full"
          />
          <input
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            type="password"
            placeholder="Password"
            aria-label="Password"
            className="form-field w-full"
          />
          {error && <p className="text-xs text-danger">Incorrect ID or password.</p>}
          <div className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">Demo credentials</span>
            <br />ID: <span className="font-mono text-foreground">{ID}</span>
            <br />Password: <span className="font-mono text-foreground">{PASSWORD}</span>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button type="submit" className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              <Lock className="size-3.5" /> Login
            </button>
            <button type="button" disabled aria-disabled className="flex cursor-not-allowed flex-col items-center text-[10px] leading-tight text-muted-foreground/60">
              <span>Sign up</span>
              <span className="text-[9px]">Coming soon</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
