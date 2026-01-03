// EXQUISIT - Alchemical Perfumery Data
// Base de datos completa de aceites esenciales con propiedades científicas y astrológicas

const ACEITES_SIGNOS = {
    'Aries': {
        principal: 'Clavo',
        secundarios: ['Jengibre', 'Pimienta negra', 'Canela', 'Romero'],
        propiedades: 'Estimulante, energizante, fortalece el coraje y la acción',
        chakra: 'Plexo Solar',
        elemento: 'Fuego',
        cientifico: 'Eugenol, acetato de eugenol',
        efectos: 'Analgésico, antimicrobiano, estimulante circulatorio'
    },
    'Tauro': {
        principal: 'Sándalo',
        secundarios: ['Rosa', 'Pachulí', 'Vainilla', 'Ylang-Ylang'],
        propiedades: 'Sensual, estabilizador, conecta con la tierra y la abundancia',
        chakra: 'Raíz',
        elemento: 'Tierra',
        cientifico: 'Santalol, alfa-santalol',
        efectos: 'Ansiolítico, meditativo, afrodisíaco natural'
    },
    'Géminis': {
        principal: 'Menta',
        secundarios: ['Lavanda', 'Bergamota', 'Eucalipto', 'Canela'],
        propiedades: 'Claridad mental, comunicación, agilidad de pensamiento',
        chakra: 'Garganta',
        elemento: 'Aire',
        cientifico: 'Mentol, mentona, limoneno',
        efectos: 'Mejora concentración, analgésico, alivia migrañas'
    },
    'Cáncer': {
        principal: 'Jazmín',
        secundarios: ['Manzanilla Romana', 'Sándalo', 'Rosa', 'Neroli'],
        propiedades: 'Protección emocional, nutrición del alma, conexión lunar',
        chakra: 'Corazón',
        elemento: 'Agua',
        cientifico: 'Acetato de bencilo, linalol, indol',
        efectos: 'Antidepresivo, aumenta melatonina, afrodisíaco'
    },
    'Leo': {
        principal: 'Neroli',
        secundarios: ['Incienso', 'Naranja', 'Clavo', 'Menta'],
        propiedades: 'Confianza, liderazgo, vitalidad solar, poder personal',
        chakra: 'Plexo Solar',
        elemento: 'Fuego',
        cientifico: 'Linalol, limoneno, acetato de linalilo',
        efectos: 'Aumenta serotonina, regenerador celular, anti-ansiedad'
    },
    'Virgo': {
        principal: 'Lavanda',
        secundarios: ['Ciprés', 'Eucalipto', 'Menta', 'Enebro'],
        propiedades: 'Purificación, orden, precisión, sanación',
        chakra: 'Plexo Solar',
        elemento: 'Tierra',
        cientifico: 'Linalol, acetato de linalilo, terpineol',
        efectos: 'Aumenta serotonina, reduce ansiedad, mejora sueño'
    },
    'Libra': {
        principal: 'Rosa',
        secundarios: ['Ylang-Ylang', 'Geranio', 'Palmarosa', 'Jazmín'],
        propiedades: 'Armonía, equilibrio, belleza, relaciones',
        chakra: 'Corazón',
        elemento: 'Aire',
        cientifico: 'Geraniol, citronelol, nerol, damascenona',
        efectos: 'Antidepresivo, equilibrio hormonal, rejuvenecedor'
    },
    'Escorpio': {
        principal: 'Pachulí',
        secundarios: ['Vetiver', 'Mirra', 'Sándalo', 'Incienso'],
        propiedades: 'Transformación profunda, poder oculto, regeneración',
        chakra: 'Sacro',
        elemento: 'Agua',
        cientifico: 'Patchoulol, alfa-bulneseno, pogostol',
        efectos: 'Antidepresivo, afrodisíaco, regenerador celular'
    },
    'Sagitario': {
        principal: 'Incienso',
        secundarios: ['Cardamomo', 'Salvia', 'Cedro', 'Jazmín'],
        propiedades: 'Expansión, sabiduría, optimismo, aventura espiritual',
        chakra: 'Tercer Ojo',
        elemento: 'Fuego',
        cientifico: 'Alfa-pineno, limoneno, beta-cariofileno',
        efectos: 'Reduce ansiedad, antiinflamatorio, meditación profunda'
    },
    'Capricornio': {
        principal: 'Vetiver',
        secundarios: ['Cedro', 'Ciprés', 'Pachulí', 'Romero'],
        propiedades: 'Estructura, disciplina, longevidad, manifestación',
        chakra: 'Raíz',
        elemento: 'Tierra',
        cientifico: 'Vetiverrol, alfa-vetivona, khusimol',
        efectos: 'Grounding profundo, reduce ansiedad, estimula circulación'
    },
    'Acuario': {
        principal: 'Eucalipto',
        secundarios: ['Neroli', 'Lavanda', 'Incienso', 'Menta'],
        propiedades: 'Innovación, liberación, conexión cósmica, intuición',
        chakra: 'Tercer Ojo',
        elemento: 'Aire',
        cientifico: '1,8-cineol, alfa-pineno, limoneno',
        efectos: 'Broncodilatador, antiinflamatorio, claridad mental'
    },
    'Piscis': {
        principal: 'Ylang-Ylang',
        secundarios: ['Jazmín', 'Sándalo', 'Rosa', 'Mirra'],
        propiedades: 'Misticismo, compasión, conexión espiritual, sueños',
        chakra: 'Corona',
        elemento: 'Agua',
        cientifico: 'Linalol, geraniol, germacreno',
        efectos: 'Reduce presión arterial, afrodisíaco, equilibrio emocional'
    }
};

const ACEITES_CASAS = {
    1: { nombre: 'Identidad y Apariencia', aceites: ['Bergamota', 'Naranja', 'Limón'], proposito: 'Despertar tu esencia auténtica y presencia' },
    2: { nombre: 'Recursos y Valores', aceites: ['Pachulí', 'Vetiver', 'Canela'], proposito: 'Anclar la abundancia y valorarte' },
    3: { nombre: 'Comunicación', aceites: ['Menta', 'Eucalipto', 'Romero'], proposito: 'Claridad mental y expresión' },
    4: { nombre: 'Hogar y Raíces', aceites: ['Sándalo', 'Vainilla', 'Rosa'], proposito: 'Seguridad emocional y arraigo' },
    5: { nombre: 'Creatividad y Placer', aceites: ['Ylang-Ylang', 'Jazmín', 'Naranja'], proposito: 'Expresión auténtica y alegría' },
    6: { nombre: 'Salud y Servicio', aceites: ['Lavanda', 'Eucalipto', 'Menta'], proposito: 'Sanación y rutinas saludables' },
    7: { nombre: 'Relaciones', aceites: ['Rosa', 'Geranio', 'Ylang-Ylang'], proposito: 'Armonía interpersonal y amor' },
    8: { nombre: 'Transformación', aceites: ['Mirra', 'Incienso', 'Cedro'], proposito: 'Renacimiento y poder personal' },
    9: { nombre: 'Expansión y Filosofía', aceites: ['Salvia', 'Cedro', 'Incienso'], proposito: 'Sabiduría superior y visión' },
    10: { nombre: 'Propósito y Carrera', aceites: ['Romero', 'Ciprés', 'Laurel'], proposito: 'Manifestación del destino' },
    11: { nombre: 'Comunidad y Sueños', aceites: ['Neroli', 'Lavanda', 'Bergamota'], proposito: 'Conexión colectiva y visión' },
    12: { nombre: 'Espiritualidad', aceites: ['Incienso', 'Mirra', 'Sándalo'], proposito: 'Trascendencia y conexión divina' }
};

const PROPIEDADES_ACEITES = {
    'Lavanda': {
        cientifico: 'Linalol, acetato de linalilo',
        efectos: 'Aumenta serotonina, reduce ansiedad, mejora sueño',
        usos: 'Ansiedad, insomnio, cicatrización, dolor muscular',
        emocionNegativa: 'No oído',
        emocionPositiva: 'Expresado'
    },
    'Rosa': {
        cientifico: 'Geraniol, citronelol, nerol',
        efectos: 'Antidepresivo, equilibrio hormonal, rejuvenecedor',
        usos: 'Depresión, equilibrio emocional, piel seca',
        emocionNegativa: 'Aislado',
        emocionPositiva: 'Amado'
    },
    'Jazmín': {
        cientifico: 'Acetato de bencilo, linalol',
        efectos: 'Aumenta melatonina, antidepresivo, afrodisíaco',
        usos: 'Depresión, insomnio, ansiedad, frigidez',
        emocionNegativa: 'Obstaculizado',
        emocionPositiva: 'Liberado'
    },
    'Menta': {
        cientifico: 'Mentol, mentona',
        efectos: 'Analgésico, mejora concentración, inhibe acetilcolinesterasa',
        usos: 'Dolor muscular, migrañas, concentración',
        emocionNegativa: 'Obstaculizado',
        emocionPositiva: 'Vigoroso'
    },
    'Romero': {
        cientifico: '1,8-cineol, alcanfor',
        efectos: 'Aumenta oxigenación cerebral, memoria, cognitivo',
        usos: 'Memoria, concentración, dolor articular',
        emocionNegativa: 'Confundido',
        emocionPositiva: 'Mente abierta'
    },
    'Bergamota': {
        cientifico: 'Linalol, acetato de linalilo',
        efectos: 'Reduce cortisol, ansiolítico, mejora ánimo',
        usos: 'Ansiedad, estrés, depresión',
        emocionNegativa: 'Insuficiente',
        emocionPositiva: 'Digno'
    },
    'Incienso': {
        cientifico: 'Alfa-pineno, limoneno',
        efectos: 'Reduce ansiedad, antiinflamatorio, meditación',
        usos: 'Ansiedad, inflamación, práctica espiritual',
        emocionNegativa: 'Separado',
        emocionPositiva: 'Unificado'
    },
    'Sándalo': {
        cientifico: 'Santalol',
        efectos: 'Ansiolítico, meditativo, afrodisíaco',
        usos: 'Ansiedad, meditación, conexión espiritual',
        emocionNegativa: 'No inspirado',
        emocionPositiva: 'Devoto'
    },
    'Pachulí': {
        cientifico: 'Patchoulol, alfa-bulneseno',
        efectos: 'Antidepresivo, afrodisíaco, regenerador celular',
        usos: 'Depresión, libido, piel envejecida',
        emocionNegativa: 'Degradado',
        emocionPositiva: 'Mejorado'
    },
    'Neroli': {
        cientifico: 'Linalol, limoneno',
        efectos: 'Aumenta serotonina, regenerador celular',
        usos: 'Ansiedad, insomnio, piel madura',
        emocionNegativa: 'Agotado',
        emocionPositiva: 'Lleno de luz'
    },
    'Ylang-Ylang': {
        cientifico: 'Linalol, geraniol',
        efectos: 'Reduce presión arterial, afrodisíaco, equilibrio emocional',
        usos: 'Hipertensión, ansiedad, libido baja',
        emocionNegativa: 'Agobiado',
        emocionPositiva: 'Exuberante'
    },
    'Eucalipto': {
        cientifico: '1,8-cineol, alfa-pineno',
        efectos: 'Broncodilatador, antiinflamatorio, antibacteriano',
        usos: 'Congestión, dolor muscular, infecciones respiratorias',
        emocionNegativa: 'Congestionado',
        emocionPositiva: 'Estimulado'
    },
    'Vetiver': {
        cientifico: 'Vetiverrol, alfa-vetivona',
        efectos: 'Grounding profundo, ansiolítico, mejora circulación',
        usos: 'Ansiedad, TDAH, insomnio, conexión a tierra',
        emocionNegativa: 'Disperso',
        emocionPositiva: 'Centrado'
    },
    'Cedro': {
        cientifico: 'Alfa-cedreno, cedriol',
        efectos: 'Sedante, expectorante, repelente natural',
        usos: 'Insomnio, congestión respiratoria, concentración',
        emocionNegativa: 'Inseguro',
        emocionPositiva: 'Protegido'
    },
    'Mirra': {
        cientifico: 'Curzereno, furanoeudesma',
        efectos: 'Antiinflamatorio, antimicrobiano, meditativo',
        usos: 'Infecciones, meditación, cicatrización',
        emocionNegativa: 'Desconectado',
        emocionPositiva: 'Sagrado'
    }
};

// Función para calcular signo zodiacal
function calcularSigno(dia, mes) {
    const fechas = [
        { signo: 'Capricornio', hasta: [1, 19] },
        { signo: 'Acuario', hasta: [2, 18] },
        { signo: 'Piscis', hasta: [3, 20] },
        { signo: 'Aries', hasta: [4, 19] },
        { signo: 'Tauro', hasta: [5, 20] },
        { signo: 'Géminis', hasta: [6, 20] },
        { signo: 'Cáncer', hasta: [7, 22] },
        { signo: 'Leo', hasta: [8, 22] },
        { signo: 'Virgo', hasta: [9, 22] },
        { signo: 'Libra', hasta: [10, 22] },
        { signo: 'Escorpio', hasta: [11, 21] },
        { signo: 'Sagitario', hasta: [12, 21] },
        { signo: 'Capricornio', hasta: [12, 31] }
    ];

    for (let i = 0; i < fechas.length; i++) {
        if (mes < fechas[i].hasta[0] || (mes === fechas[i].hasta[0] && dia <= fechas[i].hasta[1])) {
            return fechas[i].signo;
        }
    }
    return 'Capricornio';
}

// Exponer globalmente para navegador
if (typeof window !== 'undefined') {
    window.ACEITES_SIGNOS = ACEITES_SIGNOS;
    window.ACEITES_CASAS = ACEITES_CASAS;
    window.PROPIEDADES_ACEITES = PROPIEDADES_ACEITES;
    window.calcularSigno = calcularSigno;
}

// Exportar para uso en app (CommonJS)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ACEITES_SIGNOS,
        ACEITES_CASAS,
        PROPIEDADES_ACEITES,
        calcularSigno
    };
}
