import { useEffect, useState } from "react";
import { destinationFallbackChain } from "@/lib/destination-photos";

type Props = {
  city: string;
  className?: string | undefined;
};

/**
 * Renders a destination photo with an onError cascade:
 * primary city photo → `_b` backup → state photo → generic India →
 * CSS gradient (when every URL fails, so a broken img never shows).
 */
export function DestinationPhoto({ city, className }: Props) {
  const [imgIndex, setImgIndex] = useState(0);
  const fallbackChain = destinationFallbackChain(city);

  // Reset the cascade when the destination changes.
  useEffect(() => {
    setImgIndex(0);
  }, [city]);

  const currentSrc = fallbackChain[imgIndex];

  // If ALL images fail → show CSS gradient
  if (!currentSrc) {
    return (
      <div
        className={className}
        style={{
          background:
            "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        }}
      >
        <span
          style={{
            position: "absolute",
            bottom: 24,
            left: 24,
            color: "white",
            fontSize: 48,
            opacity: 0.15,
            fontWeight: 700,
          }}
        >
          {city}
        </span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={`${city} destination`}
      className={className}
      onError={() => {
        // Try next fallback in chain
        if (imgIndex < fallbackChain.length - 1) {
          setImgIndex((i) => i + 1);
        } else {
          // Force gradient fallback
          setImgIndex(fallbackChain.length);
        }
      }}
      style={{ objectFit: "cover", width: "100%", height: "100%" }}
    />
  );
}
