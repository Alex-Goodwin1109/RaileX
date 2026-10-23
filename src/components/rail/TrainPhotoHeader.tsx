import { useState } from "react";
import { TRAIN_PHOTOS, type TrainTypeId } from "@/lib/train-model";

type Props = { type: TrainTypeId };

/** Full-width photo strip of the actual train type, with a safe gradient fallback. */
export function TrainPhotoHeader({ type }: Props) {
  const photo = TRAIN_PHOTOS[type];
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative h-[140px] w-full overflow-hidden rounded-xl bg-gradient-to-br from-muted to-background sm:h-[180px]">
      {!failed ? (
        <img
          src={photo.url}
          alt={photo.label}
          loading="lazy"
          onError={() => setFailed(true)}
          className="size-full object-cover object-center"
        />
      ) : (
        <div className="grid size-full place-items-center bg-gradient-to-br from-primary/25 to-background px-4 text-center">
          <span className="text-xl font-semibold sm:text-2xl">{photo.label}</span>
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-3">
        <p className="text-sm font-semibold text-white drop-shadow">{photo.label}</p>
        <p className="text-[11px] text-white/80 drop-shadow">{photo.description}</p>
      </div>
      <span className="absolute right-3 top-3 rounded-full border border-white/30 bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
        {photo.rake}
      </span>
    </div>
  );
}
