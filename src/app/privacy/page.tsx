export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-black text-white p-8 font-sans">
            <div className="max-w-3xl mx-auto space-y-6">
                <h1 className="text-4xl font-bold text-primary mb-8">Política de Privacidad</h1>

                <section className="space-y-4">
                    <p className="text-zinc-400">Última actualización: {new Date().toLocaleDateString()}</p>
                    <p>
                        En <strong>Scene Me</strong> ("nosotros", "nuestro"), accesible desde <strong>scenemeapp.com</strong>, una de nuestras principales prioridades es la privacidad de nuestros visitantes. Este documento de Política de Privacidad contiene tipos de información que recopilamos y registramos y cómo la usamos.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">1. Información que recopilamos</h2>
                    <p className="text-zinc-300">
                        Recopilamos información que nos proporcionas directamente al registrarte, como tu nombre, dirección de correo electrónico y contraseña. También podemos recopilar información sobre tus pedidos de escenas y preferencias de guiones.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">2. Cómo usamos tu información</h2>
                    <ul className="list-disc list-inside text-zinc-300 space-y-2">
                        <li>Para proporcionar, operar y mantener nuestra aplicación.</li>
                        <li>Para mejorar, personalizar y expandir nuestra aplicación.</li>
                        <li>Para entender y analizar cómo utilizas nuestra aplicación.</li>
                        <li>Para desarrollar nuevos productos, servicios, características y funcionalidades.</li>
                        <li>Para comunicarnos contigo, ya sea directamente o a través de uno de nuestros socios, incluso para servicio al cliente.</li>
                        <li>Para enviarte correos electrónicos relacionados con tus pedidos.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">3. Cookies y Web Beacons</h2>
                    <p className="text-zinc-300">
                        Como cualquier otro sitio web, Scene Me utiliza 'cookies'. Estas cookies se utilizan para almacenar información, incluidas las preferencias de los visitantes y las páginas del sitio web a las que el visitante accedió o visitó. La información se utiliza para optimizar la experiencia de los usuarios personalizando el contenido de nuestra página web.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">4. Políticas de privacidad de terceros</h2>
                    <p className="text-zinc-300">
                        La Política de Privacidad de Scene Me no se aplica a otros anunciantes o sitios web. Por lo tanto, te aconsejamos que consultes las respectivas Políticas de Privacidad de estos servidores de anuncios de terceros para obtener información más detallada.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">5. Derechos de protección de datos (RGPD)</h2>
                    <p className="text-zinc-300">
                        Queremos asegurarnos de que eres plenamente consciente de todos tus derechos de protección de datos. Todo usuario tiene derecho a lo siguiente:
                    </p>
                    <ul className="list-disc list-inside text-zinc-300 space-y-2">
                        <li>Derecho de acceso: tienes derecho a solicitar copias de tus datos personales.</li>
                        <li>Derecho de rectificación: tienes derecho a solicitar que corrijamos cualquier información que creas que es inexacta.</li>
                        <li>Derecho de supresión: tienes derecho a solicitar que borremos tus datos personales, bajo ciertas condiciones.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">6. Contacto</h2>
                    <p className="text-zinc-300">
                        Si tienes preguntas adicionales o requieres más información sobre nuestra Política de Privacidad, no dudes en contactarnos a través de nuestro correo electrónico de soporte.
                    </p>
                </section>
            </div>
        </div>
    );
}
