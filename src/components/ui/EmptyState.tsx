import { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  hint,
  cta,
}: {
  icon?: ReactNode;
  title: string;
  hint?: string;
  cta?: ReactNode;
}) {
  return (
    <div className="sm-fade-in text-center py-12 px-6 text-muted-foreground">
      <div className="text-5xl mb-3">{icon ?? "✦"}</div>
      <h3 className="text-foreground font-bold text-lg mb-0 sm-display">
        {title}
      </h3>
      {hint && <p className="mt-2 text-sm">{hint}</p>}
      {cta && <div className="mt-5">{cta}</div>}
    </div>
  );
}
