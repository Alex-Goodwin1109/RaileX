/** Slim top banner shown while the device is offline; slides up when connection returns. */
export function OfflineBanner({ online }: { online: boolean }) {
  return (
    <div
      aria-live="polite"
      className={`pointer-events-none fixed inset-x-0 top-0 z-[70] flex justify-center transition-all duration-500 ease-out ${
        online ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="w-full bg-warning/90 px-4 py-1.5 text-center text-[12px] font-medium text-background backdrop-blur-md">
        📶 You're offline · Showing saved journey
      </div>
    </div>
  );
}
