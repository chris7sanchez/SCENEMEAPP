export default function TermsPage() {
    return (
        <div className="min-h-screen bg-black text-white p-8 font-sans">
            <div className="max-w-3xl mx-auto space-y-6">
                <h1 className="text-4xl font-bold text-primary mb-8">Términos y Condiciones</h1>

                <section className="space-y-4">
                    <p className="text-zinc-400">Última actualización: {new Date().toLocaleDateString()}</p>
                    <p>
                        ¡Bienvenido a <strong>Scene Me</strong>! Estos términos y condiciones describen las reglas y regulaciones para el uso del sitio web de Scene Me, ubicado en <strong>scenemeapp.com</strong>.
                    </p>
                    <p className="text-zinc-300">
                        Al acceder a este sitio web, asumimos que aceptas estos términos y condiciones. No continúes usando Scene Me si no estás de acuerdo con todos los términos y condiciones establecidos en esta página.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">1. Licencia</h2>
                    <p className="text-zinc-300">
                        A menos que se indique lo contrario, Scene Me y/o sus licenciantes poseen los derechos de propiedad intelectual de todo el material en Scene Me. Todos los derechos de propiedad intelectual están reservados. Puedes acceder a esto desde Scene Me para tu uso personal sujeto a las restricciones establecidas en estos términos y condiciones.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">2. Uso del Servicio</h2>
                    <ul className="list-disc list-inside text-zinc-300 space-y-2">
                        <li>No debes volver a publicar material de Scene Me.</li>
                        <li>No debes vender, alquilar o sublicenciar material de Scene Me.</li>
                        <li>No debes reproducir, duplicar o copiar material de Scene Me.</li>
                        <li>No debes redistribuir contenido de Scene Me.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">3. Pedidos y Pagos</h2>
                    <p className="text-zinc-300">
                        Al realizar un pedido a través de Scene Me, aceptas pagar el precio indicado por el servicio seleccionado. Nos reservamos el derecho de rechazar o cancelar cualquier pedido por cualquier motivo, incluyendo errores en el precio o disponibilidad del servicio.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">4. Cancelaciones y Reembolsos</h2>
                    <p className="text-zinc-300">
                        Las políticas de cancelación y reembolso se detallan en el momento de la compra. Por favor, revisa cuidadosamente los detalles de tu pedido antes de confirmar el pago.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">5. Limitación de responsabilidad</h2>
                    <p className="text-zinc-300">
                        En ningún caso Scene Me, ni sus directores, empleados, socios, agentes, proveedores o afiliados, serán responsables por daños indirectos, incidentales, especiales, consecuentes o punitivos, incluyendo, sin limitación, pérdida de beneficios, datos, uso, buena voluntad u otras pérdidas intangibles, resultantes de tu acceso o uso o la imposibilidad de acceder o usar el servicio.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">6. Cambios en los Términos</h2>
                    <p className="text-zinc-300">
                        Nos reservamos el derecho, a nuestra sola discreción, de modificar o reemplazar estos Términos en cualquier momento. Si una revisión es material, intentaremos proporcionar un aviso de al menos 30 días antes de que entren en vigor los nuevos términos.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">7. Contacto</h2>
                    <p className="text-zinc-300">
                        Si tienes alguna pregunta sobre estos Términos, por favor contáctanos.
                    </p>
                </section>
            </div>
        </div>
    );
}
