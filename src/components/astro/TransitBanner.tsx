"use client";

export function TransitBanner({
  moon,
  retrogrades,
}: {
  moon: string;
  retrogrades: string[];
}) {
  return (
    <div
      className="px-4 py-2 text-center text-xs font-medium tracking-wide border-b"
      style={{
        background: "var(--sm-astro-gold-soft, rgba(212, 168, 87, 0.14))",
        borderColor: "var(--sm-astro-gold, #D4A857)",
        color: "var(--sm-text-primary, #F1F3F8)",
      }}
    >
      <span>
        🌙 Luna en <b className="font-bold">{moon}</b>
      </span>
      {retrogrades.length > 0 && (
        <span className="ml-2 opacity-80">
          · ℞ {retrogrades.join(", ")}
        </span>
      )}
    </div>
  );
}
