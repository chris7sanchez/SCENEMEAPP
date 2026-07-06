"use client";

type Props = {
  onPrompt: (text: string) => void;
  chart?: { sun: string; moon: string; rising: string };
};

const PRESETS = [
  {
    label: "Luna llena cinematográfica",
    build: () =>
      "Cinematic full moon over a calm sea, volumetric light, painterly clouds, golden hour rim",
  },
  {
    label: "Tránsito de Mercurio",
    build: () =>
      "A surreal scene of fast-moving light trails crossing a still city, mercury silver palette, kinetic",
  },
  {
    label: "Eclipse dramático",
    build: () =>
      "Dramatic solar eclipse casting long shadows over an ancient amphitheatre, high contrast, film still, anamorphic lens",
  },
  {
    label: "Saturno y tiempo",
    build: () =>
      "An old clocktower in a foggy landscape, Saturn's rings reflected in still water, muted earth tones, melancholic",
  },
];

export function AstroScenePrompt({ onPrompt, chart }: Props) {
  // Si hay carta natal, añadir preset personalizado
  const presets = chart
    ? [
        {
          label: `Escena ${chart.sun}`,
          build: () =>
            `A symbolic scene representing the archetype of ${chart.sun}, atmospheric, film still, soft contrast, ${chart.moon} lunar energy`,
        },
        ...PRESETS,
      ]
    : PRESETS;

  return (
    <div className="grid gap-2">
      <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">
        ✦ Prompts Astrológicos
      </p>
      {presets.map((p) => (
        <button
          key={p.label}
          className="sm-press text-left px-3.5 py-2.5 rounded-xl text-sm font-medium
                     border cursor-pointer transition-all duration-200
                     hover:scale-[1.01] active:scale-[0.99]"
          style={{
            background: "var(--sm-astro-gold-soft, rgba(212, 168, 87, 0.14))",
            borderColor: "var(--sm-astro-gold, #D4A857)",
            color: "var(--sm-text-primary, #F1F3F8)",
          }}
          onClick={() => onPrompt(p.build())}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
