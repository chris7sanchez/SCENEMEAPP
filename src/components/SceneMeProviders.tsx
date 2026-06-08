"use client";

import { useRouter, usePathname } from "next/navigation";
import { CommandPalette } from "@/components/ui/CommandPalette";

/**
 * Layout-level providers y componentes globales client-side.
 * Se monta en el RootLayout sin reemplazar nada existente.
 */
export function SceneMeProviders({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const commands = [
    { id: "home", label: "Ir a inicio", run: () => router.push("/"), group: "Navegación" },
    { id: "creator", label: "Creator Studio", run: () => router.push("/creator"), group: "Navegación" },
    { id: "admin", label: "Panel Admin", run: () => router.push("/admin"), group: "Navegación" },
    { id: "booking", label: "Reservar sesión", run: () => router.push("/booking"), group: "Navegación" },
    { id: "astro", label: "Astro Lab", run: () => router.push("/astro-lab"), group: "Astrología" },
    { id: "astrologia", label: "Astrología", run: () => router.push("/astrologia"), group: "Astrología" },
    { id: "exquisit", label: "Exquisit Lab", run: () => router.push("/exquisit"), group: "Labs" },
    { id: "alquimia", label: "Alquimia", run: () => router.push("/alquimia"), group: "Labs" },
    { id: "hub", label: "Hub", run: () => router.push("/hub"), group: "Navegación" },
    { id: "talents", label: "Talents", run: () => router.push("/talents"), group: "Navegación" },
  ];

  return (
    <>
      {children}
      <CommandPalette commands={commands} />
    </>
  );
}
