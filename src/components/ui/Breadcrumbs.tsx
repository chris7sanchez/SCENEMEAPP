import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav
      className="sticky top-0 z-10 px-4 py-2.5 text-xs text-muted-foreground
                 border-b border-white/5 flex items-center gap-1 flex-wrap"
      style={{
        background: "var(--sm-bg-overlay, rgba(0,0,0,0.7))",
        backdropFilter: "blur(12px)",
      }}
    >
      {items.map((it, i) => (
        <span key={i} className="inline-flex items-center gap-1">
          {it.href ? (
            <Link
              href={it.href}
              className="text-white/60 hover:text-white transition-colors"
            >
              {it.label}
            </Link>
          ) : (
            <span className="text-white/90 font-medium">{it.label}</span>
          )}
          {i < items.length - 1 && (
            <ChevronRight className="w-3 h-3 text-white/20" />
          )}
        </span>
      ))}
    </nav>
  );
}
