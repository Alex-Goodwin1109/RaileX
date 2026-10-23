import { useState } from "react";
import { X } from "lucide-react";
import { haptic } from "@/lib/haptics";
import {
  CHAIR_COLUMNS,
  SLOT_DESCRIPTION,
  SLOT_FILL,
  SLOT_LABEL,
  berthSideLabel,
  chairRows,
  compartmentBerths,
  compartmentOf,
  slotOf,
  type BerthSlot,
} from "@/lib/berth-map";

type Props = {
  coach: string;
  berth: number;
  cls: string;
};

const GOLD = "#FFD700";
const GOLD_STROKE = "#b8860b";

/** Geometry for the 6 + 2 berth compartment, viewBox 0 0 340 280. */
const BAY: Record<BerthSlot, { x: number; y: number; w: number; h: number }> = {
  "upper-left": { x: 40, y: 18, w: 108, h: 44 },
  "middle-left": { x: 40, y: 70, w: 108, h: 44 },
  "lower-left": { x: 40, y: 122, w: 108, h: 44 },
  "upper-right": { x: 192, y: 18, w: 108, h: 44 },
  "middle-right": { x: 192, y: 70, w: 108, h: 44 },
  "lower-right": { x: 192, y: 122, w: 108, h: 44 },
  "side-lower": { x: 40, y: 190, w: 260, h: 36 },
  "side-upper": { x: 40, y: 234, w: 260, h: 36 },
};

const LEGEND = [
  { chip: "🟩", label: "Lower — easiest access" },
  { chip: "🟦", label: "Middle" },
  { chip: "🟥", label: "Upper — requires climbing" },
  { chip: "🟨", label: "Side Lower" },
  { chip: "🟪", label: "Side Upper" },
];

export function BerthMapSheet({ coach, berth, cls }: Props) {
  const [open, setOpen] = useState(false);
  const chair = cls === "CC" || cls === "EC";
  const slot = slotOf(berth);
  const typeLabel = chair ? "Seat" : SLOT_LABEL[slot];

  return (
    <>
      <button
        type="button"
        onClick={() => {
          haptic.light();
          setOpen(true);
        }}
        className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-primary/40 px-3.5 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
        aria-haspopup="dialog"
      >
        View your seat's accurate location and diagram ↗
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-overlay/80 p-0 backdrop-blur-xl sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Compartment seat map"
          onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <section className="liquid-panel reveal max-h-[90dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-2xl p-5 shadow-(--shadow-lift) sm:rounded-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold">
                  Coach {coach} · {chair ? "Seat" : "Berth"} {berth}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {chair ? "Seating layout" : `Compartment ${compartmentOf(berth)} layout`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close seat map"
                className="rounded-full border border-border p-1.5 text-muted-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4">
              {chair ? <ChairCarSvg seat={berth} /> : <CompartmentSvg berth={berth} />}
            </div>

            {!chair && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {LEGEND.map((l) => (
                  <span
                    key={l.label}
                    className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground"
                  >
                    {l.chip} {l.label}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 rounded-xl border border-border bg-muted/50 p-4 text-sm">
              <p className="font-semibold">
                ★ Your {chair ? "seat" : "berth"}: {typeLabel} {berth}
              </p>
              {chair ? (
                <ChairDetail seat={berth} />
              ) : (
                <>
                  <p className="mt-1 text-xs text-muted-foreground">{berthSideLabel(slot)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {SLOT_DESCRIPTION[slot].join(" · ")}
                  </p>
                </>
              )}
            </div>

            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              Layout is indicative. Actual coach configuration may vary by rake.
            </p>
          </section>
        </div>
      )}
    </>
  );
}

function ChairDetail({ seat }: { seat: number }) {
  const { row, col } = chairRows(seat);
  const window = col === "A" || col === "D";
  return (
    <>
      <p className="mt-1 text-xs text-muted-foreground">
        Row {row} · Seat {col} · {window ? "Window seat" : "Aisle seat"}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {window ? "Great views · Wall to lean on" : "Easy to step out · Quicker service access"}
      </p>
    </>
  );
}

function CompartmentSvg({ berth }: { berth: number }) {
  const comp = compartmentOf(berth);
  const berths = compartmentBerths(comp);

  return (
    <svg viewBox="0 0 340 280" className="w-full" role="img" aria-label={`Compartment ${comp} berth map`}>
      {/* window strips on the outer left edge */}
      {[20, 76, 132].map((y) => (
        <rect key={y} x={14} y={y} width={10} height={40} rx={2} fill="#7cc0ff" opacity={0.8} />
      ))}
      <text
        x={10}
        y={95}
        fontSize="9"
        fill="#7a7a7a"
        textAnchor="middle"
        transform="rotate(-90 10 95)"
        letterSpacing="1"
      >
        WINDOW
      </text>

      {/* aisle */}
      <line
        x1={170}
        y1={14}
        x2={170}
        y2={172}
        stroke="#bbbbbb"
        strokeWidth={1}
        strokeDasharray="5 4"
      />
      <text x={170} y={182} fontSize="9" fill="#8a8a8a" textAnchor="middle">
        Aisle
      </text>

      {berths.map(({ slot, number }) => {
        const g = BAY[slot];
        const mine = number === berth;
        return (
          <g key={slot}>
            <rect
              x={g.x}
              y={g.y}
              width={g.w}
              height={g.h}
              rx={4}
              fill={mine ? GOLD : SLOT_FILL[slot]}
              stroke={mine ? GOLD_STROKE : "#cccccc"}
              strokeWidth={mine ? 2 : 1}
            />
            <text
              x={g.x + g.w / 2}
              y={g.y + g.h / 2 + 4}
              fontSize="13"
              textAnchor="middle"
              fill={mine ? "#000000" : "#4a4a4a"}
              fontWeight={mine ? 700 : 400}
            >
              {number}
            </text>
            <text
              x={g.x + 8}
              y={g.y + 14}
              fontSize="8"
              fill="#7a7a7a"
            >
              {SLOT_LABEL[slot]}
            </text>
            {mine && (
              <text x={g.x + g.w - 8} y={g.y + 14} fontSize="11" textAnchor="end" fill="#b8860b">
                ★
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function ChairCarSvg({ seat }: { seat: number }) {
  const { rows } = chairRows(seat);
  const seatW = 52;
  const seatH = 34;
  const xFor = (i: number) => 46 + i * (seatW + 8) + (i >= 2 ? 26 : 0);

  return (
    <svg viewBox="0 0 340 280" className="w-full" role="img" aria-label="Chair car seat map">
      <text x={xFor(0) + seatW / 2} y={16} fontSize="9" fill="#8a8a8a" textAnchor="middle">
        WINDOW
      </text>
      <text x={170} y={16} fontSize="9" fill="#8a8a8a" textAnchor="middle">
        AISLE
      </text>
      <text x={xFor(3) + seatW / 2} y={16} fontSize="9" fill="#8a8a8a" textAnchor="middle">
        WINDOW
      </text>
      <line x1={170} y1={24} x2={170} y2={268} stroke="#bbbbbb" strokeWidth={1} strokeDasharray="5 4" />

      {rows.map((row, r) => {
        const y = 30 + r * (seatH + 12);
        return (
          <g key={row}>
            <text x={22} y={y + seatH / 2 + 4} fontSize="11" fill="#8a8a8a" textAnchor="middle">
              {row}
            </text>
            {CHAIR_COLUMNS.map((col, i) => {
              const num = (row - 1) * 4 + i + 1;
              const mine = num === seat;
              return (
                <g key={col}>
                  <rect
                    x={xFor(i)}
                    y={y}
                    width={seatW}
                    height={seatH}
                    rx={6}
                    fill={mine ? GOLD : "#eef2f6"}
                    stroke={mine ? GOLD_STROKE : "#cccccc"}
                    strokeWidth={mine ? 2 : 1}
                  />
                  <text
                    x={xFor(i) + seatW / 2}
                    y={y + seatH / 2 + 4}
                    fontSize="11"
                    textAnchor="middle"
                    fill={mine ? "#000000" : "#4a4a4a"}
                    fontWeight={mine ? 700 : 400}
                  >
                    {row}
                    {col}
                  </text>
                  {mine && (
                    <text x={xFor(i) + seatW - 4} y={y + 11} fontSize="10" textAnchor="end" fill="#b8860b">
                      ★
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
