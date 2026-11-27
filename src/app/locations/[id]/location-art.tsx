import clsx from 'clsx';

/** The game's header picture for a location. */
const SOURCE = { width: 760, height: 127 };

/** The widest strip of that picture that's all scenery, the same one the social card shows. */
const CROP = { left: 230, width: 470, height: 70 };

/**
 * A strip of a location's header art from the game, without the game's own frame.
 *
 * Every header comes in the same frame: a MouseHunt logo on the left and wooden trim sweeping along the bottom
 * and up the right. The frame is identical on all of them, so one crop from the top of the picture clears it.
 */
export function LocationArt({ src, className }: { src: string; className?: string }) {
  return (
    <div
      className={clsx('relative overflow-hidden rounded-lg ring-1 ring-zinc-950/5 dark:ring-white/10', className)}
      style={{ aspectRatio: `${CROP.width} / ${CROP.height}` }}
    >
      {/* The whole picture, scaled and slid so only its crop is inside the box. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        width={SOURCE.width}
        height={SOURCE.height}
        className="absolute top-0 max-w-none"
        style={{
          left: `${(-CROP.left / CROP.width) * 100}%`,
          width: `${(SOURCE.width / CROP.width) * 100}%`,
        }}
      />
    </div>
  );
}
