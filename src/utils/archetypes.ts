export interface ZodiacArchetype {
    sun: string; // "El Yo"
    moon: string; // "Emoción"
    ascendant: string; // "La Máscara"
    light: string; // Virtudes
    shadow: string; // Sombras
    keywords: string[];
}

export const ZODIAC_ARCHETYPES: Record<string, ZodiacArchetype> = {
    'Aries': {
        sun: "Pionero, audaz, directo, individualista, competitivo, vital, iniciador, franco, intrépido.",
        moon: "Reactivo, impulsivo emocionalmente, apasionado, impaciente, honesto, necesita acción para sanar.",
        ascendant: "Enérgico, mirada penetrante, andar rápido, intimidante, presencia fuerte, atlético, cabeza alta.",
        light: "Valiente, heroico, emprendedor, dinámico, sincero, inspirador, independiente.",
        shadow: "Agresivo, egoísta, imprudente, colérico, dominante, belicoso, impaciente.",
        keywords: ["Iniciador", "Guerrero", "Impulsivo"]
    },
    'Tauro': {
        sun: "Estable, paciente, productivo, sensual, terco, metódico, leal, posesivo, constante.",
        moon: "Necesita seguridad, calmo, rumiante, afectuoso físicamente, resistente al cambio, gozador.",
        ascendant: "Apariencia sólida, voz agradable, movimientos lentos y deliberados, cuello fuerte, transmite paz.",
        light: "Confiable, generoso, artístico, sereno, constructor, perseverante, hedonista sano.",
        shadow: "Avaro, perezoso, inflexible, materialista, indulgente en exceso, obstinado.",
        keywords: ["Estable", "Constructor", "Posesivo"]
    },
    'Géminis': {
        sun: "Versátil, curioso, comunicativo, intelectual, dual, disperso, ingenioso, sociable, rápido.",
        moon: "Racionaliza emociones, inquieto, necesita verbalizar, adaptable, nervioso, desconectado a veces.",
        ascendant: "Juvenil, gestual, delgado o ágil, mirada curiosa, hablador, nervioso, transmite inteligencia.",
        light: "Brillante, elocuente, adaptable, divertido, lógico, conector, multifacético.",
        shadow: "Superficial, inconstante, mentiroso, chismoso, ansioso, poco fiable, manipulador verbal.",
        keywords: ["Comunicador", "Versátil", "Inquieto"]
    },
    'Cáncer': {
        sun: "Nutridor, protector, sensible, tenaz, familiar, intuitivo, cauteloso, receptivo, nostálgico.",
        moon: "Hipersensible, absorbente, defensivo, 'madre' de otros, memoria emocional, cambiante, cíclico.",
        ascendant: "Cara redonda/lunar, mirada acuosa, apariencia suave, tímido al principio, acogedor, empático.",
        light: "Empático, compasivo, leal, imaginativo, cuidador, intuitivo, devoto.",
        shadow: "Manipulador emocional, rencoroso, dependiente, victimista, caprichoso, cerrado.",
        keywords: ["Cuidador", "Sensible", "Protector"]
    },
    'Leo': {
        sun: "Carismático, radiante, orgulloso, creativo, líder, teatral, generoso, autoritario, digno.",
        moon: "Dramático, necesita reconocimiento, cálido, leal afectivamente, corazón noble, susceptible al orgullo.",
        ascendant: "Melena o cabello llamativo, postura regia, sonrisa brillante, llama la atención, cálido, dominante.",
        light: "Magnánimo, protector, alegre, confiado, leal, auto-expresivo, noble.",
        shadow: "Arrogante, vanidoso, tiránico, egocéntrico, demandante de atención, pomposo.",
        keywords: ["Líder", "Carismático", "Dramático"]
    },
    'Virgo': {
        sun: "Analítico, servicial, perfeccionista, humilde, detallista, práctico, ordenado, crítico, eficiente.",
        moon: "Necesita sentirse útil, analiza sentimientos, reservado, hipocondríaco emocional, rutinario.",
        ascendant: "Aspecto pulcro, mirada observadora, discreto, modesto, juvenil, facciones finas, servicial.",
        light: "Discernidor, purificador, sanador, modesto, diligente, lógico, preciso.",
        shadow: "Quisquilloso, neurótico, frío, escéptico, exigente, inseguro, obsesivo.",
        keywords: ["Analítico", "Servicial", "Crítico"]
    },
    'Libra': {
        sun: "Diplomático, estético, equilibrado, indeciso, sociable, encantador, justiciero, cooperativo.",
        moon: "Necesita compañía, evita el conflicto, complaciente, romántico, busca armonía a toda costa.",
        ascendant: "Simetría facial, sonrisa encantadora, estilo elegante, amable, coqueto, diplomático, suave.",
        light: "Pacificador, artístico, imparcial, refinado, compañero ideal, gracioso.",
        shadow: "Pasivo-agresivo, dependiente, superficial, vano, evasivo, incapaz de decidir.",
        keywords: ["Diplomático", "Estético", "Indeciso"]
    },
    'Escorpio': {
        sun: "Intenso, magnético, transformador, profundo, extremista, investigador, resiliente, estratégico.",
        moon: "Pasional, posesivo, devorador, leal hasta la muerte, reservado, intuitivo, vengativo si es herido.",
        ascendant: "Mirada penetrante/hipnótica, presencia misteriosa, intimidante, sexual, reservado, controlado.",
        light: "Sanador, profundo, renacedor, perspicaz, comprometido, poderoso, psicólogo natural.",
        shadow: "Destructivo, celoso, paranoico, cruel, manipulador de poder, obsesivo, rencoroso.",
        keywords: ["Intenso", "Transformador", "Misterioso"]
    },
    'Sagitario': {
        sun: "Expansivo, filósofo, aventurero, optimista, exagerado, libre, dogmático, entusiasta, buscador.",
        moon: "Necesita libertad, optimista por defecto, huye del dolor, honesto, aventurero emocional, inquieto.",
        ascendant: "Sonrisa amplia, caderas/muslos fuertes, torpe o grandilocuente, jovial, informal, 'alma de la fiesta'.",
        light: "Sabio, jovial, inspirador, honesto, visionario, maestro, multicultural.",
        shadow: "Fanático, irresponsable, táctico, inconstante, moralista, 'sabelotodo'.",
        keywords: ["Expansivo", "Filósofo", "Aventurero"]
    },
    'Capricornio': {
        sun: "Ambicioso, estructurado, responsable, autoritario, prudente, disciplinado, trabajador, serio.",
        moon: "Contenido, emocionalmente maduro (o reprimido), necesita respeto, autosuficiente, melancólico.",
        ascendant: "Estructura ósea marcada, serio, competente, aspecto maduro, reservado, transmite autoridad/frialdad.",
        light: "Integro, paciente, líder, proveedor, realista, sabio anciano, cumplidor.",
        shadow: "Pesimista, rígido, frío, calculador, materialista, depresivo, implacable.",
        keywords: ["Ambicioso", "Estructurado", "Serio"]
    },
    'Acuario': {
        sun: "Original, rebelde, humanitario, desapegado, innovador, impredecible, intelectual, fijo en ideas.",
        moon: "Desapegado emocionalmente, necesita espacio, racionaliza el sentir, amistoso pero distante, libre.",
        ascendant: "Excéntrico en vestir o actuar, distante, amistoso pero impersonal, eléctrico, único, inusual.",
        light: "Genio, altruista, progresista, tolerante, fraterno, objetivo, visionario.",
        shadow: "Frío, distante, anárquico, terco mentalmente, elitista intelectual, errático.",
        keywords: ["Original", "Rebelde", "Innovador"]
    },
    'Piscis': {
        sun: "Soñador, compasivo, místico, confuso, artístico, espiritual, permeable, evasivo, sacrificado.",
        moon: "Esponja psíquica, empático sin límites, soñador, escapista, sensible, necesita soledad para recargar.",
        ascendant: "Ojos grandes/soñadores, apariencia etérea, suave, camaleónico, difícil de definir, transmite dulzura.",
        light: "Sanador espiritual, imaginativo, desinteresado, poético, unificador, amable.",
        shadow: "Caótico, víctima, adictivo, mentiroso (por evadir), iluso, sin identidad propia.",
        keywords: ["Soñador", "Místico", "Empático"]
    }
};
