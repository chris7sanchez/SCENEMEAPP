'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { esAppInstalada, esEscaparate, INICIO_APP } from '@/lib/modo-app';

/*
 * En la app instalada, una navegacion interna hacia el escaparate (el logo de
 * /creator, el "volver" de /checkout) acaba en la app y no en la portada.
 * La primera carga ya la resuelve el script del <head>; esto cubre las
 * navegaciones que no recargan. Mientras salta, tapa la portada en negro para
 * que no asome. Ver lib/modo-app.ts.
 */
export function ModoApp() {
    const pathname = usePathname();
    const router = useRouter();
    const [instalada, setInstalada] = useState(false);

    useEffect(() => {
        setInstalada(esAppInstalada());
    }, []);

    const saltar = instalada && esEscaparate(pathname);

    useEffect(() => {
        if (saltar) router.replace(INICIO_APP);
    }, [saltar, router]);

    if (!saltar) return null;
    return <div aria-hidden="true" className="fixed inset-0 z-[10060] bg-black" />;
}
