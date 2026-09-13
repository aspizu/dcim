/** Layers backdrop blur across its parent and a small margin below it. */
export function ProgressiveBlur() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 -bottom-3 -z-10"
    >
      {[0.5, 1, 2, 4, 8, 16].map((sigma, index) => (
        <div
          key={sigma}
          className="absolute inset-0"
          style={{
            backdropFilter: `blur(${sigma}px)`,
            WebkitBackdropFilter: `blur(${sigma}px)`,
            maskImage: `linear-gradient(to bottom, black ${((5 - index) / 6) * 100}%, transparent ${((6 - index) / 6) * 100}%)`,
            WebkitMaskImage: `linear-gradient(to bottom, black ${((5 - index) / 6) * 100}%, transparent ${((6 - index) / 6) * 100}%)`,
          }}
        />
      ))}
    </div>
  )
}
