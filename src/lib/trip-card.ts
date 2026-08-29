export type TripCardData = {
  origin: string;
  destination: string;
  date: string;
  departure: string;
  trainName: string;
  trainNumber: string;
  coach: string;
  berthType: string;
  berthNumber: number;
  pnr: string;
  daysAway: number;
};

const W = 400;
const H = 220;

/**
 * Renders the 400x220 trip card straight onto a canvas.
 * Direct 2D drawing avoids DOM-capture libraries choking on modern CSS colours,
 * so the PNG is always produced.
 */
export async function renderTripCard(data: TripCardData, scale = 2): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.scale(scale, scale);

  // Base
  ctx.fillStyle = "#0c0c0b";
  ctx.fillRect(0, 0, W, H);

  // Diagonal grain
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.03)";
  ctx.lineWidth = 1;
  for (let i = -H; i < W; i += 4) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + H, H);
    ctx.stroke();
  }
  ctx.restore();

  // Orb glow
  ctx.save();
  const cx = W - 40 + 55;
  const cy = H - 50 + 45;
  const glow = ctx.createRadialGradient(cx - 30, cy - 30, 8, cx, cy, 100);
  glow.addColorStop(0, "rgba(255,138,61,0.9)");
  glow.addColorStop(0.35, "rgba(255,106,0,0.75)");
  glow.addColorStop(0.75, "rgba(34,211,238,0.45)");
  glow.addColorStop(1, "rgba(12,12,11,0)");
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, 100, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const sans = "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif";

  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#ffffff";
  ctx.font = `600 14px ${sans}`;
  ctx.fillText("RaileX", 20, 32);

  ctx.fillStyle = "#8b8b86";
  ctx.font = `12px ${sans}`;
  ctx.textAlign = "right";
  ctx.fillText(data.trainNumber, W - 20, 32);
  ctx.textAlign = "left";

  ctx.fillStyle = "#ffffff";
  ctx.font = `600 24px ${sans}`;
  ctx.fillText(`${data.origin} → ${data.destination}`, 20, 92);

  ctx.fillStyle = "#c9c9c2";
  ctx.font = `12px ${sans}`;
  ctx.fillText(`${data.date} · ${data.departure}`, 20, 116);
  ctx.fillText(data.trainName, 20, 136);
  ctx.fillText(
    `Coach ${data.coach} · ${data.berthType} Berth ${data.berthNumber}`,
    20,
    156,
  );

  ctx.fillStyle = "#8b8b86";
  ctx.font = `11px ui-monospace, SFMono-Regular, monospace`;
  ctx.fillText(`PNR: ${data.pnr}`, 20, H - 18);

  ctx.fillStyle = "#c9c9c2";
  ctx.font = `11px ${sans}`;
  ctx.textAlign = "right";
  ctx.fillText(
    data.daysAway > 0 ? `Journey begins in ${data.daysAway} days` : "Journey begins today",
    W - 20,
    H - 18,
  );

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Could not encode the card");
  return blob;
}
