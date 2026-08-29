import { useEffect, useMemo, useRef, useState } from "react";
import { STATION_GROUPS } from "@/lib/rail-data";
import { haptic } from "@/lib/haptics";

export type DialItem =
  | { kind: "header"; label: string }
  | { kind: "item"; name: string; code: string; city: string };

export function buildDialItems(query: string): DialItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const out: DialItem[] = [];
  for (const g of STATION_GROUPS) {
    const matches =
      g.city.toLowerCase().includes(q) || g.label.toLowerCase().includes(q)
        ? g.items
        : g.items.filter(
            (i) => i.name.toLowerCase().includes(q) || i.code.toLowerCase().includes(q),
          );
    if (!matches.length) continue;
    out.push({ kind: "header", label: g.label });
    for (const m of matches) out.push({ kind: "item", ...m, city: g.city });
  }
  return out;
}

type Props = {
  query: string;
  onSelect: (item: Extract<DialItem, { kind: "item" }>) => void;
};

const ROW = 44;

export function DialAutocomplete({ query, onSelect }: Props) {
  const items = useMemo(() => buildDialItems(query), [query]);
  const [index, setIndex] = useState(0);
  const touchY = useRef<number | null>(null);

  const moveSelection = (dir: number) => {
    haptic.throttledSelection();
    setIndex((cur) => {
      const pos = selectableIndexes.indexOf(cur);
      const next = Math.min(Math.max(pos + dir, 0), selectableIndexes.length - 1);
      return selectableIndexes[next] ?? cur;
    });
  };

  const selectableIndexes = useMemo(
    () => items.map((it, i) => (it.kind === "item" ? i : -1)).filter((i) => i >= 0),
    [items],
  );

  useEffect(() => {
    setIndex(selectableIndexes[0] ?? 0);
  }, [query, selectableIndexes]);

  useEffect(() => {
    if (!items.length) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        moveSelection(1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        moveSelection(-1);
      } else if (e.key === "Enter") {
        const it = items[index];
        if (it && it.kind === "item") onSelect(it);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [items, index, selectableIndexes, onSelect]);

  if (!items.length) return null;

  return (
    <div
      className="reveal relative mx-auto h-[220px] w-full max-w-md touch-none select-none overflow-hidden overscroll-contain"
      style={{
        maskImage: "linear-gradient(to bottom, transparent, black 22%, black 78%, transparent)",
      }}
      role="listbox"
      aria-label="Destination suggestions"
      onWheel={(event) => {
        event.preventDefault();
        haptic.throttledSelection();
        setIndex((current) => {
          const position = selectableIndexes.indexOf(current);
          const next = Math.min(
            Math.max(position + (event.deltaY > 0 ? 1 : -1), 0),
            selectableIndexes.length - 1,
          );
          return selectableIndexes[next] ?? current;
        });
      }}
      onTouchStart={(event) => { touchY.current = event.touches[0]?.clientY ?? null; }}
      onTouchMove={(event) => {
        const y = event.touches[0]?.clientY;
        if (touchY.current === null || y === undefined) return;
        const delta = touchY.current - y;
        if (Math.abs(delta) < 24) return;
        moveSelection(delta > 0 ? 1 : -1);
        touchY.current = y;
      }}
      onTouchEnd={() => { touchY.current = null; }}
    >
      <div
        className="absolute left-0 right-0 top-1/2 transition-transform duration-300 ease-out"
        style={{ transform: `translateY(${-index * ROW - ROW / 2}px)` }}
      >
        {items.map((it, i) => {
          const dist = Math.abs(i - index);
          const opacity = Math.max(0.18, 1 - dist * 0.32);
          const scale = i === index ? 1.06 : 1 - Math.min(dist * 0.05, 0.16);
          if (it.kind === "header") {
            return (
              <div
                key={`h-${it.label}-${i}`}
                className="flex h-11 items-center justify-center gap-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
                style={{ opacity: opacity * 0.8 }}
              >
                <span className="h-px w-6 bg-border" />
                {it.label}
                <span className="h-px w-6 bg-border" />
              </div>
            );
          }
          const active = i === index;
          return (
            <button
              key={`${it.code}-${i}`}
              type="button"
              role="option"
              aria-selected={active}
              onMouseEnter={() => setIndex(i)}
              onClick={() => onSelect(it)}
              className="flex h-11 w-full items-center justify-center gap-2 text-center transition-all duration-200"
              style={{ opacity, transform: `scale(${scale})` }}
            >
              <span
                className={
                  active
                    ? "text-base font-semibold text-foreground"
                    : "text-sm font-medium text-foreground/80"
                }
              >
                {it.name}
              </span>
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground">
                {it.code}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
