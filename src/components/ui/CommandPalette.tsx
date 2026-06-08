"use client";

import { useEffect, useState, useCallback } from "react";
import { Search } from "lucide-react";

type Cmd = { id: string; label: string; run: () => void; group?: string };

export function CommandPalette({ commands }: { commands: Cmd[] }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      setOpen((v) => !v);
    }
    if (e.key === "Escape") setOpen(false);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!open) return null;

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(q.toLowerCase())
  );

  // Agrupar por group
  const groups = filtered.reduce<Record<string, Cmd[]>>((acc, cmd) => {
    const g = cmd.group || "General";
    if (!acc[g]) acc[g] = [];
    acc[g].push(cmd);
    return acc;
  }, {});

  return (
    <div
      onClick={() => setOpen(false)}
      className="fixed inset-0 z-[1000] flex items-start justify-center pt-24"
      style={{
        background: "var(--sm-bg-overlay, rgba(0,0,0,0.6))",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[min(640px,92vw)] rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
        style={{ background: "var(--sm-bg-surface, #151A24)" }}
      >
        {/* Barra de búsqueda */}
        <div className="flex items-center gap-3 px-4 border-b border-white/10">
          <Search className="w-4 h-4 text-white/40 shrink-0" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar comando..."
            className="w-full py-4 bg-transparent text-white text-base outline-none placeholder:text-white/40"
          />
          <kbd className="hidden sm:inline-flex text-[10px] text-white/30 bg-white/5 px-2 py-1 rounded border border-white/10 font-mono">
            ESC
          </kbd>
        </div>

        {/* Resultados */}
        <ul className="list-none m-0 p-0 max-h-80 overflow-y-auto">
          {Object.entries(groups).map(([group, cmds]) => (
            <li key={group}>
              <div className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-widest text-white/30 font-bold">
                {group}
              </div>
              {cmds.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    c.run();
                    setOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white
                             transition-colors cursor-pointer flex items-center gap-2"
                >
                  {c.label}
                </button>
              ))}
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-white/30">
              Sin resultados
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
