"use client";

type Stage = { id: string; label: string };

export function ProgressStages({
  stages,
  current,
}: {
  stages: Stage[];
  current: string;
}) {
  const idx = stages.findIndex((s) => s.id === current);

  return (
    <ol className="flex gap-2 p-0 list-none w-full">
      {stages.map((s, i) => (
        <li key={s.id} className="flex-1 flex flex-col gap-1">
          <div
            className="h-1 rounded-full transition-all duration-300"
            style={{
              background:
                i <= idx
                  ? "var(--sm-accent, hsl(var(--primary)))"
                  : "var(--sm-border-subtle, hsl(var(--border)))",
            }}
          />
          <span
            className="text-xs transition-colors duration-200"
            style={{
              color:
                i === idx
                  ? "var(--sm-text-primary, hsl(var(--foreground)))"
                  : "var(--sm-text-muted, hsl(var(--muted-foreground)))",
            }}
          >
            {s.label}
          </span>
        </li>
      ))}
    </ol>
  );
}
