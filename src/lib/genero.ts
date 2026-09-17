// ¿ES HOMBRE O MUJER? Lo justo para no repartir las voces al azar.
//
// Al abrir un guion de ocho personajes, las voces se repartían por orden de
// lista: al primero la primera, al segundo la segunda. Así que MARÍA salía con
// voz de hombre y el PADRE con voz de niña, y había que arreglarlo a mano ocho
// veces antes de poder ensayar.
//
// No hace falta acertar siempre: basta con acertar casi siempre y dejarlo
// cambiar de un clic. Se mira, por este orden:
//
//   1. El PAPEL, que muchas veces lo dice todo: MADRE, PADRE, CAMARERA, REY.
//   2. Una lista de NOMBRES corrientes en castellano y en inglés.
//   3. La terminación, que en castellano es buena pista: -A mujer, -O hombre.
//
// Y una lista de los que NO se sabe (POLICÍA, PERIODISTA, JOVEN), que sirve
// para UNA cosa muy concreta: frenar la regla de la terminación, para que no se
// invente que el POLICÍA es una mujer. No descarta el nombre entero — si lo
// hiciera, "VOZ DE HOMBRE" se quedaría sin género por empezar por VOZ.

import { claveDePersonaje } from './personajes';

export type Genero = 'f' | 'm' | null;

const conjunto = (s: string) => new Set(s.trim().split(/\s+/));

/** Papeles y parentescos que ya dicen el género. */
const PAPELES_F = conjunto(`
MADRE MAMA MAMI MADRASTRA SUEGRA ABUELA BISABUELA HIJA NIETA HERMANA HERMANITA
TIA SOBRINA PRIMA NUERA CUNADA ESPOSA MUJER SENORA SRA DONA DAMA VIUDA NOVIA
AMIGA VECINA CHICA MUCHACHA NINA JOVENCITA SENORITA SRTA ANCIANA
REINA PRINCESA CONDESA DUQUESA MARQUESA ALCALDESA
DOCTORA DRA ENFERMERA PROFESORA MAESTRA CAMARERA SECRETARIA AZAFATA
ABOGADA JUEZA MEDICA PSICOLOGA DIRECTORA JEFA ACTRIZ BAILARINA
MONJA BRUJA REPORTERA DEPENDIENTA CAJERA PELUQUERA CRIADA SIRVIENTA
FEMENINA FEMENINO HEMBRA
MOTHER MOM MUM MOMMY MUMMY DAUGHTER GRANDMOTHER GRANDMA SISTER AUNT NIECE
WIFE WIDOW GIRLFRIEND GIRL LADY WOMAN MRS MISS MS MADAM QUEEN PRINCESS
WAITRESS ACTRESS NUN
`);

const PAPELES_M = conjunto(`
PADRE PAPA PAPI PADRASTRO SUEGRO ABUELO BISABUELO HIJO NIETO HERMANO HERMANITO
TIO SOBRINO PRIMO YERNO CUNADO ESPOSO MARIDO HOMBRE SENOR SR DON CABALLERO
VIUDO NOVIO AMIGO VECINO CHICO MUCHACHO NINO CHAVAL ANCIANO
REY PRINCIPE CONDE DUQUE MARQUES ALCALDE
DOCTOR DR ENFERMERO PROFESOR MAESTRO CAMARERO SECRETARIO
ABOGADO JUEZ MEDICO PSICOLOGO DIRECTOR JEFE ACTOR BAILARIN
CURA SACERDOTE OBISPO FRAILE MONJE REPORTERO CAJERO PELUQUERO
CAPITAN SARGENTO SOLDADO CORONEL CHOFER PORTERO MAYORDOMO
MASCULINA MASCULINO VARON
FATHER DAD DADDY SON GRANDFATHER GRANDPA BROTHER UNCLE NEPHEW
HUSBAND WIDOWER BOYFRIEND BOY GENTLEMAN MAN MR SIR KING PRINCE
WAITER PRIEST
`);

/**
 * Palabras que NO dicen el género por mucho que acaben en -A o en -O.
 * Sin esta lista, la regla de la terminación convierte al POLICÍA en mujer y
 * al TESTIGO en hombre, y las dos cosas están sin saber.
 */
const AMBIGUOS = conjunto(`
POLICIA GUARDIA PERIODISTA ESTUDIANTE RECEPCIONISTA TAXISTA ARTISTA CANTANTE
PACIENTE CLIENTE AGENTE TENIENTE CONSERJE GERENTE ASISTENTE PRESIDENTE
DEPENDIENTE ADOLESCENTE JOVEN VOZ NARRADOR NARRADORA PERSONA GENTE TODOS TODAS
AMBOS AMBAS TESTIGO VICTIMA COLEGA GUIA PILOTO MODELO PROFESIONAL
SOMBRA FIGURA SILUETA MULTITUD CORO PUBLICO
POLICE NURSE TEACHER STUDENT DRIVER GUARD VOICE NARRATOR CROWD SOMEONE
`);

/** Nombres de mujer corrientes en castellano y en inglés. */
const NOMBRES_F = conjunto(`
ADRIANA AGATA AGUEDA AIDA AINHOA ALBA ALEJANDRA ALICE ALICIA ALMA ALMUDENA
AMALIA AMANDA AMELIA AMPARO ANA ANABEL ANDREA ANGELA ANGELES ANGELICA ANITA
ANNA ANNE ANTONIA ARACELI ARIADNA ASHLEY ASUNCION AURORA BARBARA BEATRICE
BEATRIZ BEGONA BELEN BELLA BERTA BETTY BLANCA BRENDA BRIGIDA CAMILA CAMILLE
CANDELA CARLA CARLOTA CARMEN CAROL CAROLINA CAROLINE CASILDA CATALINA
CATHERINE CECILIA CELIA CHARLOTTE CHLOE CLARA CLAIRE CLAUDIA CONCEPCION CONCHA
CONSUELO CORAL CRISTINA CYNTHIA DAFNE DALIA DANIELA DANIELLE DEBORA DIANA
DOLORES DOMINIQUE DONNA DORA DOROTEA EDITH ELBA ELENA ELISA ELISABET ELIZABETH
ELLA ELSA ELVIRA EMILIA EMILY EMMA ENCARNA ERICA ESMERALDA ESPERANZA ESTEFANIA
ESTELA ESTHER ESTRELLA EUGENIA EVA EVELYN FABIOLA FATIMA FELISA FERNANDA FIONA
FLORA FLORENCIA FRANCISCA GABRIELA GEMA GEMMA GENOVEVA GEORGIA GERTRUDIS GINA
GISELA GLORIA GRACE GRACIELA GRETA GUADALUPE HANNAH HELEN HELENA HILDA HOLLY
IDOIA INES INMACULADA IRENE IRIS IRMA ISABEL ISABELLA ITZIAR IVANA IVONNE JADE
JANE JANET JENNIFER JESSICA JOANNA JOSEFA JOSEFINA JOSEFINE JUANA JUDITH JULIA
JULIE JULIETA JUSTINA KAREN KATE KATHERINE KATIE LARA LAURA LEA LEIRE LEONOR
LETICIA LIDIA LILIANA LILY LINDA LOLA LORENA LORETO LOURDES LUCIA LUCY LUISA
LUZ LYDIA MABEL MACARENA MADDIE MAGDALENA MAITE MANUELA MAR MARCELA MARGARET
MARGARITA MARIA MARIANA MARIBEL MARINA MARISA MARISOL MARTA MARTINA MARY
MATILDE MELANIE MELISSA MERCEDES MERCHE MICAELA MICHELLE MILAGROS MIRIAM
MONICA MONIQUE MONTSE MONTSERRAT NADIA NANCY NATALIA NATALIE NEREA NIEVES NOA
NOELIA NOEMI NORA NURIA OFELIA OLGA OLIVIA PALOMA PAMELA PATRICIA PAULA
PENELOPE PEPA PETRA PIEDAD PILAR PRISCILA RACHEL RAQUEL REBECA REBECCA REGINA
REMEDIOS RITA ROCIO ROSA ROSALIA ROSARIO ROSE ROSSY RUTH SABRINA SALOME
SAMANTHA SANDRA SARA SARAH SASHA SILVIA SOFIA SOLEDAD SONIA SOPHIA SOPHIE
SUSAN SUSANA TAMARA TANIA TATIANA TERESA THERESA TRINIDAD VALENTINA VALERIA
VANESA VERA VERONICA VICTORIA VIOLETA VIRGINIA VIVIANA XIMENA YOLANDA ZOE
`);

/** Nombres de hombre corrientes en castellano y en inglés. */
const NOMBRES_M = conjunto(`
AARON ABEL ABRAHAM ADAM ADOLFO ADRIAN AGUSTIN AITOR ALAN ALBERT ALBERTO
ALEJANDRO ALEX ALFONSO ALFREDO ALONSO ALVARO AMADEO ANDRES ANDREW ANGEL ANIBAL
ANSELMO ANTHONY ANTONIO ARMANDO ARTHUR ARTURO AUGUSTO AURELIO BARTOLOME BENITO
BENJAMIN BERNARDO BLAS BORJA BRIAN BRUNO CALEB CAMILO CANDIDO CARLES CARLOS
CASIMIRO CESAR CHARLES CHRISTIAN CHRISTOPHER CIPRIANO CIRILO CLAUDIO CLEMENTE
CONRADO CRISTIAN CRISTOBAL DAMIAN DANIEL DARIO DAVID DIEGO DIONISIO DOMINGO
DONALD EDGAR EDUARDO EDWARD ELIAS EMILIANO EMILIO ENRIQUE ERIC ERNESTO ESTEBAN
EUGENIO EUSEBIO EZEQUIEL FABIAN FEDERICO FELIPE FELIX FERMIN FERNANDO FIDEL
FLORENTINO FRANCISCO FRANK GABRIEL GASPAR GERARDO GERMAN GILBERTO GONZALO
GREGORIO GUILLERMO GUSTAVO HECTOR HENRY HERIBERTO HERNAN HILARIO HORACIO HUGO
HUMBERTO IGNACIO IKER INDALECIO ISAAC ISIDORO ISMAEL IVAN JACK JACOBO JAIME
JAMES JASON JAVIER JEREMIAS JEREMY JEROME JESUS JOAN JOAQUIN JOEL JOHN JON
JONATHAN JORDI JORGE JOSE JOSEPH JOSHUA JUAN JULIAN JULIO JUSTO KEVIN LAZARO
LEANDRO LEO LEONARDO LEOPOLDO LORENZO LUCAS LUCIANO LUIS LUKE MANOLO MANUEL
MARC MARCELO MARCO MARCOS MARIANO MARIO MARK MARTIN MATEO MATIAS MATTHEW
MAURICIO MAXIMO MICHAEL MIGUEL MOISES NATANAEL NESTOR NICOLAS NICHOLAS NOEL
NORBERTO OLIVER OMAR ORLANDO OSCAR OSVALDO PABLO PACO PASCUAL PATRICIO PATRICK
PAUL PEDRO PEPE PETER PHILIP PLACIDO QUIQUE RAFAEL RAMIRO RAMON RAUL RAYMOND
RICARDO RICHARD ROBERT ROBERTO RODOLFO RODRIGO ROGELIO ROGER ROMAN RUBEN
RODOLFO RUFINO SALOMON SALVADOR SAMUEL SANTIAGO SAUL SEBASTIAN SERGIO SEVERINO
SILVESTRE SIMON STEVEN TEODORO TEO THOMAS TIMOTEO TOBIAS TOMAS TONI VALENTIN
VICENTE VICTOR VIRGILIO WALTER WILLIAM XAVIER YAGO ZACARIAS
`);

/** Terminaciones que en castellano cantan el género. Es la última carta. */
function porTerminacion(palabra: string): Genero {
    if (palabra.length < 4) return null;
    if (/(A|AS)$/.test(palabra)) return 'f';
    if (/(O|OS)$/.test(palabra)) return 'm';
    return null;
}

/**
 * El género de un personaje por su nombre. `null` cuando de verdad no se sabe:
 * mejor dejarlo abierto que colocarle una voz al azar con cara de acierto.
 */
export function generoDeNombre(nombre: string): Genero {
    const clave = claveDePersonaje(nombre);
    if (!clave) return null;
    // Se quitan los números de los figurantes: "HOMBRE 2", "VOZ 1".
    const palabras = clave.split(' ').map(p => p.replace(/\d+$/, '')).filter(Boolean);
    if (!palabras.length) return null;

    // 1 · El papel manda: en "MADRE DE ANA" la que habla es la madre.
    for (const p of palabras) {
        if (PAPELES_F.has(p)) return 'f';
        if (PAPELES_M.has(p)) return 'm';
    }
    // 2 · El nombre de pila, de izquierda a derecha ("JOSÉ MARÍA" es un hombre).
    for (const p of palabras) {
        if (NOMBRES_F.has(p)) return 'f';
        if (NOMBRES_M.has(p)) return 'm';
    }
    // 3 · La terminación, y sólo sobre la primera palabra.
    //
    // Aquí es donde estorba una palabra ambigua, y SÓLO aquí. Antes bastaba con
    // que apareciera en cualquier sitio del nombre para devolver "no se sabe", y
    // eso convertía a "VOZ DE HOMBRE" en un personaje sin género —se comía la
    // palabra HOMBRE, que es justo la que lo dice— y le tocaba una voz de mujer.
    if (AMBIGUOS.has(palabras[0])) return null;
    return porTerminacion(palabras[0]);
}

/**
 * El género de una VOZ del motor. Muchas lo dicen en su propia etiqueta
 * ("Bella (femenina, suave)"); las del navegador no, pero se llaman Mónica,
 * Jorge o Helena, así que valen las mismas listas.
 */
export function generoDeVoz(voz: { label?: string; id?: string }): Genero {
    const etiqueta = (voz.label || '').toLowerCase();
    // "female" contiene "male": lo femenino se mira SIEMPRE primero.
    if (/\b(femenina|femenino|female|mujer|woman|girl)\b/.test(etiqueta)) return 'f';
    if (/\b(masculina|masculino|male|hombre|man|boy)\b/.test(etiqueta)) return 'm';
    if (/\bneutra|neutral\b/.test(etiqueta)) return null;
    // Por el nombre propio de la voz: "Mónica", "Jorge", "Microsoft Helena…".
    for (const palabra of (voz.label || '').split(/[^\p{L}]+/u)) {
        const g = generoDeNombre(palabra);
        if (g) return g;
    }
    return null;
}

/**
 * Reparte las voces disponibles entre los personajes según su género, sin
 * repetir mientras queden libres.
 *
 * Cada personaje busca primero una voz de su género; si no quedan, una neutra;
 * y si tampoco, la que haya —antes que quedarse mudo—. Un personaje del que no
 * se sabe el género empieza por las neutras, que es lo honrado.
 */
export function repartirVoces<V extends { id: string; label?: string }>(
    personajes: string[],
    voces: V[],
): Record<string, string | undefined> {
    const out: Record<string, string | undefined> = {};
    if (!voces.length) {
        for (const p of personajes) out[p] = undefined;
        return out;
    }

    const cajon: Record<'f' | 'm' | 'n', V[]> = { f: [], m: [], n: [] };
    for (const v of voces) cajon[generoDeVoz(v) ?? 'n'].push(v);

    const usadas = new Set<string>();
    /** Cuántas se han repartido ya de cada cajón, para ir rotando. */
    const vuelta: Record<'f' | 'm' | 'n', number> = { f: 0, m: 0, n: 0 };

    for (const personaje of personajes) {
        const g = generoDeNombre(personaje);
        const orden: ('f' | 'm' | 'n')[] =
            g === 'f' ? ['f', 'n', 'm'] : g === 'm' ? ['m', 'n', 'f'] : ['n', 'f', 'm'];

        let elegida: V | undefined;
        // Primero, una que no tenga nadie.
        for (const c of orden) {
            elegida = cajon[c].find(v => !usadas.has(v.id));
            if (elegida) break;
        }
        // Si ya están todas cogidas, se repite rotando por su cajón preferido.
        if (!elegida) {
            const c = orden.find(x => cajon[x].length) ?? 'n';
            elegida = cajon[c][vuelta[c]++ % cajon[c].length];
        }
        if (elegida) usadas.add(elegida.id);
        out[personaje] = elegida?.id;
    }
    return out;
}
