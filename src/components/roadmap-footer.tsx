import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function RoadmapFooter() {
    return (
        <footer id="help" className="w-full">
            <Card className="mt-8 rounded-sm bg-card text-card-foreground">
                <CardHeader>
                    <CardTitle className="text-lg">Hoja de ruta de desarrollo (resumida)</CardTitle>
                </CardHeader>
                <CardContent>
                    <ol className="list-decimal ml-5 space-y-2 text-sm text-muted-foreground">
                        <li>MVP: Esta UI + API de generación de guiones (Genkit/Firebase) + base de datos de solicitudes (Firestore).</li>
                        <li>Presupuestos detallados: desglose dinámico (equipo, ubicación, material), añadir IVA, códigos promocionales.</li>
                        <li>Programación: integración con Google/Apple Calendar, selector de franjas horarias, notificaciones por email/WhatsApp.</li>
                        <li>Control de calidad: plantillas de cinematografía (lista de planos, lentes, sonido), checklist de plató.</li>
                        <li>Portal de cliente y rodaje: subida de rushes, selección de tomas, feedback con código de tiempo, seguimiento de edición.</li>
                        <li>Marketplace: mercado de actores y equipos, valoraciones, depósito/Stripe.</li>
                    </ol>
                </CardContent>
            </Card>
        </footer>
    );
}
