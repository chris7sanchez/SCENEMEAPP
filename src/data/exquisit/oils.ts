export const aceites = {
    // Aceites para cada signo del zodiaco
    signos: {
        'Aries': {
            principal: 'Clavo',
            secundarios: ['Jengibre', 'Pimienta negra', 'Canela', 'Romero'],
            propiedades: 'Estimulante, energizante, fortalece el coraje y la acción',
            chakra: 'Plexo Solar',
            elemento: 'Fire'
        },
        'Tauro': {
            principal: 'Sándalo',
            secundarios: ['Rosa', 'Pachulí', 'Vainilla', 'Ylang-Ylang'],
            propiedades: 'Sensual, estabilizador, conecta con la tierra y la abundancia',
            chakra: 'Raíz',
            elemento: 'Earth'
        },
        'Géminis': {
            principal: 'Canela',
            secundarios: ['Lavanda', 'Menta', 'Bergamota', 'Eucalipto'],
            propiedades: 'Claridad mental, comunicación, agilidad de pensamiento',
            chakra: 'Garganta',
            elemento: 'Air'
        },
        'Cáncer': {
            principal: 'Lirio',
            secundarios: ['Jazmín', 'Manzanilla Romana', 'Sándalo', 'Rosa'],
            propiedades: 'Protección emocional, nutrición del alma, conexión lunar',
            chakra: 'Corazón',
            elemento: 'Water'
        },
        'Leo': {
            principal: 'Menta',
            secundarios: ['Neroli', 'Incienso', 'Naranja', 'Clavo'],
            propiedades: 'Confianza, liderazgo, vitalidad solar, poder personal',
            chakra: 'Plexo Solar',
            elemento: 'Fire'
        },
        'Virgo': {
            principal: 'Enebro',
            secundarios: ['Ciprés', 'Eucalipto', 'Lavanda', 'Menta'],
            propiedades: 'Purificación, orden, precisión, sanación',
            chakra: 'Plexo Solar',
            elemento: 'Earth'
        },
        'Libra': {
            principal: 'Rosa',
            secundarios: ['Ylang-Ylang', 'Geranio', 'Palmarosa', 'Jazmín'],
            propiedades: 'Armonía, equilibrio, belleza, relaciones',
            chakra: 'Corazón',
            elemento: 'Air'
        },
        'Escorpio': {
            principal: 'Coco',
            secundarios: ['Pachulí', 'Vetiver', 'Mirra', 'Sándalo'],
            propiedades: 'Transformación profunda, poder oculto, regeneración',
            chakra: 'Sacro',
            elemento: 'Water'
        },
        'Sagitario': {
            principal: 'Jazmín',
            secundarios: ['Cardamomo', 'Salvia', 'Cedro', 'Incienso'],
            propiedades: 'Expansión, sabiduría, optimismo, aventura espiritual',
            chakra: 'Tercer Ojo',
            elemento: 'Fire'
        },
        'Capricornio': {
            principal: 'Romero',
            secundarios: ['Cedro', 'Vetiver', 'Ciprés', 'Pachulí'],
            propiedades: 'Estructura, disciplina, longevidad, manifestación',
            chakra: 'Raíz',
            elemento: 'Earth'
        },
        'Acuario': {
            principal: 'Pachulí',
            secundarios: ['Neroli', 'Lavanda', 'Incienso', 'Menta'],
            propiedades: 'Innovación, liberación, conexión cósmica, intuición',
            chakra: 'Tercer Ojo',
            elemento: 'Air'
        },
        'Piscis': {
            principal: 'Violeta',
            secundarios: ['Jazmín', 'Sándalo', 'Ylang-Ylang', 'Rosa'],
            propiedades: 'Misticismo, compasión, conexión espiritual, sueños',
            chakra: 'Corona',
            elemento: 'Water'
        }
    },

    // Aceites para equilibrar casas vacías
    casas: {
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
    },

    // Propiedades terapéuticas científicas
    propiedades: {
        'Lavanda': {
            cientifico: 'Linalol, acetato de linalilo',
            efectos: 'Aumenta serotonina, reduce ansiedad, mejora sueño',
            usos: 'Ansiedad, insomnio, cicatrización, dolor muscular',
            emocion_negativa: 'No oído',
            emocion_positiva: 'Expresado'
        },
        'Rosa': {
            cientifico: 'Geraniol, citronelol, nerol',
            efectos: 'Antidepresivo, equilibrio hormonal, rejuvenecedor',
            usos: 'Depresión, equilibrio emocional, piel seca',
            emocion_negativa: 'Aislado',
            emocion_positiva: 'Amado'
        },
        'Jazmín': {
            cientifico: 'Acetato de bencilo, linalol',
            efectos: 'Aumenta melatonina, antidepresivo, afrodisíaco',
            usos: 'Depresión, insomnio, ansiedad, frigidez',
            emocion_negativa: 'Obstaculizado',
            emocion_positiva: 'Liberado'
        },
        'Menta': {
            cientifico: 'Mentol, mentona',
            efectos: 'Analgésico, mejora concentración, inhibe acetilcolinesterasa',
            usos: 'Dolor muscular, migrañas, concentración',
            emocion_negativa: 'Obstaculizado',
            emocion_positiva: 'Vigoroso'
        },
        'Romero': {
            cientifico: '1,8-cineol, alcanfor',
            efectos: 'Aumenta oxigenación cerebral, memoria, cognitivo',
            usos: 'Memoria, concentración, dolor articular',
            emocion_negativa: 'Confundido',
            emocion_positiva: 'Mente abierta'
        },
        'Eucalipto': {
            cientifico: '1,8-cineol, alfa-pineno',
            efectos: 'Broncodilatador, antiinflamatorio, antibacteriano',
            usos: 'Congestión, dolor muscular, infecciones respiratorias',
            emocion_negativa: 'Congestionado',
            emocion_positiva: 'Estimulado'
        },
        'Bergamota': {
            cientifico: 'Linalol, acetato de linalilo',
            efectos: 'Reduce cortisol, ansiolítico, mejora ánimo',
            usos: 'Ansiedad, estrés, depresión',
            emocion_negativa: 'Insuficiente',
            emocion_positiva: 'Digno'
        },
        'Ylang-Ylang': {
            cientifico: 'Linalol, geraniol',
            efectos: 'Reduce presión arterial, afrodisíaco, equilibrio emocional',
            usos: 'Hipertensión, ansiedad, libido baja',
            emocion_negativa: 'Agobiado',
            emocion_positiva: 'Exuberante'
        },
        'Pachulí': {
            cientifico: 'Patchoulol, alfa-bulneseno',
            efectos: 'Antidepresivo, afrodisíaco, regenerador celular',
            usos: 'Depresión, libido, piel envejecida',
            emocion_negativa: 'Degradado',
            emocion_positiva: 'Mejorado'
        },
        'Incienso': {
            cientifico: 'Alfa-pineno, limoneno',
            efectos: 'Reduce ansiedad, antiinflamatorio, meditación',
            usos: 'Ansiedad, inflamación, práctica espiritual',
            emocion_negativa: 'Separado',
            emocion_positiva: 'Unificado'
        },
        'Sándalo': {
            cientifico: 'Santalol',
            efectos: 'Ansiolítico, meditativo, afrodisíaco',
            usos: 'Ansiedad, meditación, conexión espiritual',
            emocion_negativa: 'No inspirado',
            emocion_positiva: 'Devoto'
        },
        'Neroli': {
            cientifico: 'Linalol, limoneno',
            efectos: 'Aumenta serotonina, regenerador celular',
            usos: 'Ansiedad, insomnio, piel madura',
            emocion_negativa: 'Agotado',
            emocion_positiva: 'Lleno de luz'
        }
    }
};
