import { useEffect, useRef, useState } from "react";
import { Accessibility, Menu, Moon, UserRound, Volume2, VolumeX } from "lucide-react";
import { haptic } from "@/lib/haptics";

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className="relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200"
      style={{ background: on ? "#1565c0" : "#cccccc" }}
    >
      <span
        className="absolute top-0.5 size-4 rounded-full bg-white shadow transition-all duration-200"
        style={{ left: on ? "18px" : "2px" }}
      />
    </button>
  );
}

export function NavMenu({
  dark,
  onDarkChange,
  soundOn,
  onSoundChange,
  a11y,
  onA11yChange,
  onProfile,
}: {
  dark: boolean;
  onDarkChange: (v: boolean) => void;
  soundOn: boolean;
  onSoundChange: (v: boolean) => void;
  a11y: boolean;
  onA11yChange: (v: boolean) => void;
  onProfile: () => void;
}) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrap} className="relative">
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => {
          haptic("selection");
          setOpen((v) => !v);
        }}
        className="grid size-[34px] place-items-center rounded-full border border-border bg-secondary text-foreground transition-colors duration-150 hover:bg-muted"
      >
        <Menu className="size-4" />
      </button>

      {open && (
        <div
          className="nav-menu-in absolute right-0 top-[calc(100%+8px)] z-[70] w-60 rounded-xl border border-border bg-popover py-2 shadow-[0_18px_48px_rgba(0,0,0,0.28)]"
          role="menu"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              haptic("light");
              setOpen(false);
              onProfile();
            }}
            className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-muted"
          >
            <span className="flex items-center gap-2">
              <UserRound aria-hidden className="size-4 text-muted-foreground" /> Profile
            </span>
            <span aria-hidden className="text-muted-foreground">
              ›
            </span>
          </button>

          <div className="my-1.5 h-px bg-border" />

          <div className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
            <span className="flex items-center gap-2">
              <Moon aria-hidden className="size-4 text-muted-foreground" /> Dark mode
            </span>
            <Toggle
              on={dark}
              label="Dark mode"
              onChange={(v) => {
                haptic("selection");
                onDarkChange(v);
              }}
            />
          </div>

          <div className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
            <span className="flex items-center gap-2">
              {soundOn ? <Volume2 aria-hidden className="size-4 text-muted-foreground" /> : <VolumeX aria-hidden className="size-4 text-muted-foreground" />} Sound &amp; haptics
            </span>
            <Toggle
              on={soundOn}
              label="Sound and haptics"
              onChange={(v) => {
                onSoundChange(v);
                if (v) haptic("selection");
              }}
            />
          </div>

          <div className="my-1.5 h-px bg-border" />

          <div className="flex items-start justify-between gap-3 px-4 py-2.5 text-sm">
            <span>
              <span className="flex items-center gap-2">
                <Accessibility aria-hidden className="size-4 text-muted-foreground" /> Accessible mode
              </span>
              <small className="mt-0.5 block text-[11px] text-muted-foreground">
                Larger text · Lower berths preferred
              </small>
            </span>
            <Toggle
              on={a11y}
              label="Accessible mode"
              onChange={(v) => {
                haptic("selection");
                onA11yChange(v);
              }}
            />
          </div>

          <div className="my-1.5 h-px bg-border" />

          <p className="px-4 pt-1 text-center text-[11px] text-muted-foreground">
            ◉ RaileX · Build What Moves India 2025
          </p>
        </div>
      )}
    </div>
  );
}
